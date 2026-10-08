#!/usr/bin/env bash
#
# Lints the shell scripts with ShellCheck, the GitHub Actions workflows with actionlint (which
# also runs ShellCheck on their "run:" blocks), and the JavaScript of the status page (site/*.js)
# with Biome. That page shows text that comes from DNS records and from resolvers, so a Biome
# plugin also fails on the few things that turn text into HTML or code (see biome.jsonc), and the
# plugin itself is tested. It is what the Lint workflow runs on pull requests.
#
# Usage: scripts/lint.sh
#
# Requires Docker. The tools run from their official images, pinned by tag and digest so that a
# new release cannot turn a pull request red by surprise. The pins are in docker/lint.Dockerfile,
# which is never built: Dependabot keeps its FROM lines up to date, and this script reads them.
#
# Only the files tracked by Git are linted (git add a new file first). The other .js files of the
# repository are dnscontrol configuration, not JavaScript that a browser or Node runs.

set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1

# image NAME: the image of the "FROM image AS NAME" line of docker/lint.Dockerfile.
image() {
  local ref
  if [ ! -r docker/lint.Dockerfile ]; then
    echo "docker/lint.Dockerfile not found" >&2
    return 1
  fi
  ref=$(sed -nE "s/^FROM[[:space:]]+([^[:space:]]+)[[:space:]]+AS[[:space:]]+$1[[:space:]]*\$/\1/p" docker/lint.Dockerfile)
  if [ -z "$ref" ]; then
    echo "docker/lint.Dockerfile has no \"FROM image AS $1\" line" >&2
    return 1
  fi
  echo "$ref"
}

SHELLCHECK_IMAGE=$(image shellcheck) || exit 1
ACTIONLINT_IMAGE=$(image actionlint) || exit 1
BIOME_IMAGE=$(image biome) || exit 1
status=0

echo "ShellCheck ($SHELLCHECK_IMAGE): $(git ls-files '*.sh' | tr '\n' ' ')"
if git ls-files -z '*.sh' | xargs -0 docker run --rm -v "$PWD:/mnt" -w /mnt "$SHELLCHECK_IMAGE"; then
  echo "ShellCheck: clean"
else
  status=1
fi

echo "actionlint ($ACTIONLINT_IMAGE): $(git ls-files '.github/workflows' | tr '\n' ' ')"
if docker run --rm -v "$PWD:/repo" -w /repo "$ACTIONLINT_IMAGE" -color=false; then
  echo "actionlint: clean"
else
  status=1
fi

# Warnings fail the check, like ShellCheck's findings do. The style suggestions that Biome shows
# as information (such as preferring template literals to concatenation) are left out.
echo "Biome ($BIOME_IMAGE): $(git ls-files 'site/*.js' | tr '\n' ' ')"
if git ls-files -z 'site/*.js' |
  xargs -0 docker run --rm -v "$PWD:/work" -w /work "$BIOME_IMAGE" lint --diagnostic-level=warn --error-on-warnings; then
  echo "Biome: clean"
else
  status=1
fi

# The status page shows notes and record values that come from outside: it may only set text.
# The Biome run above enforces that with a plugin (.biome/no-html-sinks.grit, loaded by
# biome.jsonc). A plugin that quietly stops matching is worse than none, and a first draft of this
# one did, so check here that it still flags every line marked "// sink" of the bad examples, and
# no error in the good ones. A Biome update that breaks the rule fails here instead of passing.
biome() { docker run --rm -v "$PWD:/work" -w /work "$BIOME_IMAGE" "$@"; }
expected=$(grep -n '// sink$' .biome/fixtures/bad.js | cut -d: -f1)
flagged=$(biome lint --diagnostic-level=error --max-diagnostics=500 --reporter=github .biome/fixtures/bad.js 2>/dev/null |
  sed -n 's/.*,line=\([0-9]*\),.*/\1/p')
missed=''
for line in $expected; do
  case $'\n'"$flagged"$'\n' in
    *$'\n'"$line"$'\n'*) ;;
    *) missed="$missed $line" ;;
  esac
done
if [ -z "$expected" ]; then
  echo "HTML sinks rule: no example is marked \"// sink\" in .biome/fixtures/bad.js"
  status=1
elif [ -n "$missed" ]; then
  echo "HTML sinks rule: it no longer flags these lines of .biome/fixtures/bad.js:$missed"
  status=1
elif ! biome lint --diagnostic-level=error .biome/fixtures/good.js >/dev/null 2>&1; then
  echo "HTML sinks rule: it flags something in .biome/fixtures/good.js"
  status=1
else
  echo "HTML sinks rule: flags all $(echo "$expected" | wc -w | tr -d ' ') bad examples, none of the good ones"
fi

exit "$status"

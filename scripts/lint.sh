#!/usr/bin/env bash
#
# Lints the shell scripts with ShellCheck, and the GitHub Actions workflows with actionlint (which
# also runs ShellCheck on their "run:" blocks). It is what the Lint workflow runs on pull requests.
#
# Usage: scripts/lint.sh
#
# Requires Docker. The tools run from their official images, pinned by tag and digest so that a
# new release cannot turn a pull request red by surprise. The pins are in docker/lint.Dockerfile,
# which is never built: Dependabot keeps its FROM lines up to date, and this script reads them.

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

exit "$status"

#!/usr/bin/env bash
#
# Lints the shell scripts with ShellCheck, and the GitHub Actions workflows with actionlint (which
# also runs ShellCheck on their "run:" blocks). It is what the Lint workflow runs on pull requests.
#
# Usage: scripts/lint.sh
#
# Requires Docker. The tools run from their official images, pinned by tag and digest so that a
# new release cannot turn a pull request red by surprise. To update one, pick the new tag, take its
# digest from "docker buildx imagetools inspect IMAGE:TAG", and change both below.

set -uo pipefail

SHELLCHECK_IMAGE=koalaman/shellcheck:v0.11.0@sha256:61862eba1fcf09a484ebcc6feea46f1782532571a34ed51fedf90dd25f925a8d
ACTIONLINT_IMAGE=rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667

cd "$(dirname "${BASH_SOURCE[0]}")/.." || exit 1
status=0

echo "ShellCheck: $(git ls-files '*.sh' | tr '\n' ' ')"
if git ls-files -z '*.sh' | xargs -0 docker run --rm -v "$PWD:/mnt" -w /mnt "$SHELLCHECK_IMAGE"; then
  echo "ShellCheck: clean"
else
  status=1
fi

echo "actionlint: $(git ls-files '.github/workflows' | tr '\n' ' ')"
if docker run --rm -v "$PWD:/repo" -w /repo "$ACTIONLINT_IMAGE" -color=false; then
  echo "actionlint: clean"
else
  status=1
fi

exit "$status"

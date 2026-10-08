#!/usr/bin/env bash
#
# Pings a heartbeat monitor (a dead man's switch, such as Healthchecks.io) to say that a scheduled
# workflow ran. The monitor alerts when the pings stop, which is how a schedule that quietly
# stopped running gets noticed: nothing else would tell.
#
# Usage: HEARTBEAT_URL=https://hc-ping.com/<uuid> scripts/heartbeat.sh
#
# It never fails: a monitor that is down must not turn the monitoring red. When the URL is not
# set (the secret is not configured yet), it only says so. The URL is a secret: anybody who has
# it can send pings for the check, so it is never printed.

set -uo pipefail

# A secret pasted with a trailing newline or spaces would make the URL invalid.
url=$(printf '%s' "${HEARTBEAT_URL:-}" | tr -d '[:space:]')

if [ -z "$url" ]; then
  echo "::notice title=Heartbeat::Not configured: the heartbeat secret of this workflow is empty"
  exit 0
fi

case $url in
  https://* | http://*) ;;
  *)
    echo "::warning title=Heartbeat::The heartbeat secret is not an http(s) URL, nothing was sent"
    exit 0
    ;;
esac

# --fail turns an HTTP error into a failure, and --retry covers timeouts, 5xx errors and refused
# connections. Only the last error is kept: curl prints one per attempt.
if err=$(curl --silent --show-error --fail --max-time 10 --retry 5 --retry-delay 2 --retry-connrefused \
  --output /dev/null -- "$url" 2>&1); then
  echo "Heartbeat sent"
else
  err=${err//"$url"/***}
  echo "::warning title=Heartbeat::The ping failed (${err##*$'\n'}). The monitor alerts if the pings stay missing."
fi

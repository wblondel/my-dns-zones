#!/usr/bin/env bash
#
# Keeps one GitHub issue per problem: it opens an issue when a domain starts failing, keeps it up
# to date while it fails, and closes it once the problem is gone. A problem that lasts for weeks
# then costs one notification when it opens and one when it is resolved, instead of one failed
# run notification every day.
#
# Usage: scripts/sync-issues.sh SOURCE FILE
#   domain-health  FILE is the status.json written by scripts/domain-health.sh. A problem is a
#                  domain whose result is FAIL. Warnings never open an issue: they only show on
#                  the status page.
#   dns-drift      FILE is the report of "dnscontrol preview --report". A problem is a domain
#                  with corrections.
#   zonemaster     FILE is the report written by scripts/zonemaster.sh. A problem is a domain
#                  with an error (FAIL). Warnings never open an issue: they are in the run summary.
#                  A domain that could not be scanned is left alone: its issue is neither updated
#                  nor closed, and the script exits 1 once the others are done.
#
# The issues of a source carry its label, and a hidden marker with the source and the domain in
# their body, which is how an issue is found again. Editing an issue notifies nobody, so an open
# issue is refreshed on every run without noise. A new issue is assigned to the owner of the
# repository, which is what notifies them, and closing an issue adds a comment, which notifies
# them too.
#
# It never closes anything when it cannot read FILE, when FILE has no domain, or when the step
# that wrote FILE failed without reporting a problem: a check that did not run is not a problem
# that went away. It exits 1 in those cases, and when GitHub refuses a call, so that the run fails
# and GitHub's own notification tells you.
#
# Environment:
#   GH_TOKEN                    token with the "issues: write" permission (GITHUB_TOKEN works)
#   GITHUB_REPOSITORY           owner/name of the repository
#   STEP_OUTCOME                outcome of the step that wrote FILE (success or failure)
#   GITHUB_RUN_ID, GITHUB_SERVER_URL  to link to the run (optional)
#   ISSUE_ASSIGNEE              who new issues are assigned to (default: the owner of the
#                               repository, set it to nothing to assign nobody)
#   HOME_IP                     hidden from the issues, which are public

set -uo pipefail

source=${1:-}
file=${2:-}

case $source in
  domain-health)
    label_color=d93f0b
    label_description='Raised by the Domain health workflow'
    ;;
  dns-drift)
    label_color=fbca04
    label_description='Raised by the DNS drift workflow'
    ;;
  zonemaster)
    label_color=5319e7
    label_description='Raised by the Zonemaster workflow'
    ;;
  *)
    echo "Usage: $0 domain-health|dns-drift|zonemaster FILE" >&2
    exit 2
    ;;
esac
label=$source
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is not set}"
assignee=${ISSUE_ASSIGNEE-${GITHUB_REPOSITORY_OWNER:-${GITHUB_REPOSITORY%%/*}}}
updated=$(date -u '+%Y-%m-%d %H:%M UTC')
run_url=''
if [ -n "${GITHUB_RUN_ID:-}" ]; then
  run_url="${GITHUB_SERVER_URL:-https://github.com}/$GITHUB_REPOSITORY/actions/runs/$GITHUB_RUN_ID"
fi

# Each of the programs turns FILE into the problems: [{key, title, body}, ...]. They work on
# external text (resolver comments, record values), which is put in code blocks, single line, and
# without backticks, so that it cannot ping anybody or break the issue. The issues are public.
read -r -d '' COMMON_JQ <<'EOF' || true
def clean: tostring | gsub("[[:cntrl:]]"; " ") | gsub("`"; "'");
def cap($n): if length > $n then .[0:$n] + ["... and \(length - $n) more"] else . end;
def fence: "```\n" + (map(clean | .[0:400]) | cap(40) | join("\n")) + "\n```";
def plural($n; $word): "\($n) \($word)\(if $n == 1 then "" else "s" end)";
def footer($what): "Last checked \($updated)" + (if $run_url != "" then " ([run](\($run_url)))" else "" end)
  + ". This issue is updated by every run, and closes by itself once \($what).";
EOF

read -r -d '' DOMAIN_HEALTH_JQ <<'EOF' || true
.domains
| map(select(.result == "FAIL"))
| map({
    key: .domain,
    title: "Domain health: \(.domain)",
    body: ("<!-- monitor:domain-health:\(.domain) -->\n**\(.domain)** fails the domain health checks:\n\n"
      + (.notes | split("; ") | fence)
      + "\n\n| | |\n|---|---|\n"
      + "| Lookup | \(.dns | clean) |\n"
      + "| DNSSEC | \(.dnssec // "-" | clean)\(if .dnssec_expected then " (expected)" else "" end) |\n"
      + "| Expires | \(.expires // "-" | clean)\(if .days_left != null then " (\(.days_left) days)" else "" end) |\n"
      + "| Registrar | \(.registrar // "-" | clean) |\n"
      + "| DNS provider | \(.dns_providers | join(", ") | if . == "" then "-" else . end | clean) |\n\n"
      + footer("the checks pass again"))
  })
EOF

read -r -d '' DNS_DRIFT_JQ <<'EOF' || true
group_by(.domain)
| map({
    domain: .[0].domain,
    corrections: (map(.corrections) | add),
    details: [.[] | select(.corrections > 0) | (.provider // .registrar // "?") as $who
              | (.correction_details // [])[] | "[\($who)] \(.)"]
  })
| map(select(.corrections > 0))
| map({
    key: .domain,
    title: "DNS drift: \(.domain)",
    body: ("<!-- monitor:dns-drift:\(.domain) -->\n**\(.domain)**: the live records differ from the repository (\(plural(.corrections; "correction"))):\n\n"
      + (.details | fence)
      + "\n\nTo keep a change, update the files in `domains/` to match it. To discard it, re-run the latest **Push DNS changes** run on `master`.\n\n"
      + footer("the records match the repository again"))
  })
EOF

read -r -d '' ZONEMASTER_JQ <<'EOF' || true
.domains
| map(select(.result == "FAIL"))
| map(
    [.findings[] | select(.level != "WARNING")] as $errors
    | {
      key: .domain,
      title: "Zonemaster: \(.domain)",
      body: ("<!-- monitor:zonemaster:\(.domain) -->\n**\(.domain)** has \(plural($errors | length; "error")) in its Zonemaster scan:\n\n"
        + ($errors | map("\(.level) \(.tag): \(.message)") | fence)
        + (if .notes != "" then "\n\nNote on the scan:\n\n" + ([.notes] | fence) else "" end)
        + "\n\nThe scan also reported \(plural(.counts.WARNING; "warning")) and \(plural(.counts.NOTICE; "notice")), which are in the summary of the run."
        + " What the tags mean: [Zonemaster test cases](https://doc.zonemaster.net/latest/specifications/tests/README.html).\n\n"
        + footer("the scan finds no error"))
    })
EOF

# What to do, given the problems and the open issues of the source ({number, key}), and the keys
# that could not be checked this time: update the issue of a problem or open one, close the
# duplicates, and close the issues that are not a problem any more. The issue of a key that could
# not be checked is left as it is.
read -r -d '' PLAN_JQ <<'EOF' || true
($existing | group_by(.key) | map(sort_by(.number))) as $groups
| ($groups | map({(.[0].key): .[0].number}) | add // {}) as $oldest
| ($problems | map(.key)) as $keys
| ($problems | map(
    if $oldest[.key] != null then {op: "update", number: $oldest[.key], key: .key, title: .title, body: .body}
    else {op: "create", key: .key, title: .title, body: .body} end))
  + [$groups[] | .[1:][] | {op: "close", reason: "duplicate", number: .number, key: .key, of: $oldest[.key]}]
  + [$groups[] | .[0] | select(.key as $k | ($keys + $unchecked) | index($k) | not) | {op: "close", reason: "resolved", number: .number, key: .key}]
| .[]
EOF

# --- Read the problems. Nothing is touched when this fails.
if [ ! -s "$file" ] || ! jq -e . "$file" >/dev/null 2>&1; then
  echo "Cannot read $file: no issue was opened or closed" >&2
  exit 1
fi
case $source in
  domain-health)
    valid='.domains | type == "array" and length > 0'
    program=$DOMAIN_HEALTH_JQ
    unchecked_program='[]'
    ;;
  dns-drift)
    valid='type == "array" and length > 0'
    program=$DNS_DRIFT_JQ
    unchecked_program='[]'
    ;;
  zonemaster)
    valid='.domains | type == "array" and length > 0'
    program=$ZONEMASTER_JQ
    unchecked_program='[.domains[] | select(.result == "UNKNOWN") | .domain]'
    ;;
esac
if ! jq -e "$valid" "$file" >/dev/null 2>&1; then
  echo "$file has no domain: no issue was opened or closed" >&2
  exit 1
fi
problems=$(jq -c --arg updated "$updated" --arg run_url "$run_url" "$COMMON_JQ $program" "$file") || exit 1
# The domains that could not be checked this time: their issues are left alone.
unchecked=$(jq -c "$unchecked_program" "$file") || exit 1
# The checks only fail when they find a problem, when a domain could not be checked, or when they
# break. A failure with none of the first two in FILE is the third case, however clean FILE looks.
if [ "${STEP_OUTCOME:-}" = failure ] && [ "$(jq 'length' <<<"$problems")" -eq 0 ] &&
  [ "$(jq 'length' <<<"$unchecked")" -eq 0 ]; then
  echo "The step that wrote $file failed without reporting a problem: no issue was opened or closed" >&2
  exit 1
fi

# --- The open issues of the source.
gh label create "$label" --repo "$GITHUB_REPOSITORY" --color "$label_color" \
  --description "$label_description" --force >/dev/null || {
  echo "Cannot create the label $label" >&2
  exit 1
}
issues=$(gh issue list --repo "$GITHUB_REPOSITORY" --label "$label" --state open --limit 200 \
  --json number,body) || {
  echo "Cannot list the open issues" >&2
  exit 1
}
existing=$(jq -c --arg prefix "<!-- monitor:$source:" \
  '[.[] | select(.body | contains($prefix)) | {number, key: (.body | split($prefix)[1] | split(" -->")[0])}]' \
  <<<"$issues")

plan=$(jq -nc --argjson problems "$problems" --argjson existing "$existing" --argjson unchecked "$unchecked" \
  "$PLAN_JQ") || exit 1
# The issues are public: the home IP must not show up in them.
if [ -n "${HOME_IP:-}" ]; then
  plan=${plan//"$HOME_IP"/***}
fi

# --- Apply the plan.
tmp=$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/sync-issues.XXXXXX") || exit 1
trap 'rm -rf "$tmp"' EXIT
failures=0 opened=0 updated_count=0 closed=0 summary=''

while IFS= read -r op; do
  [ -n "$op" ] || continue
  kind=$(jq -r .op <<<"$op")
  key=$(jq -r .key <<<"$op")
  number=$(jq -r '.number // empty' <<<"$op")
  title=$(jq -r '.title // empty' <<<"$op")
  jq -r '.body // empty' <<<"$op" >"$tmp/body.md"

  case $kind in
    create)
      # Without the assignee when GitHub refuses it (the owner is an organisation, for example).
      url=''
      if [ -n "$assignee" ]; then
        url=$(gh issue create --repo "$GITHUB_REPOSITORY" --title "$title" --body-file "$tmp/body.md" \
          --label "$label" --assignee "$assignee" </dev/null 2>"$tmp/err") || url=''
      fi
      if [ -z "$url" ]; then
        if [ -n "$assignee" ]; then echo "Could not open the issue of $key with the assignee $assignee ($(cat "$tmp/err")), trying without" >&2; fi
        url=$(gh issue create --repo "$GITHUB_REPOSITORY" --title "$title" --body-file "$tmp/body.md" \
          --label "$label" </dev/null 2>"$tmp/err") || url=''
      fi
      if [ -n "$url" ]; then
        echo "Opened $url ($key)"
        opened=$((opened + 1))
        summary+="- opened $url ($key)"$'\n'
      else
        echo "Could not open the issue of $key: $(cat "$tmp/err")" >&2
        failures=$((failures + 1))
      fi
      ;;
    update)
      if gh issue edit "$number" --repo "$GITHUB_REPOSITORY" --body-file "$tmp/body.md" </dev/null >/dev/null 2>"$tmp/err"; then
        echo "Updated #$number ($key)"
        updated_count=$((updated_count + 1))
        summary+="- updated #$number ($key)"$'\n'
      else
        echo "Could not update #$number ($key): $(cat "$tmp/err")" >&2
        failures=$((failures + 1))
      fi
      ;;
    close)
      reason=$(jq -r .reason <<<"$op")
      if [ "$reason" = duplicate ]; then
        of=$(jq -r .of <<<"$op")
        comment="Closing as a duplicate of #$of."
        close_flags=(--duplicate-of "$of")
      else
        comment="Resolved: this is no longer a problem as of $updated"
        if [ -n "$run_url" ]; then comment="$comment ([run]($run_url))"; fi
        comment="$comment."
        close_flags=(--reason completed)
      fi
      if gh issue close "$number" --repo "$GITHUB_REPOSITORY" "${close_flags[@]}" --comment "$comment" \
        </dev/null >/dev/null 2>"$tmp/err"; then
        echo "Closed #$number ($key, $reason)"
        closed=$((closed + 1))
        summary+="- closed #$number ($key, $reason)"$'\n'
      else
        echo "Could not close #$number ($key): $(cat "$tmp/err")" >&2
        failures=$((failures + 1))
      fi
      ;;
  esac
done <<<"$plan"

echo "Issues of $source: $opened opened, $updated_count updated, $closed closed, $(jq 'length' <<<"$problems") in problem"
if [ "$(jq 'length' <<<"$unchecked")" -gt 0 ]; then
  echo "Could not be checked, so their issues were left as they are: $(jq -r 'join(", ")' <<<"$unchecked")" >&2
  failures=$((failures + 1))
fi
if [ -n "${GITHUB_STEP_SUMMARY:-}" ] && [ -n "$summary" ]; then
  printf '### Issues\n\n%s\n' "$summary" >>"$GITHUB_STEP_SUMMARY"
fi

[ "$failures" -eq 0 ]

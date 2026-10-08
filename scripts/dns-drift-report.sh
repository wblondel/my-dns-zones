#!/usr/bin/env bash
#
# Reports the drift found by "dnscontrol preview --expect-no-changes --report REPORT.json",
# that is the records of the providers that differ from the ones in this repository.
#
# It prints a one line result, adds a Markdown summary to the GitHub Actions run summary (or
# prints it when run elsewhere) and, in GitHub Actions, creates one annotation per drifted domain.
# It always exits 0: failing the run is the job of the dnscontrol step.
#
# Usage: scripts/dns-drift-report.sh REPORT.json
#
# Environment:
#   DNSCONTROL_OUTCOME  outcome of the dnscontrol step, only used when there is no report
#   HOME_IP             hidden from everything it prints: the runs of this repository are public

set -uo pipefail

report=${1:?usage: dns-drift-report.sh REPORT.json}

# The report has one entry per domain and provider, and one per domain and registrar. This turns
# it into the texts to print: a line for the log, a Markdown summary, and the annotations.
read -r -d '' REPORT_JQ <<'EOF' || true
# Single line, and no characters that could break out of a code block or an annotation.
def clean: gsub("[[:cntrl:]]"; " ") | gsub("`"; "'");
def plural($n; $word): "\($n) \($word)\(if $n == 1 then "" else "s" end)";

(map(.domain) | unique | length) as $domains
| (map(.corrections) | add // 0) as $total
| (group_by(.domain)
   | map({
       domain: .[0].domain,
       corrections: (map(.corrections) | add),
       details: [.[] | select(.corrections > 0) | (.provider // .registrar // "?") as $who
                 | (.correction_details // [])[] | "[\($who)] \(clean)"]
     })
   | map(select(.corrections > 0))) as $drifted
| if ($drifted | length) == 0 then
    {
      plain: "No DNS drift: the live records of the \($domains) domains match the repository",
      md: "### DNS drift\n\nNo drift: the live records of the \($domains) domains match the repository.\n",
      annotations: ""
    }
  else
    {
      plain: "DNS drift: \(plural($total; "correction")) on \(plural($drifted | length; "domain")): \($drifted | map(.domain) | join(", "))",
      md: ("### DNS drift\n\n"
           + "**\(plural($total; "correction")) on \(plural($drifted | length; "domain"))**: the live records differ from the repository.\n\n"
           + ($drifted | map("#### \(.domain) (\(plural(.corrections; "correction")))\n\n```\n\(.details | join("\n"))\n```\n") | join("\n"))
           + "\nTo keep a change, update the files in `domains/` to match it. To discard it, re-run the latest **Push DNS changes** run on `master`.\n"),
      annotations: ($drifted
        | map("::error title=DNS drift::\(.domain): \(plural(.corrections; "correction")), for example \(.details[0] // "")"
              | gsub("%"; "%25") | .[0:400])
        | join("\n"))
    }
  end
EOF

if [ -s "$report" ] && jq -e 'type == "array" and length > 0' "$report" >/dev/null 2>&1; then
  texts=$(jq "$REPORT_JQ" "$report")
  plain=$(jq -r .plain <<<"$texts")
  md=$(jq -r .md <<<"$texts")
  annotations=$(jq -r .annotations <<<"$texts")
else
  outcome="step ${DNSCONTROL_OUTCOME:-outcome unknown}"
  plain="DNS drift check failed: dnscontrol did not write a report ($outcome)"
  md="### DNS drift check failed

dnscontrol did not write a report ($outcome), so the live records could not be compared with the repository. See the log of the previous step.
"
  annotations="::error title=DNS drift::dnscontrol did not write a report, see the log of the previous step"
fi

# Hide the home IP wherever it could appear (the live value of a drifted record, for example).
if [ -n "${HOME_IP:-}" ]; then
  plain=${plain//"$HOME_IP"/***}
  md=${md//"$HOME_IP"/***}
  annotations=${annotations//"$HOME_IP"/***}
fi

echo "$plain"
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  printf '%s\n' "$md" >>"$GITHUB_STEP_SUMMARY"
else
  printf '\n%s\n' "$md"
fi
if [ -n "${GITHUB_ACTIONS:-}" ] && [ -n "$annotations" ]; then
  printf '%s\n' "$annotations"
fi

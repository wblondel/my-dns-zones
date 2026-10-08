#!/usr/bin/env bash
#
# Scans every domain declared in domains/*.js with Zonemaster (https://zonemaster.net), the DNS
# quality checker that AFNIC and IIS, the registries of .fr and .se, maintain. Zonemaster runs its
# whole test suite against a domain: the delegation, the consistency of the nameservers and of
# their SOA records, the DNSSEC chain (DS records, keys, signatures), their connectivity, the basics
# of the mail records... Where scripts/domain-health.sh asks whether a domain works today, this asks
# whether its DNS setup is sound.
#
# Every finding has a level. A domain FAILs when it has a CRITICAL or an ERROR finding, which has
# to be fixed. It WARNs when it has a WARNING, which should be fixed unless there is a reason not
# to, and it is OK otherwise: the NOTICEs are only counted. A scan that finds an error, or that does
# not complete, is run again after a pause, up to three scans in all, and the last one that
# completed counts: an error that was a network hiccup then does not fail the domain, even when the
# second scan landed in the same hiccup as the first. A domain that could not be scanned is
# UNKNOWN. That is not a finding about the domain, but it fails the run: a check that did not run
# is not a domain that passed.
#
# Usage: scripts/zonemaster.sh [DOMAIN...]
#   Without argument, every domain of domains/ is scanned.
#
# Requires bash, Docker and jq. Zonemaster runs from the image pinned in docker/zonemaster.Dockerfile,
# which only exists for amd64: Docker emulates it on another architecture, which is slower. IPv6 is
# not tested, as the runners of GitHub have no IPv6 connectivity. A scan takes about 30 seconds.
#
# Exits with 1 if a domain fails or could not be scanned (warnings do not fail).
#
# Environment:
#   DOMAINS_DIR  directory containing the domain files (default: domains/ at the repository root)
#   JOBS         number of scans running at the same time (default: 4)
#   RETRY_DELAY  seconds to wait before scanning a domain a second time (default: 30), and three
#                times as long before a third time
#   JSON_OUTPUT  when set, path of a JSON file to write the results to (read by sync-issues.sh)
#   HOME_IP      hidden from everything it prints and writes: the runs of this repository are public

set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SELF=$ROOT/scripts/$(basename "${BASH_SOURCE[0]}")
DOMAINS_DIR=${DOMAINS_DIR:-$ROOT/domains}
JOBS=${JOBS:-4}
RETRY_DELAY=${RETRY_DELAY:-30}

for name in JOBS RETRY_DELAY; do
  case ${!name} in
    '' | *[!0-9]*) echo "$name must be a whole number, got '${!name}'" >&2; exit 2 ;;
  esac
done
if [ "$JOBS" -lt 1 ]; then
  echo "JOBS must be at least 1" >&2
  exit 2
fi

# What a scan found, from the JSON of the Zonemaster CLI: the engine version, the number of
# findings per level, the findings from the WARNING level up (most severe first) and the result.
# The messages come from DNS data, so they are single line, and short enough to stay readable.
read -r -d '' SCAN_JQ <<'EOF' || true
def clean: tostring | gsub("[[:cntrl:]]"; " ");
def count($level): [.[] | select(.level == $level)] | length;
.results as $r
| {
    engine: ([$r[] | select(.tag == "GLOBAL_VERSION") | .args.version // empty][0]),
    counts: {
      CRITICAL: ($r | count("CRITICAL")),
      ERROR: ($r | count("ERROR")),
      WARNING: ($r | count("WARNING")),
      NOTICE: ($r | count("NOTICE"))
    },
    findings: ([$r[] | select(.level == "CRITICAL" or .level == "ERROR" or .level == "WARNING")
                | {level, tag: (.tag | clean), message: (.message | clean | .[0:1000])}]
               | sort_by({CRITICAL: 0, ERROR: 1, WARNING: 2}[.level]))
  }
| .result = (if .counts.CRITICAL + .counts.ERROR > 0 then "FAIL" elif .counts.WARNING > 0 then "WARN" else "OK" end)
EOF

# The notes about the scans of a domain. The input is what each scan gave, in the order they ran:
# {error: why it did not complete}, or the result of SCAN_JQ. The notes tell which errors earlier
# scans reported that the scan that counts (the last one that completed) did not confirm, and which
# scans did not complete. When none did, they tell why, and how many times. A domain is scanned
# three times at most, which is as far as the ordinals go.
read -r -d '' NOTES_JQ <<'EOF' || true
def ordinal: ["first", "second", "third"][.];
def times: ["once", "twice", "three times"][. - 1];
def error_tags: [.findings[] | select(.level != "WARNING") | .tag] | unique;
def named: if . == [0, 1] then "the first two scans" else "the \(.[0] | ordinal) scan" end;
. as $scans
| [range(0; length) | select($scans[.] | has("result"))] as $done
| if $done == [] then
    [$scans[].error] as $why
    | if ($why | unique | length) == 1 then "\($why[0]) (\($why | length | times))"
      else "\($why[-1]) (\([range(0; ($why | length) - 1) | "\(ordinal) scan: \($why[.])"] | join("; ")))"
      end
  else
    $done[-1] as $last
    | ($scans[$last] | error_tags) as $kept
    | [$done[] | select(. < $last) | {at: ., tags: ($scans[.] | error_tags - $kept)} | select(.tags != [])] as $unconfirmed
    | ([if $unconfirmed != [] then
          {at: $unconfirmed[0].at,
           text: "\($unconfirmed | map(.at) | named) reported errors that the \($last | ordinal) one did not: \($unconfirmed | map(.tags) | add | unique | join(", "))"}
        else empty end]
       + [range(0; length) as $i | select($scans[$i] | has("error"))
          | {at: $i,
             text: "the \($i | ordinal) scan\(if $done[0] < $i then ", run to confirm the errors," else "" end) did not complete (\($scans[$i].error))"}])
    | sort_by(.at) | map(.text) | join("; ")
  end
EOF

# scan_once DOMAIN FILE: runs one scan and writes the JSON of the Zonemaster CLI to FILE. Returns 1,
# with the reason in SCAN_ERR, when the scan did not complete. The CLI exits with 0 whatever it
# finds, so another exit code is a crash or a name it refuses. The level is INFO because every
# scan, even of a perfect domain, starts with an INFO message with the version of the engine:
# without it, the output is not the result of a scan.
# The container handles data from the network, and needs neither to write nor any privilege: it
# gets none.
scan_once() {
  local domain=$1 file=$2 rc detail
  docker run --rm --platform linux/amd64 --read-only --cap-drop ALL --security-opt no-new-privileges \
    "$ZONEMASTER_IMAGE" --no-ipv6 --no-progress --json --level INFO "$domain" >"$file" 2>"$file.err"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    detail=$(tr -s '[:cntrl:]' ' ' <"$file.err" | sed -e 's/^ *//' -e 's/ *$//' | cut -c1-300)
    SCAN_ERR="the scanner exited with code $rc${detail:+: $detail}"
    return 1
  fi
  if ! jq -e '(.results | type) == "array" and any(.results[]; .tag == "GLOBAL_VERSION")' "$file" >/dev/null 2>&1; then
    SCAN_ERR="the scanner printed no result"
    return 1
  fi
}

# scan_domain DOMAIN DIR: scans a domain, and scans it again, up to three scans in all, as long as
# a scan finds an error or does not complete. The pauses grow: RETRY_DELAY seconds before the second
# scan, three times as many before the third. The last scan that completed counts, so an error that
# lasts is reported with the findings of the last scan, and the domain is UNKNOWN only if none
# completed. It writes the outcome (see SCAN_JQ, plus the domain and notes about the scans, see
# NOTES_JQ) to DIR/DOMAIN.json. This runs in parallel, one process per domain, and always succeeds.
scan_domain() {
  local domain=$1 dir=$2 start=$SECONDS attempt pause=$RETRY_DELAY record='' scans='' notes='' count=''

  for attempt in 1 2 3; do
    if [ "$attempt" -gt 1 ]; then
      sleep "$pause"
      pause=$((pause * 3))
    fi
    if scan_once "$domain" "$dir/$domain.$attempt"; then
      record=$(jq -c "$SCAN_JQ" "$dir/$domain.$attempt")
      scans+="${scans:+,}$record"
      [ "$(jq -r .result <<<"$record")" = FAIL ] || break
    else
      scans+="${scans:+,}$(jq -nc --arg error "$SCAN_ERR" '{error: $error}')"
    fi
  done
  notes=$(jq -r "$NOTES_JQ" <<<"[$scans]")

  # The record is the one of the last scan that completed, or there is none.
  if [ -z "$record" ]; then
    record=$(jq -nc --arg domain "$domain" --arg notes "$notes" \
      '{domain: $domain, result: "UNKNOWN", engine: null, counts: null, findings: [], notes: $notes}')
  else
    record=$(jq -c --arg domain "$domain" --arg notes "$notes" '. + {domain: $domain, notes: $notes}' <<<"$record")
  fi
  printf '%s\n' "$record" >"$dir/$domain.json"
  if [ "$attempt" -gt 1 ]; then count=" ($attempt scans)"; fi
  echo "  $domain: $(jq -r .result <<<"$record") after $((SECONDS - start)) s$count"
}

# The worker mode, which the scans of the next part are run with.
if [ "$#" -eq 3 ] && [ "$1" = --scan ]; then
  scan_domain "$3" "$2"
  exit 0
fi

# image: the image of the "FROM image AS zonemaster" line of docker/zonemaster.Dockerfile.
image() {
  local file=$ROOT/docker/zonemaster.Dockerfile ref
  if [ ! -r "$file" ]; then
    echo "$file not found" >&2
    return 1
  fi
  ref=$(sed -nE 's/^FROM[[:space:]]+([^[:space:]]+)[[:space:]]+AS[[:space:]]+zonemaster[[:space:]]*$/\1/p' "$file")
  if [ -z "$ref" ]; then
    echo "$file has no \"FROM image AS zonemaster\" line" >&2
    return 1
  fi
  echo "$ref"
}

# What to print, from the results: a Markdown summary, and the annotations of the run.
read -r -d '' MARKDOWN_JQ <<'EOF' || true
def clean: tostring | gsub("[[:cntrl:]]"; " ") | gsub("`"; "'");
def plural($n; $word): "\($n) \($word)\(if $n == 1 then "" else "s" end)";
def cell: if . == null then "-" else tostring end;
"### Zonemaster\n\n"
+ "\(plural(.domains | length; "domain")) scanned with `\(.image | split("@")[0])`"
+ " (Zonemaster engine \(.engine // "unknown")): "
+ "\([.domains[] | select(.result == "FAIL")] | length) failed, "
+ "\([.domains[] | select(.result == "WARN")] | length) with warnings, "
+ "\([.domains[] | select(.result == "UNKNOWN")] | length) not scanned.\n\n"
+ "| Domain | Result | Critical | Error | Warning | Notice |\n| --- | --- | ---: | ---: | ---: | ---: |\n"
+ (.domains | map("| \(.domain) | \(.result) | \(.counts.CRITICAL | cell) | \(.counts.ERROR | cell) | \(.counts.WARNING | cell) | \(.counts.NOTICE | cell) |") | join("\n"))
+ "\n"
+ (.domains | map(select((.findings | length) > 0 or .notes != "")
    | "\n#### \(.domain)\n\n```\n"
      + ([(if .notes != "" then "note: \(.notes | clean)" else empty end)]
         + [.findings[] | "\(.level) \(.tag): \(.message | clean | .[0:400])"] | join("\n"))
      + "\n```\n") | join(""))
+ "\nWhat each tag means: [Zonemaster test cases](https://doc.zonemaster.net/latest/specifications/tests/README.html).\n"
EOF

read -r -d '' ANNOTATIONS_JQ <<'EOF' || true
.domains[]
| select(.result != "OK")
| (if .result == "WARN" then "warning" else "error" end) as $kind
| (if .result == "UNKNOWN" then "the scan did not complete (\(.notes))"
   else (.findings | map(select($kind == "warning" or .level != "WARNING"))) as $found
        | "\($found | length) \($kind)\(if ($found | length) == 1 then "" else "s" end): \($found | map(.tag) | unique | join(", "))"
   end) as $text
| "::\($kind) title=Zonemaster::\(.domain): \($text)" | gsub("%"; "%25") | gsub("[[:cntrl:]]"; " ") | .[0:400]
EOF

# --- The domains to scan.
targets=
if [ "$#" -gt 0 ]; then
  for domain in "$@"; do
    targets+="$domain"$'\n'
  done
else
  for file in "$DOMAINS_DIR"/*.js; do
    [ -e "$file" ] || continue
    # "|| [ -n ... ]": sed does not end its last line with a newline when the file does not either.
    while IFS= read -r domain || [ -n "$domain" ]; do
      targets+="$domain"$'\n'
    done < <(sed -nE "s/^[[:space:]]*D\([[:space:]]*['\"]([^'\"]+)['\"].*/\1/p" "$file")
  done
fi
targets=$(printf '%s' "$targets" | awk 'NF && !seen[$0]++')
if [ -z "$targets" ]; then
  echo "No domain found in $DOMAINS_DIR" >&2
  exit 2
fi
while IFS= read -r domain; do
  case $domain in
    -* | *[!A-Za-z0-9.-]*) echo "Not a domain name: $domain" >&2; exit 2 ;;
  esac
done <<<"$targets"

ZONEMASTER_IMAGE=$(image) || exit 2
export ZONEMASTER_IMAGE RETRY_DELAY

# Pulled once here, instead of by every scan at the same time. Docker Hub fails now and then.
pulled=0
for attempt in 1 2 3; do
  if docker pull --quiet --platform linux/amd64 "$ZONEMASTER_IMAGE" >/dev/null; then
    pulled=1
    break
  fi
  if [ "$attempt" -lt 3 ]; then sleep "$RETRY_DELAY"; fi
done
if [ "$pulled" = 0 ]; then
  echo "Cannot pull $ZONEMASTER_IMAGE" >&2
  exit 1
fi

tmp=$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/zonemaster.XXXXXX") || exit 1
trap 'rm -rf "$tmp"' EXIT

echo "Scanning $(wc -l <<<"$targets" | tr -d ' ') domains with $ZONEMASTER_IMAGE, $JOBS at a time"
printf '%s\n' "$targets" | xargs -n 1 -P "$JOBS" bash "$SELF" --scan "$tmp"

# --- The results, in the order of the domains. A scan that left nothing behind did not run.
rows=''
while IFS= read -r domain; do
  if ! { [ -s "$tmp/$domain.json" ] && record=$(jq -c . "$tmp/$domain.json" 2>/dev/null); }; then
    record=$(jq -nc --arg domain "$domain" \
      '{domain: $domain, result: "UNKNOWN", engine: null, counts: null, findings: [], notes: "the scan did not run"}')
  fi
  rows+="$record"$'\n'
done <<<"$targets"

report=$(jq -s --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg image "$ZONEMASTER_IMAGE" \
  '{generated_at: $generated_at, image: $image, engine: ([.[].engine | select(. != null)][0]), domains: .}' \
  <<<"$rows") || exit 1
# Hide the home IP wherever it could appear (in the value of a record, for example).
if [ -n "${HOME_IP:-}" ]; then
  report=${report//"$HOME_IP"/***}
fi

if [ -n "${JSON_OUTPUT:-}" ]; then
  mkdir -p "$(dirname "$JSON_OUTPUT")"
  printf '%s\n' "$report" >"$JSON_OUTPUT"
fi

# --- What to print.
width=$(jq -r '[.domains[].domain | length] | max' <<<"$report")
echo
printf '%-*s  %-7s  %8s  %5s  %7s  %6s\n' "$width" DOMAIN RESULT CRITICAL ERROR WARNING NOTICE
jq -r '.domains[] | [.domain, .result, (.counts.CRITICAL // "-"), (.counts.ERROR // "-"), (.counts.WARNING // "-"), (.counts.NOTICE // "-")] | @tsv' <<<"$report" |
  while IFS=$'\t' read -r domain result critical errors warnings notices; do
    printf '%-*s  %-7s  %8s  %5s  %7s  %6s\n' "$width" "$domain" "$result" "$critical" "$errors" "$warnings" "$notices"
  done
jq -r '.domains[] | select((.findings | length) > 0 or .notes != "")
  | "\n\(.domain)", (if .notes != "" then "  note: \(.notes)" else empty end),
    (.findings[] | "  \(.level) \(.tag): \(.message | .[0:300])")' <<<"$report"

read -r total failed warned unknown < <(jq -r '[(.domains | length),
  ([.domains[] | select(.result == "FAIL")] | length),
  ([.domains[] | select(.result == "WARN")] | length),
  ([.domains[] | select(.result == "UNKNOWN")] | length)] | @tsv' <<<"$report")
echo
echo "$total domains scanned: $failed failed, $warned with warnings, $unknown not scanned (Zonemaster engine $(jq -r '.engine // "unknown"' <<<"$report"))"

# GitHub Actions: annotations on the run, and the summary on the run summary page.
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  jq -r "$ANNOTATIONS_JQ" <<<"$report"
fi
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  jq -r "$MARKDOWN_JQ" <<<"$report" >>"$GITHUB_STEP_SUMMARY"
fi

[ "$failed" -eq 0 ] && [ "$unknown" -eq 0 ]

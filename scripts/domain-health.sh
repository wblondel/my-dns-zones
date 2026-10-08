#!/usr/bin/env bash
#
# Health check for every domain declared in domains/*.js.
#
# Per domain:
#   DNS     The SOA record is resolved through Google Public DNS (DNS-over-HTTPS), which
#           validates DNSSEC. A broken chain of trust (e.g. the DS record at the registrar no
#           longer matches the keys the zone is signed with) is answered with SERVFAIL, so
#           anything other than NOERROR is a failure.
#   DNSSEC  A domain whose file contains a "// DNSSEC: on" comment must be answered with the AD
#           (authenticated data) flag. This catches DNSSEC being quietly turned off, which a
#           plain lookup would not notice. The reverse (validated, but not marked) only warns.
#   EXPIRES The expiration date is read from the registry's RDAP server. It warns when the
#           domain expires in less than WARN_DAYS days, and fails below FAIL_DAYS days.
#   REGISTRY What the registry reports over RDAP must be sound. The domain should have a
#           registrar transfer lock (it warns if not). Its nameservers must belong to the DNS
#           provider declared in its file with DnsProvider(DSP_...), see provider_nameservers
#           below. A domain marked "// DNSSEC: on" must have a DS record: RDAP shows a removed
#           one right away, while resolvers may keep validating from their cache.
#
# The status page also shows the registrar and the DNS provider of each domain, read from its
# file: the REG_ constant of the D() call (or, for a registrar that dnscontrol does not support
# and that is declared as REG_NONE, the name in a "// Registrar: Name" comment), and the
# DnsProvider(DSP_...) constants. The label function gives the names shown.
#
# Requires bash, curl and jq. Exits with 1 if any check fails (warnings do not fail).
#
# Environment:
#   DOMAINS_DIR  directory containing the domain files (default: domains/ at the repository root)
#   WARN_DAYS    warn when the domain expires in less than this many days (default: 60)
#   FAIL_DAYS    fail when the domain expires in less than this many days (default: 21)
#   JSON_OUTPUT  when set, path of a JSON file to write the results to (read by the status page)

set -uo pipefail

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DOMAINS_DIR=${DOMAINS_DIR:-$ROOT/domains}
WARN_DAYS=${WARN_DAYS:-60}
FAIL_DAYS=${FAIL_DAYS:-21}

for name in WARN_DAYS FAIL_DAYS; do
  case ${!name} in
    '' | *[!0-9]*) echo "$name must be a whole number, got '${!name}'" >&2; exit 2 ;;
  esac
done
if [ "$FAIL_DAYS" -gt "$WARN_DAYS" ]; then
  echo "FAIL_DAYS ($FAIL_DAYS) must not be greater than WARN_DAYS ($WARN_DAYS)" >&2
  exit 2
fi

# Status, AD flag and comment of a DNS-over-HTTPS answer, tab separated.
read -r -d '' DOH_JQ <<'EOF' || true
[(.Status // "?"), (.AD // false), (.Comment // "")] | @tsv
EOF

# What RDAP says, tab separated: the expiration date (UTC) and the number of days left until
# then ("?" for both when RDAP gives none), whether there is a registrar transfer lock, whether
# the registry has a DS record, and the delegated nameservers ("-" when there are none).
# RDAP dates are RFC 3339: with or without fractional seconds, "Z" or a numeric offset.
read -r -d '' RDAP_JQ <<'EOF' || true
def epoch:
  capture("^(?<t>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})(\\.[0-9]+)?(?<z>Z|[+-][0-9]{2}:[0-9]{2})$")
  | (.t + "Z" | fromdateiso8601)
    - (if .z == "Z" then 0
       else (if .z[0:1] == "-" then -1 else 1 end) * ((.z[1:3] | tonumber) * 3600 + (.z[4:6] | tonumber) * 60)
       end);
([.events[]? | select(.eventAction == "expiration") | .eventDate][0]) as $d
| (if $d == null then ["?", "?"]
   else ($d | epoch) as $e | [($e | todate | .[0:10]), ((($e - now) / 86400) | floor | tostring)]
   end)
  + [
    ((.status // []) | map(ascii_downcase) | index("client transfer prohibited") != null | tostring),
    ((.secureDNS.delegationSigned // false) | tostring),
    ([.nameservers[]?.ldhName | ascii_downcase | sub("\\.$"; "")] | if length == 0 then "-" else join(" ") end)
  ]
| @tsv
EOF

# fetch [curl options] URL: sets BODY to the response body and returns 0 on HTTP 200.
# Otherwise returns 1 with the reason in ERR. Transient errors (timeouts, 429, 5xx) are retried.
# --fail keeps the body of a failed attempt out of the output, so it cannot end up in front of
# the body of the attempt that succeeded.
fetch() {
  local out rc code
  out=$(curl --silent --fail --location --proto '=https' --proto-redir '=https' \
    --max-time 20 --retry 3 --retry-delay 2 --write-out '\n%{http_code}' "$@")
  rc=$?
  code=${out##*$'\n'}
  BODY=${out%$'\n'*}
  ERR=
  if [ "$rc" -eq 0 ] && [ "$code" = 200 ]; then return 0; fi
  if [ "$code" = 000 ]; then ERR="curl exit code $rc"; else ERR="HTTP $code"; fi
  return 1
}

rcode_name() {
  case $1 in
    0) echo NOERROR ;;
    1) echo FORMERR ;;
    2) echo SERVFAIL ;;
    3) echo NXDOMAIN ;;
    4) echo NOTIMP ;;
    5) echo REFUSED ;;
    *) echo "RCODE $1" ;;
  esac
}

# rdap_url domain: prints the RDAP URL of a domain, on the registry's server for its TLD.
# The servers come from the IANA bootstrap file, which is what rdap.org redirects with. It is
# looked up directly because rdap.org rate limits after about ten requests in a row.
rdap_url() {
  local tld=${1##*.} base
  case $tld in
    # .me is missing from the IANA bootstrap.
    me) base=https://rdap.identitydigital.services/rdap ;;
    *) base=$(jq -r --arg tld "$tld" \
         '[.services[] | select(.[0] | index($tld)) | .[1][] | select(startswith("https://"))][0] // empty' \
         <<<"$RDAP_BOOTSTRAP") ;;
  esac
  [ -n "$base" ] && echo "${base%/}/domain/$1"
}

# problem FAIL|WARN message: records an issue for the domain being checked.
problem() {
  notes="$notes${notes:+; }$2"
  if [ "$1" = FAIL ]; then
    result=FAIL
  elif [ "$result" = OK ]; then
    result=WARN
  fi
}

# provider_nameservers DSP_NAME: prints the nameservers (glob patterns) that DNS provider
# delegates its domains to. Prints nothing for a provider this script does not know: add it here
# when you add a provider in globals/providers.js.
provider_nameservers() {
  case $1 in
    DSP_DESEC) echo 'ns1.desec.io ns2.desec.org' ;;
    DSP_CLOUDFLARE) echo '*.ns.cloudflare.com' ;;
    DSP_SPACESHIP) echo 'launch1.spaceship.net launch2.spaceship.net' ;;
  esac
}

# label NAME: the name to show for a REG_ or DSP_ constant of globals/providers.js, or "-" when
# there is nothing to show. Add the constants you add there. The others get a name made from
# theirs (REG_FOO_BAR is shown as "Foo bar").
label() {
  local name
  case $1 in
    '' | REG_NONE) echo - ;;
    REG_DYNADOT) echo Dynadot ;;
    REG_OVH) echo OVH ;;
    REG_SPACESHIP | DSP_SPACESHIP) echo Spaceship ;;
    DSP_DESEC) echo deSEC ;;
    DSP_CLOUDFLARE) echo Cloudflare ;;
    *)
      name=$(printf '%s' "${1#*_}" | tr '[:upper:]_' '[:lower:] ')
      echo "$(printf '%s' "${name:0:1}" | tr '[:lower:]' '[:upper:]')${name:1}"
      ;;
  esac
}

# check_registry providers expect_signed locked signed delegated: what the registry reports.
# providers is the comma separated DSP_ names declared in the domain file, or "-".
check_registry() {
  local providers=$1 expect_signed=$2 locked=$3 signed=$4 delegated=$5
  local provider rules patterns='' unknown='' stray='' ns pattern matched
  local -a pattern_list delegated_list

  if [ "$locked" != true ]; then
    problem WARN "no registrar transfer lock"
  fi
  if [ "$expect_signed" = 1 ] && [ "$signed" != true ]; then
    problem FAIL "the registry has no DS record"
  fi

  if [ "$providers" = - ]; then
    return 0
  fi
  for provider in ${providers//,/ }; do
    rules=$(provider_nameservers "$provider")
    if [ -z "$rules" ]; then unknown="$unknown${unknown:+, }$provider"; else patterns="$patterns $rules"; fi
  done

  if [ -n "$unknown" ]; then
    problem WARN "nameservers not checked: domain-health.sh has no rule for $unknown"
  elif [ "$delegated" = - ]; then
    problem FAIL "the registry lists no nameservers"
  else
    read -r -a pattern_list <<<"$patterns"
    read -r -a delegated_list <<<"$delegated"
    for ns in "${delegated_list[@]}"; do
      matched=0
      for pattern in "${pattern_list[@]}"; do
        # The patterns are globs on purpose.
        # shellcheck disable=SC2254
        case $ns in $pattern) matched=1 ;; esac
      done
      if [ "$matched" = 0 ]; then stray="$stray${stray:+ }$ns"; fi
    done
    if [ -n "$stray" ]; then
      problem FAIL "unexpected nameservers: $stray (the domain file declares ${providers//,/, })"
    fi
  fi
}

# check_domain domain expect_signed providers registrar: sets result (OK, WARN or FAIL) and
# notes, and prints a row. registrar is the name to show, or "-".
check_domain() {
  local domain=$1 expect_signed=$2 providers=$3 registrar=$4
  local dns=- dnssec=- expiry=- status ad comment rdap exp_date='' days='' locked signed delegated
  local provider provider_names
  result=OK
  notes=

  if ! fetch "https://dns.google/resolve?name=$domain&type=SOA&do=1"; then
    dns=ERROR
    problem FAIL "SOA lookup failed ($ERR)"
  elif ! IFS=$'\t' read -r status ad comment < <(jq -r "$DOH_JQ" <<<"$BODY"); then
    dns=ERROR
    problem FAIL "SOA lookup returned an unreadable answer"
  elif [ "$status" != 0 ]; then
    dns=$(rcode_name "$status")
    # On SERVFAIL, Google explains DNSSEC validation failures in the comment. It is noise otherwise.
    if [ "$status" = 2 ]; then comment=$(printf '%s' "$comment" | tr -d '[:cntrl:]'); else comment=; fi
    problem FAIL "SOA lookup returned $dns${comment:+: $comment}"
  else
    dns=NOERROR
    if [ "$ad" = true ]; then dnssec=valid; else dnssec=off; fi
    if [ "$expect_signed" = 1 ] && [ "$ad" != true ]; then
      problem FAIL "DNSSEC is expected (// DNSSEC: on) but the answer is not validated"
    elif [ "$expect_signed" = 0 ] && [ "$ad" = true ]; then
      problem WARN "DNSSEC validates but the domain file has no // DNSSEC: on comment"
    fi
  fi

  if [ -z "$RDAP_BOOTSTRAP" ]; then
    problem FAIL "RDAP servers are unknown: IANA bootstrap file unavailable ($BOOTSTRAP_ERR)"
  elif ! rdap=$(rdap_url "$domain"); then
    problem FAIL "no RDAP server known for .${domain##*.}"
  elif ! fetch --header 'Accept: application/rdap+json' "$rdap"; then
    problem FAIL "RDAP lookup failed ($ERR)"
  elif ! IFS=$'\t' read -r exp_date days locked signed delegated < <(jq -r "$RDAP_JQ" <<<"$BODY"); then
    problem FAIL "RDAP answer could not be read"
  else
    if [ "$days" = '?' ]; then
      problem FAIL "RDAP does not give an expiration date"
    else
      expiry="$exp_date (${days}d)"
      if [ "$days" -lt 0 ]; then
        problem FAIL "expired on $exp_date"
      elif [ "$days" -lt "$FAIL_DAYS" ]; then
        problem FAIL "expires in $days days, less than the $FAIL_DAYS day limit"
      elif [ "$days" -lt "$WARN_DAYS" ]; then
        problem WARN "expires in $days days, renew soon"
      fi
    fi
    check_registry "$providers" "$expect_signed" "$locked" "$signed" "$delegated"
  fi

  printf '%-*s  %-8s  %-6s  %-18s  %-6s  %s\n' "$width" "$domain" "$dns" "$dnssec" "$expiry" "$result" "$notes" |
    sed 's/[[:space:]]*$//'
  summary_rows+="| $domain | $dns | $dnssec | $expiry | $result | ${notes//|/\\|} |"$'\n'
  # The names of the DNS providers, as a JSON array ([] when the file declares none).
  provider_names=$(
    for provider in ${providers//,/ }; do
      if [ "$provider" != - ]; then label "$provider"; fi
    done | jq -R . | jq -sc .
  )
  json_rows+=$(jq -nc \
    --arg domain "$domain" --arg result "$result" --arg dns "$dns" --arg dnssec "$dnssec" \
    --argjson dnssec_expected "$([ "$expect_signed" = 1 ] && echo true || echo false)" \
    --arg expires "$exp_date" --arg days "$days" --arg notes "$notes" \
    --arg registrar "$registrar" --argjson dns_providers "$provider_names" \
    '{domain: $domain, registrar: (if $registrar == "-" then null else $registrar end),
      dns_providers: $dns_providers, result: $result, dns: $dns,
      dnssec: (if $dnssec == "-" then null else $dnssec end), dnssec_expected: $dnssec_expected,
      expires: (if $expires == "" or $expires == "?" then null else $expires end),
      days_left: ($days | tonumber? // null), notes: $notes}')$'\n'
}

# Collect the domains first, to size the first column of the table.
targets=
width=6
for file in "$DOMAINS_DIR"/*.js; do
  [ -e "$file" ] || continue
  expect_signed=0
  if grep -Eiq '^[[:space:]]*//[[:space:]]*DNSSEC:[[:space:]]*on[[:space:]]*$' "$file"; then
    expect_signed=1
  fi
  # The DNS providers of the file, without the commented out ones: DSP_DESEC,DSP_CLOUDFLARE
  providers=$(grep -vE '^[[:space:]]*//' "$file" | grep -oE 'DnsProvider\([[:space:]]*DSP_[A-Za-z0-9_]+' |
    sed -E 's/.*(DSP_[A-Za-z0-9_]+)$/\1/' | sort -u | paste -sd, -)
  # The registrar to show: the name in a "// Registrar: Name" comment, which is for the registrars
  # that dnscontrol does not support (REG_NONE), or else the name of the REG_ constant of the file.
  registrar=$(sed -nE 's#^[[:space:]]*//[[:space:]]*[Rr]egistrar:[[:space:]]*(.*[^[:space:]])[[:space:]]*$#\1#p' "$file" | head -1)
  if [ -z "$registrar" ]; then
    registrar=$(label "$(sed -E 's://.*$::' "$file" | grep -oE 'REG_[A-Za-z0-9_]+' | head -1)")
  fi
  # "|| [ -n ... ]": sed does not end its last line with a newline when the file does not either.
  while IFS= read -r domain || [ -n "$domain" ]; do
    targets+="$domain $expect_signed ${providers:--} $registrar"$'\n'
    if [ "${#domain}" -gt "$width" ]; then width=${#domain}; fi
  done < <(sed -nE "s/^[[:space:]]*D\([[:space:]]*['\"]([^'\"]+)['\"].*/\1/p" "$file")
done

if [ -z "$targets" ]; then
  echo "No domain found in $DOMAINS_DIR" >&2
  exit 2
fi

RDAP_BOOTSTRAP='' BOOTSTRAP_ERR=''
if fetch https://data.iana.org/rdap/dns.json; then RDAP_BOOTSTRAP=$BODY; else BOOTSTRAP_ERR=$ERR; fi

total=0 failed=0 warned=0 summary_rows='' annotations='' json_rows=''
printf '%-*s  %-8s  %-6s  %-18s  %-6s  %s\n' "$width" DOMAIN DNS DNSSEC EXPIRES RESULT NOTES
while read -r domain expect_signed providers registrar; do
  check_domain "$domain" "$expect_signed" "$providers" "$registrar"
  total=$((total + 1))
  case $result in
    FAIL) failed=$((failed + 1)); annotations+="::error title=Domain health::$domain: $notes"$'\n' ;;
    WARN) warned=$((warned + 1)); annotations+="::warning title=Domain health::$domain: $notes"$'\n' ;;
  esac
done <<<"${targets%$'\n'}"

echo
echo "$total domains checked: $failed failed, $warned with warnings (expiry: warning under $WARN_DAYS days, failure under $FAIL_DAYS days)"

if [ -n "${JSON_OUTPUT:-}" ]; then
  mkdir -p "$(dirname "$JSON_OUTPUT")"
  jq -s --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson warn_days "$WARN_DAYS" --argjson fail_days "$FAIL_DAYS" \
    '{generated_at: $generated_at, warn_days: $warn_days, fail_days: $fail_days, domains: .}' \
    <<<"$json_rows" >"$JSON_OUTPUT"
fi

# GitHub Actions: annotations on the run, and the table on the run summary page.
if [ -n "${GITHUB_ACTIONS:-}" ]; then
  printf '%s' "$annotations"
fi
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "| Domain | DNS | DNSSEC | Expires (UTC) | Result | Notes |"
    echo "| --- | --- | --- | --- | --- | --- |"
    printf '%s' "$summary_rows"
  } >>"$GITHUB_STEP_SUMMARY"
fi

[ "$failed" -eq 0 ]

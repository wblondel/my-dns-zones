# My DNS zones
![Banner](https://newblog.siteground.com/en/wp-content/uploads/sites/2/2021/07/DNS_blog-post-1200x600-1.jpg)

[![en](https://img.shields.io/badge/lang-en-red.svg)](./README.md)
[![fr](https://img.shields.io/badge/lang-fr-blue.svg)](./docs/i18n/fr/README.md)


This repository holds a reproducible configuration of the DNS zone for each domain I have.

The configuration is managed through [`dnscontrol`](https://github.com/StackExchange/dnscontrol) and deployed by a [`GitHub Action`](https://github.com/wblondel/dnscontrol-action) upon merges to the `master` branch.

All changes on DNS records are done via this repository.

## Configuration

Clone the repository and create a `creds.local.json` at the root.

Then, configure the credentials for:
- [Cloudflare](https://docs.dnscontrol.org/provider/cloudflareapi)
- [deSEC](https://docs.dnscontrol.org/service-providers/providers/desec)
- [Dynadot](https://docs.dnscontrol.org/provider/dynadot)
- [OVH](https://docs.dnscontrol.org/service-providers/providers/ovh)
- [Spaceship](https://docs.dnscontrol.org/provider/spaceship)

The steps to obtain the credentials for each provider are listed on the relevant documentation pages.

For more information about the credentials file, please visit [this page](https://docs.dnscontrol.org/commands/creds-json).

Then, create a `.env` file with the location of the local credentials file:
```
DNSCONTROL_LOCAL_CREDS=creds.local.json
```

## Usage

Docker is required as `dnscontrol` is used through Docker.

To get the list of available commands, execute `make help` (or `make`).

### Get the version of DNSControl
```sh
make version
```

This command allows you to quickly check which version of DNSControl is being used.

### Check and validate dnsconfig.js
```sh
make check
```

This command allows you to check and validate the syntax of the DNS zones' configuration.

### Verify service providers' credentials
```sh
CRED_KEY=cred_name make check-creds
```

This command performs a small operation to verify a service provider's credentials.

The environment variable `CRED_KEY` must be defined and must contain the name of the credential you want to test, as defined in the local credentials file (`creds.local.json`).

Example:
```sh
CRED_KEY=ovh make check-creds
```

### Preview the change to make
```sh
make preview
```

This command reads the configuration and shows the changes that need to be made, without applying them.

### Apply the changes
As a precautionary measure, it is not possible to apply the changes manually. You should first create a PR and then merge it to `master`.

## Domain health checks

The [Domain health](.github/workflows/domain-health.yml) workflow runs [`scripts/domain-health.sh`](scripts/domain-health.sh) every day, and on demand from the Actions tab. For each domain in `domains/`, it checks that:

- the domain resolves through a DNSSEC-validating resolver (Google Public DNS). A broken chain of trust, for example a DS record at the registrar that no longer matches the zone's keys, makes the lookup fail with `SERVFAIL`. When Google cannot be reached, or its answer looks wrong (an error, or a domain marked `// DNSSEC: on` that does not validate), Cloudflare (`1.1.1.1`) is asked as well before anything fails: it takes over when Google is down, a problem that both see is a failure, and resolvers that disagree only give a warning. A resolver that is down is not asked again during the run, so an outage does not slow it down;
- DNSSEC is still on for the domains that should have it. Mark such a domain with a `// DNSSEC: on` comment in its file in `domains/`: it then fails if its answers stop being validated. A validated domain without the comment only raises a warning;
- the domain does not expire soon, according to the registry's RDAP server (dates are in UTC). It raises a warning under 60 days and fails under 21 days, so a failure means a renewal is urgent;
- the registry's RDAP data is sound. The domain should have a registrar transfer lock (a warning if it has not). Its nameservers must belong to the DNS provider declared in its file with `DnsProvider(DSP_...)`: when you add a provider in `globals/providers.js`, add its nameservers to `provider_nameservers` in the script, otherwise the check only warns. A domain marked `// DNSSEC: on` must also have a DS record at the registry.

On `master`, a failing domain opens an issue (see [Issues](#issues)) and the run stays green: the run only fails when the monitoring itself broke. Warnings are shown on the status page and in the run, but do not open an issue. In a run started on another branch, a failing check fails the run.

To run it locally, you need `curl` and `jq`:
```sh
scripts/domain-health.sh
```

The `WARN_DAYS` and `FAIL_DAYS` environment variables change the two expiry thresholds (60 and 21 days by default).

### Status page

The same workflow publishes the results as a status page, built from [`site/`](site) and deployed with GitHub Pages. It lists every domain, failures first, and shows a warning when its data is more than 36 hours old, which means the scheduled workflow stopped running. The page is only deployed from `master`.

The page also shows the registrar and the DNS provider of each domain, read from its file in `domains/`: the `REG_` constant of the `D()` call and the `DnsProvider(DSP_...)` ones. For a registrar that `dnscontrol` does not support, declared as `REG_NONE`, write its name in a `// Registrar: Name` comment in the file. The names shown come from `label` in the script: add the constants you add in `globals/providers.js` there, otherwise a name is made from the constant (`REG_FOO_BAR` is shown as "Foo bar").

GitHub Pages must use **GitHub Actions** as its source (*Settings > Pages > Build and deployment > Source*).

To preview the page locally:
```sh
JSON_OUTPUT=site/status.json scripts/domain-health.sh
python3 -m http.server --directory site
```

Then open http://localhost:8000.

## DNS drift detection

The [DNS drift](.github/workflows/dns-drift.yml) workflow runs every night, and on demand from the Actions tab. It runs `dnscontrol preview --expect-no-changes` against the providers, and fails if the live records differ from the ones in this repository, for example after a change made in a provider's dashboard. The nameservers set at the registrars that `dnscontrol` manages are compared too. Nothing is changed at the providers.

When records drift, an issue is opened for each domain that differs (see [Issues](#issues)), and the run summary lists the records ([`scripts/dns-drift-report.sh`](scripts/dns-drift-report.sh) writes it). To keep a change, update the files in `domains/` to match it. To discard it, re-run the latest *Push DNS changes* run on `master`.

The workflow uses the same secrets as the *Push DNS changes* one. The runs of this repository are public, so the report hides the `HOME_IP` secret if it ever shows up in a record.

## Zonemaster scan

The [Zonemaster](.github/workflows/zonemaster.yml) workflow runs [`scripts/zonemaster.sh`](scripts/zonemaster.sh) on the first day of every month, and on demand from the Actions tab. [Zonemaster](https://zonemaster.net) is the DNS quality checker that AFNIC and IIS, the registries of `.fr` and `.se`, maintain. It runs its whole test suite against each domain in `domains/`: the delegation, the consistency of the nameservers and of their SOA records, the DNSSEC chain (DS records, keys, signatures), the connectivity of the nameservers, the basics of the mail records... Where the [domain health checks](#domain-health-checks) ask whether a domain works today, this asks whether its DNS setup is sound.

Every finding has a level, from `NOTICE` up to `CRITICAL`:

- a domain with an `ERROR` or a `CRITICAL` finding fails. A scan that finds one, or that does not complete, is run again after 30 seconds, and a third time after 90 more seconds if the second scan is no better. The last scan that completed counts, so an error only fails the domain if it survives three scans: a network hiccup does not;
- a domain with a `WARNING` only raises a warning. It should be fixed unless there is a reason not to, but it is not urgent, and some warnings are expected: all the nameservers of a domain being at one provider (`IPV4_ONE_ASN`), or a parked domain not being signed (`DS07_NOT_SIGNED`), for example;
- the `NOTICE`s are only counted.

The run summary lists the findings of every domain with their tags, and the [test case specifications](https://doc.zonemaster.net/latest/specifications/tests/README.html) tell what each tag means. On `master`, a failing domain opens an issue (see [Issues](#issues)) and the run stays green: the run only fails when the monitoring itself broke, for example when a domain could not be scanned (the issue of that domain is then left as it is). A warning does not open an issue. In a run started on another branch, a failing domain fails the run. IPv6 is not tested, as the runners of GitHub have no IPv6 connectivity.

The scanner is the [`zonemaster/cli`](https://hub.docker.com/r/zonemaster/cli) image, pinned by tag and digest in [`docker/zonemaster.Dockerfile`](docker/zonemaster.Dockerfile). Like [`docker/lint.Dockerfile`](docker/lint.Dockerfile) (see [Make changes](#make-changes)), that file is never built: Dependabot proposes the update of its `FROM` line in a PR, and `scripts/zonemaster.sh` reads the image from it, so keep its `FROM image AS zonemaster` format. The workflow also runs on the PRs that change it, so the findings of a new version show up before you merge it.

To run it locally, you need Docker and `jq`:
```sh
scripts/zonemaster.sh                # every domain of domains/
scripts/zonemaster.sh example.com    # only the domains you name
```

A scan takes about 30 seconds. The image only exists for amd64, so Docker emulates it on Apple Silicon, which is slower. The `JOBS` environment variable changes the number of scans that run at the same time (4 by default), and `RETRY_DELAY` the pause before the second scan of a domain (30 seconds by default, and three times as long before a third scan).

## Issues

A problem found by the *Domain health*, the *DNS drift* or the *Zonemaster* workflow is reported as a GitHub issue, so that a problem that lasts for weeks costs two notifications (one when it opens, one when it is resolved) instead of a failed run notification every day.

- There is one issue per failing domain and per workflow, labeled `domain-health`, `dns-drift` or `zonemaster`, and assigned to the owner of the repository, which is what notifies them. Warnings never open an issue: they only show on the status page, or in the run summary for Zonemaster.
- While the problem lasts, each run refreshes the issue by editing it, which notifies nobody.
- Once the problem is gone, the run closes the issue with a comment.
- [`scripts/sync-issues.sh`](scripts/sync-issues.sh) does this, at the end of the scheduled and manual runs on `master`. Those runs stay green when a domain fails. They fail, and GitHub sends its usual failed run notification, when the monitoring itself broke: the check did not complete (nothing is ever closed in that case, and a domain that Zonemaster could not scan keeps its issue as it is), or GitHub refused to update the issues.
- The issues are public like the repository, so the `HOME_IP` secret is hidden in them, and what comes from DNS or from the resolvers is shown in code blocks.

## Heartbeat

The three scheduled workflows (*Domain health*, *DNS drift* and *Zonemaster*) can ping a heartbeat monitor, such as [Healthchecks.io](https://healthchecks.io), each time they run. The monitor alerts you when the pings stop, which is how you find out that a schedule quietly stopped. Nothing else would tell, and the status page only shows it if you open it. GitHub disables the scheduled workflows of a public repository after 60 days without activity, for example.

[`scripts/heartbeat.sh`](scripts/heartbeat.sh) sends the ping at the end of every scheduled or manual run on `master`, whatever the result of the checks: a failing check opens an issue, the ping only says that the workflow ran. Pull request runs never ping.

To set it up, create one check per workflow in the monitor, with a period of 1 day and a grace time of a few hours (6, for example), and choose where it alerts you. The Zonemaster one runs once a month: give it the cron schedule `23 4 1 * *` (in UTC) and a grace time of 2 days. Then save their ping URLs as secrets of this repository:
```sh
gh secret set HEARTBEAT_DOMAIN_HEALTH_URL   # Domain health, runs at 06:17 UTC
gh secret set HEARTBEAT_DNS_DRIFT_URL       # DNS drift, runs at 03:41 UTC
gh secret set HEARTBEAT_ZONEMASTER_URL      # Zonemaster, runs at 04:23 UTC on the first of the month
```

`gh secret set` asks for the value, so it does not end up in your shell history. A ping URL lets anybody send pings for its check, so keep it secret. Until a secret is set, the run only shows a notice. A monitor that is down does not fail the run either, the ping just shows a warning.

## Make changes

The `master` branch is protected, it only accepts merges from PRs.

You must first create a branch, then make your changes there and create a PR.

The scripts in `scripts/`, the workflows in `.github/workflows/` and the JavaScript of the status page in `site/` are linted on every PR by the [Lint](.github/workflows/lint.yml) workflow, with [ShellCheck](https://www.shellcheck.net), [actionlint](https://github.com/rhysd/actionlint) and [Biome](https://biomejs.dev). The other `.js` files are `dnscontrol` configuration, so they are not linted. To check your changes before pushing them, run the same thing locally (it needs Docker, and only looks at the files tracked by Git, so `git add` new ones first):
```sh
scripts/lint.sh
```

The status page shows text that comes from DNS records and from the resolvers, so its JavaScript may only set text. A Biome rule ([`.biome/no-html-sinks.grit`](.biome/no-html-sinks.grit), loaded by [`biome.jsonc`](biome.jsonc)) fails the check on `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write` and `Function()` or `new Function()`, however they are spaced or commented, and Biome's own `noGlobalEval` rule does the same for `eval()`. A string-literal key such as `el["innerHTML"]` must be written `el.innerHTML` (`useLiteralKeys` is an error), so that the rule sees it. This is a safety net against mistakes, not a defence against someone determined: it cannot see a key that is built at run time. The lint also checks that the rule still flags every example of [`.biome/fixtures/bad.js`](.biome/fixtures/bad.js) and nothing in [`good.js`](.biome/fixtures/good.js), so a Biome update that quietly breaks the rule fails the check instead of passing it.

The versions of the three tools are pinned by tag and digest in [`docker/lint.Dockerfile`](docker/lint.Dockerfile). That file is never built: it only lists the images as `FROM` lines, so that Dependabot proposes their updates in a PR (the Lint check runs on that PR, so any new finding shows up before you merge it), and `scripts/lint.sh` reads the images from it. Keep its `FROM image AS name` format.

Secrets are defined as environment's secrets on GitHub, and are used in the `creds.json` file.

---

Hero image provided by: https://siteground.com/ (thanks to them!)
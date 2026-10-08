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

- the domain resolves through a DNSSEC-validating resolver (Google Public DNS). A broken chain of trust, for example a DS record at the registrar that no longer matches the zone's keys, makes the lookup fail with `SERVFAIL`;
- DNSSEC is still on for the domains that should have it. Mark such a domain with a `// DNSSEC: on` comment in its file in `domains/`: it then fails if its answers stop being validated. A validated domain without the comment only raises a warning;
- the domain does not expire soon, according to the registry's RDAP server (dates are in UTC). It raises a warning under 60 days and fails under 21 days, so a failure means a renewal is urgent;
- the registry's RDAP data is sound. The domain should have a registrar transfer lock (a warning if it has not). Its nameservers must belong to the DNS provider declared in its file with `DnsProvider(DSP_...)`: when you add a provider in `globals/providers.js`, add its nameservers to `provider_nameservers` in the script, otherwise the check only warns. A domain marked `// DNSSEC: on` must also have a DS record at the registry.

The workflow fails, and GitHub sends its usual failed workflow notification, when a check fails. Warnings are shown on the status page and in the run, but do not fail it.

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

When it fails, the run summary lists the records that differ, for each domain ([`scripts/dns-drift-report.sh`](scripts/dns-drift-report.sh) writes it). To keep a change, update the files in `domains/` to match it. To discard it, re-run the latest *Push DNS changes* run on `master`.

The workflow uses the same secrets as the *Push DNS changes* one. The runs of this repository are public, so the report hides the `HOME_IP` secret if it ever shows up in a record.

## Heartbeat

The two scheduled workflows (*Domain health* and *DNS drift*) can ping a heartbeat monitor, such as [Healthchecks.io](https://healthchecks.io), each time they run. The monitor alerts you when the pings stop, which is how you find out that a schedule quietly stopped. Nothing else would tell, and the status page only shows it if you open it. GitHub disables the scheduled workflows of a public repository after 60 days without activity, for example.

[`scripts/heartbeat.sh`](scripts/heartbeat.sh) sends the ping at the end of every scheduled or manual run on `master`, whatever the result of the checks: a failing check fails the run and GitHub notifies you, the ping only says that the workflow ran. Pull request runs never ping.

To set it up, create one check per workflow in the monitor, with a period of 1 day and a grace time of a few hours (6, for example), and choose where it alerts you. Then save their ping URLs as secrets of this repository:
```sh
gh secret set HEARTBEAT_DOMAIN_HEALTH_URL   # Domain health, runs at 06:17 UTC
gh secret set HEARTBEAT_DNS_DRIFT_URL       # DNS drift, runs at 03:41 UTC
```

`gh secret set` asks for the value, so it does not end up in your shell history. A ping URL lets anybody send pings for its check, so keep it secret. Until a secret is set, the run only shows a notice. A monitor that is down does not fail the run either, the ping just shows a warning.

## Make changes

The `master` branch is protected, it only accepts merges from PRs.

You must first create a branch, then make your changes there and create a PR.

The scripts in `scripts/` and the workflows in `.github/workflows/` are linted on every PR by the [Lint](.github/workflows/lint.yml) workflow, with [ShellCheck](https://www.shellcheck.net) and [actionlint](https://github.com/rhysd/actionlint). To check your changes before pushing them, run the same thing locally (it needs Docker, and only looks at the files tracked by Git, so `git add` new ones first):
```sh
scripts/lint.sh
```

The versions of the two tools are pinned by tag and digest in `scripts/lint.sh`. To update one, take the digest of the new tag from `docker buildx imagetools inspect IMAGE:TAG` and change both.

Secrets are defined as environment's secrets on GitHub, and are used in the `creds.json` file.

---

Hero image provided by: https://siteground.com/ (thanks to them!)
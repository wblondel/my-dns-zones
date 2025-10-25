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

## Make changes

The `master` branch is protected, it only accepts merges from PRs.

You must first create a branch, then make your changes there and create a PR.

Secrets are defined as environment's secrets on GitHub, and are used in the `creds.json` file.

---

Hero image provided by: https://siteground.com/ (thanks to them!)
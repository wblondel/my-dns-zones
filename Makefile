.DEFAULT_GOAL = help
SHELL = /usr/bin/env bash

include .env
export

.PHONY: build
build:
	@docker compose build --quiet

.PHONY: version # Get the version of DNSControl
version: build
	@docker compose run --rm dnscontrol version

.PHONY: check # Check and validate dnsconfig.js
check: build
	@docker compose run --rm dnscontrol check

.PHONY: check-creds # Do a small operation to verify credentials
check-creds: build
ifndef DNSCONTROL_LOCAL_CREDS
	$(error DNSCONTROL_LOCAL_CREDS is undefined)
endif
ifndef CRED_KEY
	$(error CRED_KEY is undefined)
endif
	@docker compose run --rm dnscontrol check-creds --creds $(DNSCONTROL_LOCAL_CREDS) $(CRED_KEY)

.PHONY: preview # Read live configuration and identify changes to be made, without applying them
preview: build
ifndef DNSCONTROL_LOCAL_CREDS
	$(error DNSCONTROL_LOCAL_CREDS is undefined)
endif
	@docker compose run --rm dnscontrol preview --creds $(DNSCONTROL_LOCAL_CREDS)

.PHONY: write-types
write-types:
	@docker compose run --rm dnscontrol write-types

.PHONY: help # List available commands
help:
	@echo "Available commands:"
	@echo
	@grep '^.PHONY: .* #' Makefile | sed 's/\.PHONY: \(.*\) # \(.*\)/\1 >> \2/' | expand -t20

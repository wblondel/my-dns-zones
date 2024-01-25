.DEFAULT_GOAL = help
SHELL = /usr/bin/env bash

DNSCONTROL_DOCKER_IMAGE = ghcr.io/stackexchange/dnscontrol:4.8.1
DNSCONTROL_VOLUME = "$$(pwd):/dns"

.PHONY: version # Get the version of DNSControl
version:
	@docker run --rm -it -v $(DNSCONTROL_VOLUME) $(DNSCONTROL_DOCKER_IMAGE) version

.PHONY: check # Check and validate dnsconfig.js
check:
	@docker run --rm -it -v $(DNSCONTROL_VOLUME) $(DNSCONTROL_DOCKER_IMAGE) check

.PHONY: check-creds # Do a small operation to verify credentials
check-creds:
ifndef DNSCONTROL_LOCAL_CREDS
	$(error DNSCONTROL_LOCAL_CREDS is undefined)
endif
ifndef CRED_KEY
	$(error CRED_KEY is undefined)
endif
	@docker run --rm -it -v $(DNSCONTROL_VOLUME) $(DNSCONTROL_DOCKER_IMAGE) check-creds --creds $(DNSCONTROL_LOCAL_CREDS) $(CRED_KEY)

.PHONY: preview # Read live configuration and identify changes to be made, without applying them
preview:
ifndef DNSCONTROL_LOCAL_CREDS
	$(error DNSCONTROL_LOCAL_CREDS is undefined)
endif
	@docker run --rm -it -v $(DNSCONTROL_VOLUME) $(DNSCONTROL_DOCKER_IMAGE) preview --creds $(DNSCONTROL_LOCAL_CREDS)

.PHONY: help # List available commands
help:
	@echo "Available commands:"
	@echo
	@grep '^.PHONY: .* #' Makefile | sed 's/\.PHONY: \(.*\) # \(.*\)/\1 >> \2/' | expand -t20

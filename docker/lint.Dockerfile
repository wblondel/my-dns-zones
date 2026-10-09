# The images of the tools that scripts/lint.sh runs. This file is never built: it only lists the
# images, pinned by tag and digest, so that Dependabot (which reads the FROM lines of the Dockerfiles
# of this directory) proposes their updates in a pull request, and scripts/lint.sh reads them from
# here. Keep the "FROM image AS name" format: the script looks the images up by their name.
FROM koalaman/shellcheck:v0.11.0@sha256:61862eba1fcf09a484ebcc6feea46f1782532571a34ed51fedf90dd25f925a8d AS shellcheck
FROM rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667 AS actionlint
FROM ghcr.io/biomejs/biome:2.5.15@sha256:e73b0563691da8c60ebfdb1553adea0c5d531752460e1672c1020d2d83a7e5d7 AS biome

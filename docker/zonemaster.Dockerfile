# The image of the Zonemaster scan that scripts/zonemaster.sh runs. This file is never built: it only
# lists the image, pinned by tag and digest, so that Dependabot (which reads the FROM lines of the
# Dockerfiles of this directory) proposes its updates in a pull request, and scripts/zonemaster.sh
# reads it from here. Keep the "FROM image AS name" format: the script looks the image up by its name.
FROM zonemaster/cli:v8.0.3@sha256:52f52bffa336d0e02a2358ad351b5be6eab93edbf57b99fa8141b1956a3e03f1 AS zonemaster

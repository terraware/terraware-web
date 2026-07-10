#!/usr/bin/env bash
set -euo pipefail

# Move the test output to a "public" subdirectory so it's readable in the
# S3 bucket without AWS authentication.
mkdir playwright/public
sudo mv playwright/test-results playwright/public
sudo mv playwright-report playwright/public/report

# We need to disable KMS encryption on public artifacts so they will be
# downloadable without AWS authentication. There's no good way to do this
# selectively using the built-in artifacts support, so do it explicitly.
BUILDKITE_S3_SSE_ENABLED=true buildkite-agent artifact upload 'playwright/public/**/*'

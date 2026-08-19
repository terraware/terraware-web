#!/usr/bin/env bash
.buildkite/scripts/install-deps.sh --node --tools

yarn run -s knip --no-exit-code --reporter markdown > knip-report.md

if [ -s knip-report.md ]; then
    (
        echo "<details>"
        echo "<summary>Knip Dead Code Report</summary>"
        echo ""
        cat knip-report.md
        echo "</details>"
    ) | buildkite-agent annotate --style "info"
fi

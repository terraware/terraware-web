#!/usr/bin/env node
// Print an HTML Buildkite annotation showing the expected, actual, and diff images for each
// screenshot test whose final attempt failed. Takes the path to a Playwright JSON report.
// Image paths are rewritten to point at the artifacts uploaded by upload-playwright-results.sh.
import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync(process.argv[2], 'utf8'));

const collectSpecs = (suite, titlePath) => {
  const path = suite.title ? [...titlePath, suite.title] : titlePath;
  return [
    ...(suite.specs ?? []).map((spec) => ({ ...spec, titlePath: [...path, spec.title] })),
    ...(suite.suites ?? []).flatMap((child) => collectSpecs(child, path)),
  ];
};

const artifactPath = (localPath) => {
  const marker = 'playwright/test-results/';
  const index = localPath.indexOf(marker);
  return index === -1 ? undefined : `playwright/public/test-results/${localPath.slice(index + marker.length)}`;
};

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const imageCell = (localPath) => {
  const uploadedPath = localPath && artifactPath(localPath);
  if (!uploadedPath) {
    return '<td><em>none</em></td>';
  }
  const src = `artifact://${uploadedPath}`;
  return `<td><a href="${src}"><img src="${src}" width="300"></a></td>`;
};

const screenshotRows = [];
const otherFailures = [];

for (const spec of report.suites.flatMap((suite) => collectSpecs(suite, []))) {
  for (const test of spec.tests) {
    if (test.status !== 'unexpected') {
      continue;
    }
    const lastResult = test.results[test.results.length - 1];
    const images = (lastResult?.attachments ?? []).filter((a) => a.path && a.contentType === 'image/png');
    const actuals = images.filter((a) => a.name.endsWith('-actual.png'));
    const testName = spec.titlePath.join(' › ');

    if (actuals.length === 0) {
      const message = lastResult?.error?.message?.replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0] ?? 'Unknown error';
      otherFailures.push(`<li><code>${escapeHtml(testName)}</code>: ${escapeHtml(message)}</li>`);
      continue;
    }

    for (const actual of actuals) {
      const snapshotName = actual.name.replace(/-actual\.png$/, '');
      // The expected attachment points at the checked-in baseline; Playwright also writes a copy next to the actual.
      const sibling = (suffix) =>
        images.some((a) => a.name === `${snapshotName}-${suffix}.png`)
          ? actual.path.replace(/-actual\.png$/, `-${suffix}.png`)
          : undefined;
      screenshotRows.push(
        `<tr><td><strong>${escapeHtml(snapshotName)}</strong><br><code>${escapeHtml(testName)}</code></td>` +
          `${imageCell(sibling('expected'))}${imageCell(actual.path)}${imageCell(sibling('diff'))}</tr>`
      );
    }
  }
}

const lines = [];
if (screenshotRows.length > 0) {
  lines.push(
    `<h3>${screenshotRows.length} screenshot mismatch(es)</h3>`,
    '<table>',
    '<tr><th>Page</th><th>Expected</th><th>Actual</th><th>Diff</th></tr>',
    ...screenshotRows,
    '</table>'
  );
}
if (otherFailures.length > 0) {
  lines.push('<h3>Other failures</h3>', '<ul>', ...otherFailures, '</ul>');
}
if (lines.length > 0) {
  lines.push(
    '<p>Full details are in the <a href="artifact://playwright/public/report/index.html">Playwright HTML report</a>.</p>'
  );
}

process.stdout.write(lines.join('\n'));

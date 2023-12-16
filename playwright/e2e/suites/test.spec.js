import { test } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
});

test('Test GH Actions', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');
  await waitFor(page, '#home');

  await testInfo.attach('Test-0', { body: await page.screenshot(), contentType: 'image/png' });

  await waitFor(page, '#thisShouldCauseAFailure');
});

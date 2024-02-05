import { test, expect } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
});

test('Add A Nursery', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');

  await waitFor(page, '#home');

  await page.getByRole('button', { name: 'Locations' }).click();
  await page.getByRole('button', { name: 'Nurseries', exact: true }).click();
  await page.getByRole('button', { name: 'Add Nursery' }).click();
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill('My Nursery');
  await page.locator('textarea').click();
  await page.locator('textarea').fill('My Nursery is very nice!!!!');
  await page.getByLabel('Build Start Date').click();
  await page.getByLabel('Build Start Date').fill('2024-01-01');
  await page.getByLabel('Build Completion Date').click();
  await page.getByLabel('Build Completion Date').fill('2024-01-01');
  await page.getByLabel('Operation Start Date').click();
  await page.getByLabel('Operation Start Date').fill('2024-01-01');
  await page.getByRole('spinbutton').click();
  await page.getByRole('spinbutton').fill('5000');
  await page.getByRole('button', { name: 'Save' }).click();

  // Add sublocations once nursery feature is released

  await expect(page.getByRole('main')).toContainText('My Nursery');
  await expect(page.getByRole('main')).toContainText('My Nursery is very nice!!!!');
});

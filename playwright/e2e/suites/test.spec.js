import { test, expect } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

//ADE not sure what this is for?
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
});

test('Add A Species', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');
  await waitFor(page, '#home');

  await page.getByRole('button', { name: 'Species' }).click();
  await page.getByRole('button', { name: 'Add Species' }).click();
  await page.locator('#scientificName').getByRole('textbox').click();
  await page.locator('#scientificName').getByRole('textbox').fill('Acacia koa');

  await page.locator('#commonName').getByRole('textbox').click();
  await page.locator('#commonName').getByRole('textbox').fill('Koa');
  await page.locator('#growthForm').getByPlaceholder('Select...').click();
  await page
    .locator('li')
    .filter({ hasText: /^Tree$/ })
    .click();
  await page.locator('#seedStorageBehavior').getByPlaceholder('Select...').click();
  await page
    .locator('li')
    .filter({ hasText: /^Orthodox$/ })
    .click();
  await page
    .locator('div')
    .filter({ hasText: /^Select\.\.\.$/ })
    .nth(1)
    .click();
  await page.getByText('Tropical and subtropical dry').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Acacia koa')).toBeVisible();
  await expect(page.getByText('Koa', { exact: true })).toBeVisible();
});

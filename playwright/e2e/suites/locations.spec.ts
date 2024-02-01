import { test, expect } from '@playwright/test';

const waitFor = async (page, selector, timeout = 3000) => {
  // Seems weird to await in here with nothing else going on, but I am doing that explicitly so I can
  // ditch the return and keep the signature Promise<void>
  await page.waitForSelector(selector, { timeout });
};

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
});

test('Create a Seedbank', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:3000');

  const newSeedBankName = `My New Seed Bank-${new Date().getTime()}`

  await waitFor(page, '#home');

  await page.getByRole('button', { name: 'Locations' }).click();
  await page.getByRole('button', { name: 'Seed Banks' }).click();

  await page.getByRole('button', { name: 'Add Seed Bank' }).click();

  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill(newSeedBankName);
  await page.locator('textarea').click();
  await page.locator('textarea').fill('My Brand New Seed Bank!');
  //await page.getByLabel('Build Start Date').click();
  await page.getByLabel('Build Start Date').fill('2023-12-31');
  //await page.getByLabel('Build Completion Date').click();
  await page.getByLabel('Build Completion Date').fill('2024-01-31');
  //await page.getByLabel('Operation Start Date').click();
  await page.getByLabel('Operation Start Date').fill('2024-01-31');
  await page.getByRole('row', { name: 'Freezer 1' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Add Sub-Location' }).click();
  await page.locator('#sub-location-name').getByRole('textbox').click();
  await page.locator('#sub-location-name').getByRole('textbox').fill('Garage Freezer');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('row', { name: 'Refrigerator 3' }).getByRole('checkbox').check();
  await page.getByRole('row', { name: 'Refrigerator 2' }).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Add Sub-Location' }).click();
  await page.locator('#sub-location-name').getByRole('textbox').fill('Garage Fridge');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(newSeedBankName).nth(1)).toBeVisible();
  await expect(page.getByText('My Brand New Seed Bank!')).toBeVisible();
  await expect(page.getByText('Garage Fridge')).toBeVisible();
  await expect(page.getByText('Garage Freezer')).toBeVisible();
  await expect(page.getByText('Refrigerator 2')).toBeHidden();
  await expect(page.getByText('Refrigerator 3')).toBeHidden();
  await expect(page.getByText('Freezer 1')).toBeHidden();
  await page.getByRole('link', { name: 'Seed Banks' }).click();
  await expect(page.getByRole('cell', { name: newSeedBankName, exact: true })).toBeVisible();
  await page.getByRole('link', { name: newSeedBankName }).click();
  await expect(page.getByRole('main')).toContainText('My Brand New Seed Bank!');

});

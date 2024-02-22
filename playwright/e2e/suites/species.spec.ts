import { test, expect } from '@playwright/test';
import { waitFor } from '../utils/utils';

test.setTimeout(60000);
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

  const newSpeciesName = `Acacia koa-${process.env.TEST_WORKER_INDEX}`;

  await waitFor(page, '#home');

  await page.getByRole('button', { name: 'Species' }).click();

  await page.waitForTimeout(1000); //Wait for modal to load and be hydrated before interacting
  await page.getByRole('button', { name: 'Add Species' }).click();

  await page.locator('#scientificName').getByRole('textbox').click();

  await page.locator('#scientificName').getByRole('textbox').fill(newSpeciesName);

  await page.getByRole('heading', { name: 'Add Species' }).click();

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

  await expect(page.getByRole('main')).toContainText(`Scientific Name${newSpeciesName}`);
  await expect(page.getByRole('main')).toContainText('Common NameKoa');
  await expect(page.getByRole('main')).toContainText('Growth FormTree');
  await expect(page.getByRole('main')).toContainText('Seed Storage BehaviorOrthodox');
  await page.getByRole('link', { name: 'Species' }).click();
  await expect(page.getByText(newSpeciesName)).toBeVisible();
  await expect(page.locator('#row1-scientificName')).toContainText(newSpeciesName);
  await page.getByRole('link', { name: 'Acacia koa-' }).click();
  await page.locator('#more-options').click();
  await page.getByRole('menuitem', { name: 'Delete' }).click();
  await page.waitForTimeout(1000); //Wait for modal to load and be hydrated before interacting

  await page.locator('button.destructive-primary').click();

  await page.waitForTimeout(1000); //Test is slow here for some reason???
  await expect(page.getByText(newSpeciesName)).toBeHidden();
});

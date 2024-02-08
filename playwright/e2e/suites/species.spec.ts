import { test, expect } from '@playwright/test';
import { waitFor, addCookies } from '../utils/utils';

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function SpeciesTests() {
  test('Add and Delete A Species', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    const newSpeciesName = `Acacia koa-${new Date().getTime()}`;

    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Species' }).click();

    await page.waitForTimeout(1000); //Wait for modal to load and be hydrated before interacting
    await page.getByRole('button', { name: 'Add Species' }).click();

    await page.locator('#scientificName').getByRole('textbox').click();

    await page.locator('#scientificName').getByRole('textbox').fill(newSpeciesName);

    await page.locator('.dialog-box--header p.title').click();

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

    await expect(page.getByText(newSpeciesName)).toBeVisible();
    await expect(page.locator(`tr:has(> td[title="${newSpeciesName}"]) td[title="Koa"]`)).toBeVisible();

    await page.getByRole('row', { name: newSpeciesName }).getByRole('checkbox').check();

    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000); //Wait for modal to load and be hydrated before interacting
    await page.locator('button.destructive-primary').click();

    await page.waitForTimeout(1000); //Test is slow here for some reason???
    await expect(page.getByText(newSpeciesName)).toBeHidden();
  });
}

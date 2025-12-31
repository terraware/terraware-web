import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('SpeciesTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Add and Delete A Species', async ({ page }, testInfo) => {
    const newSpeciesName = `Acacia koa-${new Date().getTime()}`;

    await page.getByRole('button', { name: 'Species', ...exactOptions }).click();

    await page.waitForTimeout(1000); //Wait for modal to load and be hydrated before interacting
    await page.getByRole('button', { name: 'Add Species' }).click();

    await page.locator('#scientificName').getByRole('textbox').click();

    await page.locator('#scientificName').getByRole('textbox').fill(newSpeciesName);

    await page.getByRole('heading', { name: 'Add Species' }).click();

    await page.locator('#commonName').getByRole('textbox').click();
    await page.locator('#commonName').getByRole('textbox').fill('Koa');

    await page.locator('#growthForms').getByText('Select...').click();
    await page
      .locator('li')
      .filter({ hasText: /^Tree$/ })
      .click();
    await page.getByRole('heading', { name: 'Add Species' }).click();

    await page.locator('#seedStorageBehavior').getByPlaceholder('Select...').click();
    await page
      .locator('li')
      .filter({ hasText: /^Orthodox$/ })
      .click();

    await page.locator('#ecosystemTypes').getByText('Select...').click();
    await page.locator('li').getByText('Tropical and subtropical dry').click();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('main')).toContainText(`Scientific Name${newSpeciesName}`);
    await expect(page.getByRole('main')).toContainText('Common NameKoa');
    await expect(page.getByRole('main')).toContainText('Growth FormTree');
    await expect(page.getByRole('main')).toContainText('Seed Storage BehaviorOrthodox');
    await page.getByRole('link', { name: 'Species' }).click();
    await page.waitForTimeout(250); //Wait for table to load
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
});

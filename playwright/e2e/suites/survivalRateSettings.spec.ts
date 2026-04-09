import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('SurvivalRateSettingsTests', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Edit permanent plots T0 settings using observation data and verify survival rate on dashboard', async ({
    page,
  }) => {
    if (!(await page.getByRole('button', { name: 'Observations' }).isVisible())) {
      await page.getByRole('button', { name: 'Plantings' }).click();
    }
    await page.getByRole('button', { name: 'Observations' }).click();
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Survival Rate Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Survival Rate Settings' }).click();
    await page.getByRole('button', { name: 'Edit Permanent Plots' }).click();

    // On the Edit Survival Rate Settings page select 'Use Observation data' for each permanent plot
    await expect(page.getByLabel('Use Observation data').first()).toBeVisible();
    const plotCount = await page.getByLabel('Use Observation data').count();
    for (let i = 0; i < plotCount; i++) {
      await page.getByLabel('Use Observation data').nth(i).click();
      await page.getByPlaceholder('Select...').nth(i).click();
      await page.locator('li.select-value').first().click();
    }

    await page.locator('#saveSettings').click();
    await expect(page.getByText('t0 set for Permanent Plots')).toBeVisible();

    // Navigate to Dashboard
    if (!(await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).isVisible())) {
      await page.getByRole('button', { name: 'Plantings' }).click();
    }
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();
    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByTestId('survival-rate-value')).toHaveText('100%');
  });

  test('Edit one plot to manual density and verify new survival rate', async ({ page }) => {
    if (!(await page.getByRole('button', { name: 'Observations' }).isVisible())) {
      await page.getByRole('button', { name: 'Plantings' }).click();
    }
    await page.getByRole('button', { name: 'Observations' }).click();
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Survival Rate Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Survival Rate Settings' }).click();
    await page.getByRole('button', { name: 'Edit Permanent Plots' }).click();
    await expect(page.getByLabel('Use Observation data').first()).toBeVisible();

    await page.getByLabel('Provide plant density per species').first().click();

    // Override one density value
    const bananaRow = page
      .locator('tr')
      .filter({ hasText: /banana/i })
      .first();
    await bananaRow.locator('input[type="number"]').fill('400');

    await page.locator('#saveSettings').click();
    await expect(page.getByText('t0 set for Permanent Plots')).toBeVisible();

    // Navigate to Plantings > Dashboard
    if (!(await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).isVisible())) {
      await page.getByRole('button', { name: 'Plantings' }).click();
    }
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();
    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByTestId('survival-rate-value')).toHaveText('99%');
  });
});

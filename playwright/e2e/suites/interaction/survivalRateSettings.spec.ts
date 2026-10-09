import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { openNavItem, selectOrg, waitFor } from '../../utils/utils';

const SURVIVAL_RATE_POLL_TIMEOUT = 90000;

const verifySurvivalRateRecalculatedOnDashboard = async (page: Page, baseURL: string | undefined, expected: string) => {
  await openNavItem(page, 'Plantings', 'Dashboard');
  await page.getByPlaceholder('Select...').click();
  await page.getByText('PS2', { exact: true }).click();

  const recalculationMessage = page.getByText('Survival Rate Recalculation In-Progress');
  await expect(recalculationMessage).toBeVisible();

  await page.waitForURL((url) => /^\/plants\/dashboard\/\d+$/.test(url.pathname));
  const plantingSiteId = new URL(page.url()).pathname.split('/').pop();
  const response = await page.request.post(
    `${baseURL}/api/v1/tracking/sites/${plantingSiteId}/completeSurvivalRateCalculation`,
    { timeout: 120000 }
  );
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).calculationInProgress).toBe(false);

  // The dashboard picks up the recalculated values on its next calculation status poll.
  await expect(recalculationMessage).toBeHidden({ timeout: SURVIVAL_RATE_POLL_TIMEOUT });
  await expect(page.getByTestId('survival-rate-value')).toHaveText(expected);
};

test.describe('SurvivalRateSettingsTests', () => {
  // these tests are slower and pollute each other so need to run serially
  test.describe.configure({ timeout: 300000, mode: 'serial' });

  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Edit permanent plots T0 settings using observation data and verify survival rate on dashboard', async ({
    page,
    baseURL,
  }) => {
    await openNavItem(page, 'Plantings', 'Observations');
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
    await expect(page.getByText('t0 set for Permanent Plots')).toBeVisible({ timeout: 60000 });

    await verifySurvivalRateRecalculatedOnDashboard(page, baseURL, '90%');
  });

  test('Edit one plot to manual density and verify new survival rate', async ({ page, baseURL }) => {
    await openNavItem(page, 'Plantings', 'Observations');
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();
    await expect(page.getByRole('button', { name: 'Survival Rate Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Survival Rate Settings' }).click();
    await page.getByRole('button', { name: 'Edit Permanent Plots' }).click();
    await expect(page.getByLabel('Use Observation data').first()).toBeVisible();

    const plotCount = await page.getByLabel('Use Observation data').count();

    // Set first plot to manual density
    await page.getByLabel('Provide plant density per species').first().click();
    const bananaRow = page
      .locator('tr')
      .filter({ hasText: /banana/i })
      .first();
    await bananaRow.locator('input[type="number"]').fill('800');

    // Set all remaining plots to observation data
    for (let i = 1; i < plotCount; i++) {
      await page.getByLabel('Use Observation data').nth(i).click();
      await page.getByPlaceholder('Select...').nth(i).click();
      await page.locator('li.select-value').first().click();
    }

    await page.locator('#saveSettings').click();
    await expect(page.getByText('t0 set for Permanent Plots')).toBeVisible({ timeout: 60000 });

    await verifySurvivalRateRecalculatedOnDashboard(page, baseURL, '88%');
  });
});

import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('ParticipantPlantsDashboardTests', () => {
  test.beforeEach(async ({ page, context }, testInfo) => {
    await changeToSuperAdmin(context);
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
  });

  test('Rolled-up dashboard for selected project', async ({ page }, testInfo) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('No Project Selected').click();
    await page.getByText('Phase 1 Project', { exact: true }).click();

    await expect(page.getByText('Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('10,879.4 ha').first()).toBeVisible();
    await expect(page.getByText('Project Area Totals', { exact: true })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^0 ha$/ })
        .getByRole('paragraph')
    ).toBeVisible();
    await expect(page.getByText('Total Planted Complete', { exact: true })).toBeVisible();
    await expect(page.getByText('Planting Complete: 0%', { exact: true })).toBeVisible();
    await expect(page.getByText('Target: 10,879.4 ha', { exact: true })).toBeVisible();
    await expect(page.getByText('200 Plants', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(1)).toBeVisible();
    await expect(page.getByText('1 Species', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(2)).toBeVisible();
    await expect(page.getByText('Planted Species', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsBySpecies')).toBeVisible();
    await expect(page.getByText('Species Categories', { exact: true })).toBeVisible();
    await expect(page.locator('#speciesByCategory')).toBeVisible();
    await expect(page.getByText('Project Area Map', { exact: true })).toBeVisible();
    await expect(page.getByText('10,879.4 ha in Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('Boundaries')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Observation Events$/ })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observation Events$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Survival Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });

  test('Planting site dashboard no observations', async ({ page }, testInfo) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS1', { exact: true }).click();

    await expect(page.getByText('Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('6,788.4 ha').first()).toBeVisible();
    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^0 ha$/ })
        .getByRole('paragraph')
    ).toBeVisible();
    await expect(page.getByText('Total Planted Complete', { exact: true })).toBeVisible();
    await expect(page.getByText('Planting Complete: 0%', { exact: true })).toBeVisible();
    await expect(page.getByText('Target: 6,788.4 ha', { exact: true })).toBeVisible();
    await expect(page.getByText('100 Plants', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(1)).toBeVisible();
    await expect(page.getByText('1 Species', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(2)).toBeVisible();
    await expect(page.getByText('Planted Species', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsBySpecies')).toBeVisible();
    await expect(page.getByText('Species Categories', { exact: true })).toBeVisible();
    await expect(page.locator('#speciesByCategory')).toBeVisible();
    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();
    await expect(page.getByText('6,788.4 ha in Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('Boundaries')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Observation Events$/ })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observation Events$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Survival Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });

  test('Planting site dashboard observations', async ({ page }, testInfo) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();
    await expect(page.getByText('Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('4,091 ha').first()).toBeVisible();
    await expect(
      page.getByText(
        'Observation data on this dashboard is based on a sample of 2.97 hectares from the 2025-05-29 Observation for this planting site.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^0 ha$/ })
        .getByRole('paragraph')
    ).toBeVisible();
    await expect(page.getByText('Total Planted Complete', { exact: true })).toBeVisible();
    await expect(page.getByText('Planting Complete: 0%', { exact: true })).toBeVisible();
    await expect(page.getByText('Target: 4,091 ha', { exact: true })).toBeVisible();
    await expect(page.getByText('100 Plants', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(1)).toBeVisible();
    await expect(page.getByText('1 Species', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(2)).toBeVisible();
    await expect(page.getByText('Planted Species', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsBySpecies')).toBeVisible();
    await expect(page.getByText('Species Categories', { exact: true })).toBeVisible();
    await expect(page.locator('#speciesByCategory')).toBeVisible();
    await expect(page.getByText('Zone Trends', { exact: true })).toBeVisible();
    await expect(page.getByText('All Observations', { exact: true })).toBeVisible();
    await expect(page.getByText('Plants per Ha', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsPerHaChart')).toBeVisible();
    await expect(page.getByText('Survival Rate').first()).toBeVisible();
    await expect(page.locator('#mortalityChart')).toBeVisible();
    await expect(page.getByText('Plant Density', { exact: true })).toBeVisible();
    await expect(page.getByText('as of 2025-05-29 Observation').first()).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observed Density$/ })
        .getByRole('paragraph')
    ).toBeVisible();
    await expect(page.getByText('1,014Plants/ha')).toBeVisible();
    await expect(page.getByText('Observed Density Per Zone')).toBeVisible();
    await expect(page.locator('#plantingDensityByZone')).toBeVisible();
    await expect(page.getByText('Survival Rate').nth(1)).toBeVisible();
    await expect(page.getByText('as of 2025-05-29 Observation').nth(1)).toBeVisible();
    await expect(page.getByText('Survival Rate').nth(2)).toBeVisible();
    // await expect(page.getByText('10%').first()).toBeVisible();
    await expect(page.getByText('Zone Survival', { exact: true })).toBeVisible();
    await expect(page.getByText('Highest').first()).toBeVisible();
    // await expect(page.getByText('Zone 01', { exact: true })).toBeVisible();
    // await expect(page.locator('p').filter({ hasText: '10%' })).toBeVisible();
    await expect(page.getByText('Lowest').first()).toBeVisible();
    // await expect(page.getByText('Zone 02', { exact: true })).toBeVisible();
    // await expect(page.locator('p').filter({ hasText: '9%' })).toBeVisible();
    await expect(page.getByText('Species Survival', { exact: true })).toBeVisible();
    await expect(page.getByText('Highest').nth(1)).toBeVisible();
    // await expect(page.getByText('Other 2', { exact: true })).toBeVisible();
    // await expect(page.getByText('15%', { exact: true })).toBeVisible();
    await expect(page.getByText('Lowest').nth(1)).toBeVisible();
    // await expect(page.getByText('Other 5', { exact: true })).toBeVisible();
    // await expect(page.getByText('4%', { exact: true })).toBeVisible();
    await expect(page.getByText('Species Survival Breakdown', { exact: true })).toBeVisible();
    await expect(
      page.locator('div:nth-child(2) > div > .select > .textfield-container > .textfield-value')
    ).toBeVisible();

    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();
    await expect(page.getByText('as of 2025-05-29 Observation').nth(1)).toBeVisible();
    await expect(page.getByText('4,091 ha in Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('Boundaries')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Observation Events$/ })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observation Events$/ })
        .getByRole('checkbox')
    ).toBeChecked({ checked: false });
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Survival Rate$/ })
        .getByRole('checkbox')
    ).toBeChecked({ checked: false });
  });

  test('Plants Dashboard empty state', async ({ page }, testInfo) => {
    await selectOrg(page, 'Empty Organization');
    // Remove this reload and the 5000ms timeout below once SW-7678 is fixed
    await page.reload();

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await expect(page.getByText('To view data in this dashboard, add a planting site', { exact: true })).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.getByText(
        'This dashboard displays data from your plant tracking and monitoring activities. Add at least one planting site to start tracking where your seedlings are planted and to see the data in this dashboard.',
        { exact: true }
      )
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add a Planting Site' })).toBeVisible();
    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^0 ha$/ })
        .getByRole('paragraph')
    ).toBeVisible();
    await expect(page.getByText('Total Planted Complete', { exact: true })).toBeVisible();
    await expect(page.getByText('Planting Complete: 0%', { exact: true })).toBeVisible();
    await expect(page.getByText('Target: 0 ha', { exact: true })).toBeVisible();
    await expect(page.getByText('0 Plants', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(1)).toBeVisible();
    await expect(page.getByText('0 Species', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planted').nth(2)).toBeVisible();
    await expect(page.getByText('Planted Species', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsBySpecies')).toBeVisible();
    await expect(page.getByText('Species Categories', { exact: true })).toBeVisible();
    await expect(page.locator('#speciesByCategory')).toBeVisible();
    await expect(page.getByText('Project Area Map', { exact: true })).toBeVisible();
    await expect(page.getByText('0 ha in Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('Boundaries')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Observation Events$/ })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observation Events$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Survival Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });
});

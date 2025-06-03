import { expect, test } from '@playwright/test';

import { addCookies, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function PlantsDashboardTests() {
  test('View Empty State of Plants Dashboard for project in Console', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await expect(page.getByRole('main').getByText('Overview')).toBeVisible();
    await page.getByRole('link', { name: 'Phase 0 Project Deal' }).click();
    await page.getByRole('tab', { name: 'Plants Dashboard' }).click();
    await expect(page.getByText('Phase 0 Project Deal', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('0 ha').first()).toBeVisible();
    await expect(
      page.getByText('To view the dashboard, you need to have a planting site.', { exact: true })
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
        .filter({ hasText: /^Mortality Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });

  test('View rolled-up dashboard for project in Console', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await expect(page.getByRole('main').getByText('Overview')).toBeVisible();
    await page.getByRole('link', { name: 'Phase 1 Project Deal' }).click();
    await page.getByRole('tab', { name: 'Plants Dashboard' }).click();
    await expect(page.getByText('Phase 1 Project Deal', { exact: true })).toBeVisible();
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
        .filter({ hasText: /^Mortality Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });

  test('View dashboard for single planting site with no observations in Console', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await expect(page.getByRole('main').getByText('Overview')).toBeVisible();
    await page.getByRole('link', { name: 'Phase 1 Project Deal' }).click();
    await page.getByRole('tab', { name: 'Plants Dashboard' }).click();
    await expect(page.getByText('Phase 1 Project Deal', { exact: true })).toBeVisible();
    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS1').click();
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
        .filter({ hasText: /^Mortality Rate$/ })
        .getByRole('checkbox')
    ).toBeDisabled();
  });

  test('View dashboard for single planting site with observations in Console', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await expect(page.getByRole('main').getByText('Overview')).toBeVisible();
    await page.getByRole('link', { name: 'Phase 1 Project Deal' }).click();
    await page.getByRole('tab', { name: 'Plants Dashboard' }).click();
    await expect(page.getByText('Phase 1 Project Deal', { exact: true })).toBeVisible();
    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2').click();
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
    await expect(page.getByText('Mortality Rate').first()).toBeVisible();
    await expect(page.locator('#mortalityChart')).toBeVisible();
    await expect(page.getByText('Planting Density', { exact: true })).toBeVisible();
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
    await expect(page.getByText('Mortality Rate').nth(1)).toBeVisible();
    await expect(page.getByText('as of 2025-05-29 Observation').nth(1)).toBeVisible();
    await expect(page.getByText('Mortality Rate').nth(2)).toBeVisible();
    await expect(page.getByText('10%').first()).toBeVisible();
    await expect(page.getByText('Zone Mortality', { exact: true })).toBeVisible();
    await expect(page.getByText('Highest').first()).toBeVisible();
    await expect(page.getByText('Zone 01', { exact: true })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '10%' })).toBeVisible();
    await expect(page.getByText('Lowest').first()).toBeVisible();
    await expect(page.getByText('Zone 02', { exact: true })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '9%' })).toBeVisible();
    await expect(page.getByText('Species Mortality', { exact: true })).toBeVisible();
    await expect(page.getByText('Highest').nth(1)).toBeVisible();
    await expect(page.getByText('Other 2', { exact: true })).toBeVisible();
    await expect(page.getByText('15%', { exact: true })).toBeVisible();
    await expect(page.getByText('Lowest').nth(1)).toBeVisible();
    await expect(page.getByText('Other 5', { exact: true })).toBeVisible();
    await expect(page.getByText('4%', { exact: true })).toBeVisible();
    await expect(page.getByText('Mortality Breakdown', { exact: true })).toBeVisible();
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
    ).toBeChecked();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Mortality Rate$/ })
        .getByRole('checkbox')
    ).toBeChecked();
  });
}

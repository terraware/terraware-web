import { expect, test } from '@playwright/test';

import { addCookies, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function PlantsDashbordTests() {
  test('View Empty State of Plants Dashboard for project in Console', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
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
    await expect(page.getByText('Species Categories', { exact: true })).toBeVisible();
    await expect(page.getByText('Project Area Map', { exact: true })).toBeVisible();
    await expect(page.getByText('0 ha in Total Planting Area', { exact: true })).toBeVisible();
    await expect(page.getByText('Boundaries')).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Observation Events$/ })).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Observation Events$/ })
        .isDisabled()
    ).toBeTruthy();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Mortality Rate$/ })
        .isDisabled()
    ).toBeTruthy();
  });
}

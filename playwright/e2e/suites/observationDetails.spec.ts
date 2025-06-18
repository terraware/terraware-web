import { expect, test } from '@playwright/test';

import { addCookies, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function ObservationDetailsTests() {
  test('Observation level detail view, including statistics and charts', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // metrics
    await expect(page.getByText('Plants').nth(1)).toBeVisible();
    await expect(page.getByText('Species', { exact: true }).nth(1)).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Planting Density' })).toBeVisible();
    await expect(page.getByText('Mortality Rate').first()).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Mortality Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsMortalityRateBySpecies')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Zone' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Species' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Planting Density' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Mortality Rate' })).toBeVisible();
  });

  test('Zone level observation detail view, including statistics and charts', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to zone details
    await page.locator('a:has-text("Zone 01")').click();
    await waitFor(page, '#home');

    // metrics
    await expect(page.getByText('Plants').nth(1)).toBeVisible();
    await expect(page.getByText('Species', { exact: true }).nth(1)).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Planting Density' })).toBeVisible();
    await expect(page.getByText('Mortality Rate').first()).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per Species')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Mortality Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsMortalityRateBySpecies')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Monitoring Plot', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Subzone' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Monitoring Plot Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Species' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Planting Density' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Mortality Rate' })).toBeVisible();
  });

  test('Plot level observation detail view, including statistics, charts, and photos', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to zone details
    await page.locator('a:has-text("Zone 01")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to monitoring plot details
    await page.locator('#row1 a').click();
    await waitFor(page, '#home');

    // details
    await expect(page.getByText('Details')).toBeVisible();
    await expect(page.getByText('Date')).toBeVisible();
    await expect(page.getByText('Time')).toBeVisible();
    await expect(page.getByText('Observer')).toBeVisible();
    await expect(page.getByText('Time')).toBeVisible();
    await expect(page.getByText('Zone', { exact: true })).toBeVisible();
    await expect(page.getByText('Subzone', { exact: true })).toBeVisible();
    await expect(page.getByText('Monitoring Plot Type')).toBeVisible();
    await expect(page.getByRole('main').getByText('Plants', { exact: true })).toBeVisible();
    await expect(page.getByRole('main').getByText('Species', { exact: true })).toBeVisible();
    await expect(page.getByText('Planting Density')).toBeVisible();
    await expect(page.getByText('Mortality Rate', { exact: true })).toBeVisible();
    await expect(page.getByText('Number of Photos')).toBeVisible();
    await expect(page.getByText('Plot Conditions')).toBeVisible();
    await expect(page.getByText('Field Notes')).toBeVisible();
    await expect(page.getByText('Plot Location')).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per Species')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Mortality Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsMortalityRateBySpecies')).toBeVisible();

    // photos
    await expect(page.getByText('Photos', { exact: true })).toBeVisible();
  });
}

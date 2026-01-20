import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { selectOrg, waitFor } from '../utils/utils';

test.describe('ObservationDetailsTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');
  });

  test('Observation level detail view, including statistics and charts', async ({ page }, testInfo) => {
    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // metrics
    await expect(page.getByText('Live Plants').nth(1)).toBeVisible();
    await expect(page.getByText('Species', { exact: true }).nth(1)).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Plant Density' })).toBeVisible();
    await expect(page.getByText('Survival Rate').first()).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per Species')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Survival Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsSurvivalRateBySpecies')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Stratum' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Live Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Species', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Plant Density' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Survival Rate' })).toBeVisible();

    // table row values
    await expect(page.locator('#row1-stratumName a:has-text("Stratum 01")')).toBeVisible();
    await expect(page.locator('#row1-completedDate p:has-text("2025-05-29")')).toBeVisible();
    await expect(page.locator('#row1-status p:has-text("Completed")')).toBeVisible();
    await expect(page.locator('#row1-totalPlants p:has-text("944")')).toBeVisible();
    await expect(page.locator('#row1-totalSpecies p:has-text("9")')).toBeVisible();
    await expect(page.locator('#row1-plantingDensity p:has-text("852")')).toBeVisible();
    // await expect(page.locator('#row1-mortalityRate p:has-text("10%")')).toBeVisible();
  });

  test('Stratum level observation detail view, including statistics and charts', async ({ page }, testInfo) => {
    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to stratum details
    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');

    // metrics
    await expect(page.getByText('Live Plants').nth(1)).toBeVisible();
    await expect(page.getByText('Species', { exact: true }).nth(1)).toBeVisible();
    await expect(page.locator('p').filter({ hasText: 'Plant Density' })).toBeVisible();
    await expect(page.getByText('Survival Rate').first()).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per Species')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Survival Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsSurvivalRateBySpecies')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Monitoring Plot', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Substratum' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Monitoring Plot Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Live Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Total Plants' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Species', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Plant Density' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Survival Rate' })).toBeVisible();

    // table row values
    await expect(page.locator('#row1-monitoringPlotNumber a:has-text("1")')).toBeVisible();
    await expect(page.locator('#row1-substratumName p:has-text("Substratum A")')).toBeVisible();
    await expect(page.locator('#row1-completedDate p:has-text("2025-05-29")')).toBeVisible();
    await expect(page.locator('#row1-status p:has-text("Completed")')).toBeVisible();
    await expect(page.locator('#row1-isPermanent p:has-text("Permanent")')).toBeVisible();
    await expect(page.locator('#row1-totalPlants p:has-text("85")')).toBeVisible();
    await expect(page.locator('#row1-totalSpecies p:has-text("7")')).toBeVisible();
    await expect(page.locator('#row1-plantingDensity p:has-text("756")')).toBeVisible();
    // await expect(page.locator('#row1-mortalityRate p:has-text("13%")')).toBeVisible();
  });

  test('Plot level observation detail view, including statistics, charts, and photos', async ({ page }, testInfo) => {
    // navigate to observation details
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to stratum details
    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');

    // wait for table rows to load
    await waitFor(page, '#row1');

    // navigate to monitoring plot details
    await page.locator('#row1 a').click();
    await waitFor(page, '#home');

    // details
    await expect(page.getByText('Observed by Super Admin on 2025-05-29 at 6:50 PM')).toBeVisible();
    await page.getByText('Plot Info').hover();
    await expect(page.getByText('Stratum: Stratum 01')).toBeVisible();
    await expect(page.getByText('Substratum: Substratum A')).toBeVisible();
    await expect(page.getByText('Plot Type: Permanent')).toBeVisible();
    await expect(page.getByText('Location: 38.44150597, 15.6977629')).toBeVisible();
    await expect(page.locator('p:has-text("Total Plants")')).toBeVisible();
    await expect(page.getByText('85')).toBeVisible();
    await expect(page.locator('p').filter({ hasText: /^Species$/ })).toBeVisible();
    await expect(page.getByText('7', { exact: true })).toBeVisible();
    await expect(page.locator('p:has-text("Plant Density")')).toBeVisible();
    await expect(page.getByText('756')).toBeVisible();
    await expect(page.getByText('Survival Rate', { exact: true })).toBeVisible();
    // await expect(
    //   page.locator('label.textfield-label:has-text("Survival Rate") + p.textfield-value--display:has-text("13")')
    // ).toBeVisible();
    await expect(page.locator('label.textfield-label:has-text("Plot Conditions")')).toBeVisible();
    await expect(
      page.locator('label.textfield-label:has-text("Plot Conditions") + p.textfield-value--display:has-text("- -")')
    ).toBeVisible();
    await expect(page.locator('label.textfield-label:has-text("Field Notes")')).toBeVisible();
    await expect(
      page.locator(
        'label.textfield-label:has-text("Field Notes") + p.textfield-value--display:has-text("Notes for plot 5162")'
      )
    ).toBeVisible();

    // charts
    await expect(page.getByText('Number of Live Plants per Species')).toBeVisible();
    await expect(page.locator('#observationsTotalPlantsBySpecies')).toBeVisible();
    await expect(page.getByText('Survival Rate per Species')).toBeVisible();
    await expect(page.locator('#observationsSurvivalRateBySpecies')).toBeVisible();

    // photos
    await expect(page.getByRole('tab', { name: 'Photos & Videos' })).toBeVisible();
  });
});

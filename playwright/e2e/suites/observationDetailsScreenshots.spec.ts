import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { selectOrg, waitFor } from '../utils/utils';

const SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02,
};

const MAP_SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  // Higher threshold for map canvas: tile rendering can vary slightly between runs
  maxDiffPixelRatio: 0.05,
};

/**
 * Mask chart canvas elements to avoid pixel-level flakiness from antialiasing
 * and Chart.js rendering differences between runs.
 */
const chartMasks = (page: Page) => [
  page.locator('#observationSpeciesTotalChart'),
  page.locator('#observationSurvivalRateChart'),
  page.locator('#plotSpeciesTotalChart'),
  page.locator('#plotSpeciesSurvivalRate'),
];

/**
 * Wait for the Mapbox map to finish loading tiles and reach idle state.
 * The map sets data-map-idle="true" on the container once the idle event fires.
 */
const waitForMapIdle = async (page: Page) => {
  await page.locator('.mapboxgl-map[data-map-idle="true"]').first().waitFor({ timeout: 20000 });
};

test.describe('ObservationDetailsScreenshots', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home', 10000);
    await selectOrg(page, 'Terraformation (staging)');
    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Observations' }).click();
    await waitFor(page, '#row1', 10000);
  });

  test('Observation list view', async ({ page }) => {
    await expect(page).toHaveScreenshot('observation-list.png', SCREENSHOT_OPTIONS);
  });

  test('Observation list map — monitoring plots and survival rate', async ({ page }) => {
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();

    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'observation-list-map.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Observation list map — survival rate legend toggled on', async ({ page }) => {
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();

    await waitForMapIdle(page);

    // Toggle the survival rate layer on via the map legend
    await page.locator('.map-container').getByText('Survival Rate', { exact: true }).click();
    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'observation-list-map-survival-rate.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Observation level detail view — stats and charts', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // Wait for charts to render before screenshotting
    await expect(page.locator('#observationSpeciesTotalChart')).toBeVisible();
    await expect(page.locator('#observationSurvivalRateChart')).toBeVisible();

    await expect(page).toHaveScreenshot('observation-detail-level.png', {
      ...SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Observation level detail view — strata table', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await expect(page.locator('#row1')).toBeVisible();
    await expect(page.getByRole('table').first()).toHaveScreenshot(
      'observation-strata-table.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('Observation level detail view — map', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');

    // The detail view defaults to list view; switch to map view
    await page.getByText('Map', { exact: true }).click();

    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'observation-detail-map.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Stratum level detail view — stats and charts', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');

    await expect(page.locator('#observationSpeciesTotalChart')).toBeVisible();
    await expect(page.locator('#observationSurvivalRateChart')).toBeVisible();

    await expect(page).toHaveScreenshot('observation-stratum-detail.png', {
      ...SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Stratum level detail view — monitoring plots table', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await expect(page.locator('#row1')).toBeVisible();
    await expect(page.getByRole('table').first()).toHaveScreenshot(
      'observation-monitoring-plots-table.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('Monitoring plot level detail view — general tab', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('#row1 a').click();
    await waitFor(page, '#home');

    await expect(page.locator('#plotSpeciesTotalChart')).toBeVisible();
    await expect(page.locator('#plotSpeciesSurvivalRate')).toBeVisible();

    await expect(page).toHaveScreenshot('observation-plot-detail-general.png', {
      ...SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Monitoring plot level detail view — species table', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('#row1 a').click();
    await waitFor(page, '#home');

    // The species editable table (MonitoringPlotSpeciesEditableTable)
    await expect(page.getByRole('table').first()).toBeVisible();
    await expect(page.getByRole('table').first()).toHaveScreenshot(
      'observation-plot-species-table.png',
      SCREENSHOT_OPTIONS
    );
  });

  test('Monitoring plot level detail view — photos and videos tab', async ({ page }) => {
    await page.locator('a:has-text("May 2025")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('a:has-text("Stratum 01")').click();
    await waitFor(page, '#home');
    await waitFor(page, '#row1');

    await page.locator('#row1 a').click();
    await waitFor(page, '#home');

    await page.getByRole('tab', { name: 'Photos & Videos' }).click();

    await expect(page).toHaveScreenshot('observation-plot-photos-tab.png', SCREENSHOT_OPTIONS);
  });

  test('Survival rate settings view', async ({ page }) => {
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();

    await expect(page.getByRole('button', { name: 'Survival Rate Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Survival Rate Settings' }).click();
    await waitFor(page, '#home');

    await expect(page).toHaveScreenshot('survival-rate-settings.png', SCREENSHOT_OPTIONS);
  });

  test('Edit survival rate settings view', async ({ page }) => {
    await page.locator('.select').first().click();
    await page.getByRole('list').getByText('PS2', { exact: true }).click();

    await expect(page.getByRole('button', { name: 'Survival Rate Settings' })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Survival Rate Settings' }).click();
    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Edit Permanent Plots' }).click();
    await expect(page.getByLabel('Use Observation data').first()).toBeVisible();

    await expect(page).toHaveScreenshot('survival-rate-settings-edit.png', SCREENSHOT_OPTIONS);
  });
});

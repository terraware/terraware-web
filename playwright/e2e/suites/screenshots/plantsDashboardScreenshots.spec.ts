import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../../utils/utils';

// For element-level screenshots (cards, tables) where content is uniform
const SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02,
};

// For full-page screenshots: a slightly higher threshold accommodates minor
// font/antialiasing differences between rendering environments
const FULL_PAGE_SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.06,
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
  page.locator('#plantsBySpecies'),
  page.locator('#speciesByCategory'),
  page.locator('#plantsPerHaChart'),
  page.locator('#survivalChart'),
  page.locator('#plantingDensityByStratum'),
];

/**
 * Wait for the Mapbox map to finish loading tiles and reach idle state.
 * The map sets data-map-idle="true" on the container once the idle event fires.
 */
const waitForMapIdle = async (page: Page) => {
  await page.locator('.mapboxgl-map[data-map-idle="true"]').first().waitFor();
};

test.describe('PlantsDashboardScreenshots', () => {
  // These tests involve multiple page navigations and map tile loading, so they
  // need a longer timeout than the default (especially in Linux Docker).
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'prod', 'Screenshot tests only run against the prod build');

    // Abort the app version check so the "Please refresh" banner never appears.
    // Locally the frontend and backend versions can differ, triggering the banner and
    // shifting all page content. CI does not show it, so snapshots must be generated
    // without it to match what CI renders.
    await page.route(/build-version\.txt/, (route) => route.abort());

    await changeToSuperAdmin(context, baseURL);
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await waitFor(page, '#home', 15000);
  });

  test('Plants Dashboard empty state — no planting sites', async ({ page }) => {
    await selectOrg(page, 'Empty Organization');
    // Reload to ensure org switch is fully applied before navigating
    await page.reload();
    await waitFor(page, '#home', 15000);

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await expect(page.getByText('To view data in this dashboard, add a planting site', { exact: true })).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('plants-dashboard-empty-state.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Plants Dashboard default view — no planting site selected', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();
    await page.goto('/plants/dashboard');

    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('plants-dashboard-default.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Plants Dashboard — project area totals with rolled-up view', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('No Project Selected').click();
    await page.getByText('Phase 1 Project', { exact: true }).click();

    await expect(page.getByText('Project Area Totals', { exact: true })).toBeVisible();
    await expect(page.getByText('Project Area Map', { exact: true })).toBeVisible();

    await waitForMapIdle(page);

    await expect(page).toHaveScreenshot('plants-dashboard-project-rolled-up.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Plants Dashboard — planting site with no observations (plants and species card)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS1', { exact: true }).click();

    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();

    await expect(page).toHaveScreenshot('plants-dashboard-no-observations.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Plants Dashboard — planting site with no observations (site map)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS1', { exact: true }).click();

    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();
    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'plants-dashboard-no-observations-site-map.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Plants Dashboard — planting site with observations (full page)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await expect(page.getByText('Stratum Trends', { exact: true })).toBeVisible();
    await expect(page.getByText('Observed Density', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Survival Rate').first()).toBeVisible();
    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();

    await expect(page).toHaveScreenshot('plants-dashboard-with-observations.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: chartMasks(page),
    });
  });

  test('Plants Dashboard — planting site with observations (stratum trends card)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByText('Stratum Trends', { exact: true })).toBeVisible();
    await expect(page.locator('#plantsPerHaChart')).toBeVisible();
    await expect(page.locator('#survivalChart')).toBeVisible();

    await expect(page).toHaveScreenshot('plants-dashboard-stratum-trends.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: [page.locator('#plantsPerHaChart'), page.locator('#survivalChart')],
    });
  });

  test('Plants Dashboard — planting site with observations (plant density card)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByText('Observed Density', { exact: true }).first()).toBeVisible();
    await expect(page.locator('#plantingDensityByStratum')).toBeVisible();

    await expect(page).toHaveScreenshot('plants-dashboard-plant-density.png', {
      ...FULL_PAGE_SCREENSHOT_OPTIONS,
      mask: [page.locator('#plantingDensityByStratum')],
    });
  });

  test('Plants Dashboard — planting site with observations (site map)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();
    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'plants-dashboard-observations-site-map.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Plants Dashboard — site map with observation events layer toggled on', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await page.getByPlaceholder('Select...').click();
    await page.getByText('PS2', { exact: true }).click();

    await expect(page.getByText('Site Map', { exact: true })).toBeVisible();
    await waitForMapIdle(page);

    // Toggle observation events layer on via the map legend
    await page
      .locator('div')
      .filter({ hasText: /^Observation Events$/ })
      .getByRole('checkbox')
      .check();
    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'plants-dashboard-site-map-observation-events.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });

  test('Plants Dashboard — project area map (no planting site selected)', async ({ page }) => {
    await selectOrg(page, 'Terraformation (staging)');

    await page.getByRole('button', { name: 'Plantings' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();

    await expect(page.getByText('Planting Site Totals', { exact: true })).toBeVisible();
    await waitForMapIdle(page);

    await expect(page.locator('.map-container').first()).toHaveScreenshot(
      'plants-dashboard-project-area-map.png',
      MAP_SCREENSHOT_OPTIONS
    );
  });
});

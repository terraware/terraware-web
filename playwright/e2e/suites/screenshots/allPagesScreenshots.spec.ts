import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { selectOrg, waitFor } from '../../utils/utils';

const FULL_PAGE_SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.015,
  fullPage: true,
};

// Mask canvas (charts, maps) and Mapbox overlays to avoid non-deterministic pixel diffs.
const pageMasks = (page: Page) => [page.locator('canvas'), page.locator('.mapboxgl-map')];

const TERRAWARE_PAGES: { name: string; path: string }[] = [
  { name: 'home', path: '/home' },
  { name: 'seeds-dashboard', path: '/seeds-dashboard' },
  { name: 'inventory', path: '/inventory' },
  { name: 'nursery-withdrawals', path: '/nursery/withdrawals' },
  { name: 'species', path: '/species' },
  { name: 'people', path: '/people' },
  { name: 'projects', path: '/projects' },
  { name: 'deliverables', path: '/deliverables' },
  { name: 'reports', path: '/reports' },
  { name: 'settings', path: '/settings' },
];

const ACCELERATOR_PAGES: { name: string; path: string }[] = [
  { name: 'accelerator-projects', path: '/accelerator/projects' },
  { name: 'accelerator-deliverables', path: '/accelerator/deliverables' },
  { name: 'accelerator-people', path: '/accelerator/people' },
  { name: 'accelerator-applications', path: '/accelerator/applications' },
  { name: 'accelerator-documents', path: '/accelerator/documents' },
  { name: 'accelerator-modules', path: '/accelerator/modules' },
  { name: 'accelerator-funding-entities', path: '/accelerator/funding-entities' },
];

test.describe('AllPagesScreenshots', () => {
  test.describe.configure({ timeout: 240000 });

  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    test.skip(testInfo.project.name !== 'prod', 'Screenshot tests only run against the prod build');

    // Abort the build-version check so the "Please refresh" banner never appears.
    await page.route(/build-version\.txt/, (route) => route.abort());

    await changeToSuperAdmin(context, baseURL);
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/');
    await waitFor(page, '#home', 15000);
    await selectOrg(page, 'Terraformation (staging)');
    await page.reload();
    await waitFor(page, '#home', 15000);
  });

  test.describe('Terraware pages', () => {
    for (const { name, path } of TERRAWARE_PAGES) {
      test(`page-${name}`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await expect(page).toHaveScreenshot(`page-${name}.png`, {
          ...FULL_PAGE_SCREENSHOT_OPTIONS,
          mask: pageMasks(page),
        });
      });
    }
  });

  test.describe('Accelerator console pages', () => {
    for (const { name, path } of ACCELERATOR_PAGES) {
      test(`page-${name}`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await expect(page).toHaveScreenshot(`page-${name}.png`, {
          ...FULL_PAGE_SCREENSHOT_OPTIONS,
          mask: pageMasks(page),
        });
      });
    }
  });
});

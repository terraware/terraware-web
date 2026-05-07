import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { selectOrg, waitFor } from '../../utils/utils';

const SCREENSHOT_OPTIONS = {
  animations: 'disabled' as const,
  maxDiffPixelRatio: 0.02,
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

// viewport is applied inside the test (after beforeEach runs at desktop size) so that
// the org-selector dropdown — which is hidden on smaller viewports — remains reachable
// during the setup phase.
const addPageTests = (
  pages: { name: string; path: string }[],
  screenshotSuffix: string,
  viewport?: { width: number; height: number }
) => {
  for (const { name, path } of pages) {
    test(`page-${name}`, async ({ page }) => {
      if (viewport) {
        await page.setViewportSize(viewport);
      }
      await page.goto(path);
      await page.waitForLoadState('networkidle', { timeout: 30000 });
      await expect(page).toHaveScreenshot(`page-${name}${screenshotSuffix}.png`, {
        ...SCREENSHOT_OPTIONS,
        fullPage: !!viewport,
        mask: pageMasks(page),
      });
    });
  }
};

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
    addPageTests(TERRAWARE_PAGES, '');
  });

  test.describe('Accelerator console pages', () => {
    addPageTests(ACCELERATOR_PAGES, '');
  });

  test.describe('Terraware pages - tablet', () => {
    addPageTests(TERRAWARE_PAGES, '-tablet', { width: 768, height: 1024 });
  });

  test.describe('Terraware pages - mobile', () => {
    addPageTests(TERRAWARE_PAGES, '-mobile', { width: 390, height: 844 });
  });
});

import { expect } from '@playwright/test';
import type { Page } from 'playwright-core';

import { openNavItem } from './utils';

export type MapPoint = [number, number];

export const BOUNDARY_FIXTURE = 'playwright/data/simpleSiteBoundary.geojson';

// Turns on the boundary file upload flag and suppresses the tutorial videos for this page only,
// without writing the preferences back to the server.
export const enableSiteEditorPreferences = async (page: Page) => {
  await page.route(
    (url) => url.pathname === '/api/v1/users/me/preferences' && !url.searchParams.has('organizationId'),
    async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fallback();
        return;
      }
      const response = await route.fetch();
      const json = await response.json();
      json.preferences = {
        ...json.preferences,
        boundaryFileUpload: true,
        'dont-show-site-boundary-instructions': true,
        'dont-show-site-stratum-boundaries-instructions': true,
      };
      await route.fulfill({ response, json });
    }
  );
};

export const goToPlantingSites = async (page: Page) => {
  await openNavItem(page, 'Locations', 'Planting Sites');
  await expect(page.getByRole('button', { name: 'Add Planting Site' })).toBeVisible();
};

export const selectSiteType = async (page: Page, siteType: 'Simple Site' | 'Detailed Site') => {
  await page.getByText(siteType, { exact: true }).locator('xpath=preceding-sibling::div[1]').click();
};

export const startNewPlantingSite = async (page: Page, siteType: 'Simple Site' | 'Detailed Site') => {
  await page.getByRole('button', { name: 'Add Planting Site' }).click();
  await selectSiteType(page, siteType);
  await page.locator('#next').click();
  await expect(page).toHaveURL(/\/planting-sites\/draft\/new/);
};

export const editorButton = (page: Page, name: 'Close' | 'Back' | 'Next' | 'Create Planting Site') =>
  page.getByRole('button', { name, exact: true });

const mapCanvas = (page: Page) => page.locator('.mapboxgl-canvas');

export const expectActiveStep = async (page: Page, label: string) => {
  await expect(page.locator('.MuiStepLabel-label.Mui-active')).toHaveText(label);
};

// The draw control ignores clicks until the map has loaded. Once it is listening, moving the mouse over
// the map makes it tag the map container with a "mouse-" class.
export const waitForMap = async (page: Page) => {
  const canvas = mapCanvas(page);
  await expect(canvas).toBeVisible();
  await expect(async () => {
    await canvas.hover({ position: { x: 5, y: 5 } });
    await canvas.hover({ position: { x: 10, y: 10 } });
    await expect(page.locator('.mapboxgl-map[class*="mouse-"]')).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(page.getByRole('button', { name: 'Polygon tool (p)' })).toBeVisible();
};

// Flying to a search result is marked essential, so it animates even with reduced motion.
const waitForMapToSettle = async (page: Page) => {
  let previous: Buffer | undefined;
  await expect
    .poll(
      async () => {
        const current = await mapCanvas(page).screenshot();
        const settled = previous?.equals(current) ?? false;
        previous = current;
        return settled;
      },
      { intervals: [500], timeout: 20000 }
    )
    .toBe(true);
};

export const searchMapLocation = async (page: Page, address: string) => {
  await page.getByPlaceholder('Enter location').fill(address);
  const result = page.getByRole('option').first();
  await expect(result).toBeVisible({ timeout: 10000 });
  const retrieved = page.waitForResponse((response) => response.url().includes('/autofill/v1/retrieve/'));
  await result.click();
  await retrieved;
  await waitForMapToSettle(page);
};

// Needs reduced motion so that each click jumps a full zoom level instead of easing into it.
export const zoomMapIn = async (page: Page, levels: number) => {
  for (let i = 0; i < levels; i++) {
    await page.locator('.mapboxgl-ctrl-zoom-in').click();
  }
};

// Points are fractions of the largest centered square that fits in the map canvas less 25px of padding,
// which is where the editor fits a square site boundary. Values outside 0..1 land outside the site.
const toPagePixels = async (page: Page): Promise<(point: MapPoint) => MapPoint> => {
  const box = await mapCanvas(page).boundingBox();
  if (!box) {
    throw new Error('Map canvas is not visible');
  }
  const side = Math.min(box.width, box.height) - 50;
  const left = box.x + (box.width - side) / 2;
  const top = box.y + (box.height - side) / 2;
  return ([x, y]) => [left + x * side, top + y * side];
};

// Pressing Enter finishes the polygon without having to hit its first vertex exactly.
export const drawPolygon = async (page: Page, points: MapPoint[]) => {
  const toPixels = await toPagePixels(page);
  await page.getByRole('button', { name: 'Polygon tool (p)' }).click();
  for (const point of points) {
    const [x, y] = toPixels(point);
    await page.mouse.click(x, y);
  }
  await mapCanvas(page).press('Enter');
};

export const clickMap = async (page: Page, point: MapPoint) => {
  const [x, y] = (await toPagePixels(page))(point);
  await page.mouse.click(x, y);
};

export const detailField = (page: Page, label: string) =>
  page.getByText(label, { exact: true }).locator('xpath=following-sibling::*[1]');

export const openDraftPlantingSite = async (page: Page, name: string) => {
  await goToPlantingSites(page);
  await page.getByRole('tab', { name: 'Draft Planting Sites' }).click();
  await page.getByRole('link', { name, exact: true }).click();
};

export const descriptionField = (page: Page) =>
  page
    .locator('.textfield')
    .filter({ has: page.getByText('Description', { exact: true }) })
    .locator('textarea');

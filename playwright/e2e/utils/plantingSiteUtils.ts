import { expect } from '@playwright/test';
import type { Locator, Page } from 'playwright-core';

import { openNavItem } from './utils';

export type MapPoint = [number, number];

export const BOUNDARY_FIXTURE = 'playwright/data/simpleSiteBoundary.geojson';

// Suppresses the tutorial videos for this page only,
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
  await expect(detailsDialogButton(page, 'Save')).toBeVisible();
};

export const detailsDialogButton = (page: Page, button: 'Cancel' | 'Save' | 'Save and Close') => {
  const ids = {
    Cancel: '#cancel-draft-site-details',
    Save: '#save-draft-site-details',
    'Save and Close': '#save-and-close-draft-site-details',
  };
  return page.locator(ids[button]);
};

export const editDraftDetailsButton = (page: Page) => page.locator('#edit-draft-planting-site-details');

export const editorButton = (page: Page, name: 'Close' | 'Back' | 'Next' | 'Create Planting Site') =>
  page.getByRole('button', { name, exact: true });

const mapCanvas = (page: Page) => page.locator('.mapboxgl-canvas');

export const polygonTool = (page: Page) => page.getByRole('button', { name: /^Polygon tool/ });

export const expectActiveStep = async (page: Page, label: string) => {
  await expect(page.locator('.MuiStepLabel-label.Mui-active')).toHaveText(label);
};

const editorStep = (page: Page, label: string) =>
  page.locator('.MuiStep-root').filter({ has: page.locator('.MuiStepLabel-label').getByText(label, { exact: true }) });

export const expectOptionalSteps = async (page: Page, required: string[], optional: string[]) => {
  for (const label of required) {
    await expect(editorStep(page, label)).not.toContainText('Optional');
  }
  for (const label of optional) {
    await expect(editorStep(page, label)).toContainText('Optional');
  }
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
  await expect(polygonTool(page)).toBeVisible();
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
  await polygonTool(page).click();
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

// Clicks can land before the map has wired up a feature that was just added or merged, so keep clicking until the
// feature's popup opens.
export const openFeaturePopup = async (page: Page, point: MapPoint, popupField: Locator) => {
  await expect(async () => {
    await clickMap(page, point);
    await expect(popupField).toBeVisible({ timeout: 1000 });
  }).toPass();
};

// The editor can reset the selection while it syncs a newly drawn polygon, so keep selecting until it sticks.
// Clicking a selected polygon edits its vertices instead, so each attempt clears the selection first by clicking an
// empty point. Hovering a selected polygon gives the map container a "mouse-move" class.
export const selectPolygon = async (page: Page, point: MapPoint, emptyPoint: MapPoint) => {
  await expect(async () => {
    await clickMap(page, emptyPoint);
    await clickMap(page, point);
    const [x, y] = (await toPagePixels(page))(point);
    await page.mouse.move(x + 1, y);
    await expect(page.locator('.mapboxgl-map.mode-simple_select.mouse-move')).toBeVisible({ timeout: 500 });
  }).toPass();
};

// The first click on a polygon selects it and the second edits its vertices, but the editor can reset the
// selection while it syncs a newly drawn polygon, so keep clicking until vertex editing starts. Mapbox Draw
// only updates the mode class on the map container on the next mouse event.
export const editPolygonVertices = async (page: Page, point: MapPoint) => {
  await expect(async () => {
    await clickMap(page, point);
    const [x, y] = (await toPagePixels(page))(point);
    await page.mouse.move(x + 1, y);
    await expect(page.locator('.mapboxgl-map.mode-direct_select')).toBeVisible({ timeout: 500 });
  }).toPass();
};

export const deleteMapFeature = async (page: Page) => {
  await page.locator('.mapbox-gl-draw_trash').click();
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

import { expect, test } from '@playwright/test';

import type { OrganizationNurserySummaryPayload } from '../../../../src/queries/generated/nurserySummaries';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { openNavItem, selectOrg, waitFor } from '../../utils/utils';

test.describe('Seedlings Dashboard', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('shows nursery totals and opens the correct inventory tabs', async ({ page }) => {
    const response = await page.request.get('/api/v1/nursery/summary?organizationId=1');
    expect(response.ok()).toBe(true);
    const { summary } = (await response.json()) as { summary: OrganizationNurserySummaryPayload };

    await openNavItem(page, 'Seedlings', 'Dashboard');

    await expect(page).toHaveURL((url) => url.pathname === '/seedlings-dashboard');
    await expect(page.getByRole('heading', { name: 'Seedlings Dashboard', level: 1 })).toBeVisible();
    const seedlingsNav = page.locator('.nav-item--has-children').filter({
      has: page.getByRole('button', { name: 'Seedlings', exact: true }),
    });
    await expect(seedlingsNav.locator('.subnavbar').getByRole('button').first()).toHaveText('Dashboard');
    await expect(seedlingsNav.locator('.nav-item--selected')).toHaveText('Dashboard');

    for (const [name, quantity] of [
      ['Total Seedlings', summary.totalQuantity],
      ['Total Batches', summary.batchesWithInventory],
      ['Number Of Species', summary.speciesWithInventory],
    ] as const) {
      await expect(page.getByRole('region', { name, exact: true }).getByRole('link')).toHaveText(
        quantity.toLocaleString('en')
      );
    }

    await page.getByRole('region', { name: 'Total Seedlings', exact: true }).getByRole('link').click();
    await expect(page).toHaveURL(/\/inventory(?:\?|$)/);
    await page.getByRole('tab', { name: 'By Species', exact: true }).click();
    await openNavItem(page, 'Seedlings', 'Dashboard');

    await page.getByRole('region', { name: 'Total Batches', exact: true }).getByRole('link').click();
    await expect(page).toHaveURL(
      (url) => url.pathname === '/inventory' && url.searchParams.get('tab') === 'batches_by_batch'
    );
    await expect(page.getByRole('tab', { name: 'By Batch', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'By Batch', exact: true }).click();
    await openNavItem(page, 'Seedlings', 'Dashboard');

    await page.getByRole('region', { name: 'Number Of Species', exact: true }).getByRole('link').click();
    await expect(page).toHaveURL(
      (url) => url.pathname === '/inventory' && url.searchParams.get('tab') === 'batches_by_species'
    );
    await expect(page.getByRole('tab', { name: 'By Species', exact: true })).toHaveAttribute('aria-selected', 'true');
    await openNavItem(page, 'Seedlings', 'Dashboard');

    await page.getByRole('link', { name: 'See all inventory', exact: true }).click();
    await expect(page).toHaveURL(/\/inventory(?:\?|$)/);
  });

  test('opens Add Inventory for an empty nursery', async ({ page }) => {
    await page.route('**/api/v1/nursery/summary?*', (route) =>
      route.fulfill({
        json: {
          status: 'ok',
          summary: {
            totalQuantity: 0,
            batchesWithInventory: 0,
            speciesWithInventory: 0,
            germinatingQuantity: 0,
            activeGrowthQuantity: 0,
            hardeningOffQuantity: 0,
            readyQuantity: 0,
            notReadyQuantity: 0,
            totalDead: 0,
            totalWithdrawn: 0,
          },
        },
      })
    );
    await page.goto('/seedlings-dashboard');

    await expect(page.getByText('Add Inventory to See Data', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Add Inventory', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/inventory/new');
    await expect(page.getByRole('heading', { name: 'Add Inventory', level: 2 })).toBeVisible();
  });

  test('opens nursery setup for an empty organization without a nursery', async ({ page }) => {
    await selectOrg(page, 'Empty Organization');
    await openNavItem(page, 'Seedlings', 'Dashboard');

    await page.getByRole('button', { name: 'Set up Nursery', exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/nurseries/new');
    await expect(page.getByText('Add Nursery', { exact: true })).toBeVisible();
  });
});

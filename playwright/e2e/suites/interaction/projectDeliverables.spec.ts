import { expect, test } from '@playwright/test';

import { clickProjectProfileLink, navigateToProjectProfile } from '../../utils/navigation';
import { changeToSuperAdmin } from '../../utils/userUtils';

test.describe('ProjectDeliverablesTests', () => {
  test.beforeEach(async ({ context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test('View Project Deliverables Table', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project Deal', page);
    await clickProjectProfileLink('Deliverables', page);

    await expect(page.getByRole('heading', { name: 'Deliverables' })).toBeVisible();
    await expect(page.locator('#search-acceleratorDeliverablesTable')).toBeVisible();

    // table filters
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Status$/ })
        .nth(2)
    ).toBeVisible();
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Category$/ })
        .nth(2)
    ).toBeVisible();
    // the console list keeps the type filter behind the filter icon rather than inline
    await page.locator('#filter-observations-button').click();
    await expect(page.locator('#observations-filter-popover').getByText('Type', { exact: true }).first()).toBeVisible();
    await page.keyboard.press('Escape');

    // table column headers
    const deliverablesTable = await page.locator('#acceleratorDeliverablesTable');
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Deliverable Name', exact: true })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Deal Name', exact: true })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Due Date' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Module' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Category' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Type' })).toBeVisible();
  });
});

import { expect, test } from '@playwright/test';

import { navigateToProjectProfile } from '../utils/navigation';
import { changeToSuperAdmin } from '../utils/userUtils';

test.describe('ProjectDeliverablesTests', () => {
  test.beforeEach(async ({ context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test('View Project Deliverables Table', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project', page);
    await page.getByRole('tab', { name: 'Deliverables' }).click();

    await expect(page.getByRole('heading', { name: 'Deliverables' })).toBeVisible();
    await expect(page.locator('#search-participantDeliverablesTable')).toBeVisible();

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
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^Type$/ })
        .nth(2)
    ).toBeVisible();

    // table column headers
    const deliverablesTable = await page.locator('#participantDeliverablesTable');
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Due Date' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Module' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Category' })).toBeVisible();
    await expect(deliverablesTable.getByRole('columnheader', { name: 'Type' })).toBeVisible();
  });
});

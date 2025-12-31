import { expect, test } from '@playwright/test';

import { navigateToProjectProfile } from '../utils/navigation';
import { changeToSuperAdmin } from '../utils/userUtils';

test.describe('ProjectDeliverablesTests', () => {
  test.beforeEach(async ({ context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test('View Project Deliverables Table', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project Deal', page);
    await page.getByRole('tab', { name: 'Deliverables' }).click();

    await expect(page.getByRole('heading', { name: 'Deliverables' })).toBeVisible();
    await expect(page.locator('#search')).toBeVisible();

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
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Due Date' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Module' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Category' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
  });
});

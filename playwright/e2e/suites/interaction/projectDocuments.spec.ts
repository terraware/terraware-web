import { expect, test } from '@playwright/test';

import { APP_PATHS } from '../../../../src/constants';
import { clickProjectProfileLink, navigateToProjectProfile } from '../../utils/navigation';
import { changeToSuperAdmin } from '../../utils/userUtils';

test.describe('ProjectDocumentsTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await navigateToProjectProfile('Phase 2 Project Deal', page);
    await clickProjectProfileLink('Documents', page);
  });

  test('View Project Documents Table', async ({ page }, testInfo) => {
    await expect(page).toHaveURL(/\/accelerator\/documents\?dealName=/);
    await expect(page.getByRole('button', { name: 'Add Document' })).toBeVisible();
    await expect(page.locator('#search-documents-list')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Name', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Deal Name', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Document Template' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Version' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Created' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Last Edited' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  });

  test('Navigate to New Document Page when Add Document Button is Pressed', async ({ page }, testInfo) => {
    await expect(page.getByRole('button', { name: 'Add Document' })).toBeVisible();

    // click the Add Document button and wait for the new page to load
    await page.getByRole('button', { name: 'Add Document' }).click();
    await page.waitForURL(`${APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW}`);

    await expect(page).toHaveURL(`${APP_PATHS.ACCELERATOR_DOCUMENT_PRODUCER_DOCUMENT_NEW}`);
  });
});

import { expect, test } from '@playwright/test';

import { TERRAWARE_WEB_URL } from '../constants';
import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('MatrixViewTests', () => {
  test.beforeEach(async ({ page, context }, testInfo) => {
    await changeToSuperAdmin(context);
    await page.goto(TERRAWARE_WEB_URL);
    await waitFor(page, '#acceleratorConsoleButton');
  });

  test('Matrix view render', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click({ delay: 50 });
    await page.getByRole('button', { name: 'Matrix View' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    await expect(page.getByLabel('Show/Hide search')).toBeVisible();
    await expect(page.getByLabel('Show/Hide filters')).toBeVisible();
    await expect(page.locator('#manageColumns')).toBeVisible();
    await expect(page.getByLabel('Toggle density')).toBeVisible();
    await expect(page.getByLabel('Toggle full screen')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phase' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Eligible Land' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Project Lead' })).toBeVisible();

    // table row values
    await expect(page.getByRole('cell', { name: 'Application Project' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Phase 0 - Due Diligence' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '1,000' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Colombia' })).toBeVisible();

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();

    // variables
    await expect(page.locator('label').filter({ hasText: 'Certification' })).toBeVisible();
    await expect(page.getByText('TEST Number of native species')).toBeVisible();

    //selected columns
    await expect(page.locator('li').filter({ hasText: 'Deal Name' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Phase' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Eligible Land' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Country' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Project Lead' }).nth(1)).toBeVisible();

    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(5);
  });

  test('Add column to matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Matrix View' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    await page.getByLabel('Certification').click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('columnheader', { name: 'Certification' })).toBeVisible();
    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(6);
  });

  test('Column reordering and reset in matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Matrix View' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    // Get initial column order
    const initialHeaders = await page.getByRole('columnheader').allTextContents();

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    const selectedColumnsList = page.locator('.dialog-box').getByText('Selected Columns').locator('..').locator('ul');
    const firstColumn = selectedColumnsList.locator('li').nth(1);
    const secondColumn = selectedColumnsList.locator('li').nth(2);
    await firstColumn.dragTo(secondColumn);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const reorderedHeaders = await page.getByRole('columnheader').allTextContents();
    expect(reorderedHeaders).not.toEqual(initialHeaders);

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    // Reset order
    await page.getByRole('button', { name: 'Reset Order' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);

    // Check that the column order has been reset to original
    const resetHeaders = await page.getByRole('columnheader').allTextContents();
    expect(resetHeaders).toEqual(initialHeaders);
  });

  test('Add multiple columns and reset columns in matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Matrix View' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();

    // Add three columns
    await page.locator('input[type="checkbox"]').nth(6).click();
    await page.locator('input[type="checkbox"]').nth(7).click();
    await page.locator('input[type="checkbox"]').nth(8).click();

    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const expandedColumnHeaders = page.getByRole('columnheader');
    await expect(expandedColumnHeaders).toHaveCount(8);

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    // Reset columns
    await page.getByRole('button', { name: 'Reset Columns' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const resetColumnHeaders = page.getByRole('columnheader');
    await expect(resetColumnHeaders).toHaveCount(5);
    await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phase' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Eligible Land' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Project Lead' })).toBeVisible();
  });
});

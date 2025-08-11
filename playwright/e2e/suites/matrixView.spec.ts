import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, waitFor } from '../utils/utils';

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  await changeToSuperAdmin(context);
});

export default function MatrixViewTests() {
  test('Matrix view render', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
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
    await expect(page.locator('li').filter({ hasText: 'projectName' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'participantCohortPhase' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'elegibleLand' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'countryName' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'projectLead' })).toBeVisible();
  });

  test('Add column to matrix view', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');
    await waitFor(page, '#home');
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.getByRole('button', { name: 'Matrix View' }).click();

    await page.waitForTimeout(1000); //Wait for table to load

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();

    // variables
    page.getByLabel('Certification').click();
    page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('columnheader', { name: 'Certification' })).toBeVisible();
  });
}

import { expect, test } from '@playwright/test';

import { navigateToProjectProfile } from '../utils/navigation';
import { addSuperAdminCookies, waitFor } from '../utils/utils';

test.setTimeout(20000);
test.beforeEach(async ({ context }, testInfo) => {
  await addSuperAdminCookies(context);
});

export default function ProjectVariablesTests() {
  test('View Project Variables Table', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project Deal', page);
    await page.getByRole('tab', { name: 'Variables' }).click();

    await expect(page.getByRole('heading', { name: 'Variables' })).toBeVisible();
    await expect(page.locator('#search')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Question' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Value' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Instances' })).toBeVisible();

    // wait for table rows to load
    await waitFor(page, '#row1');
  });

  test('Edit Project Variable', async ({ page }, testInfo) => {
    await navigateToProjectProfile('Phase 2 Project Deal', page);
    await page.getByRole('tab', { name: 'Variables' }).click();

    // wait for table rows to load
    await waitFor(page, '#row1');

    // open edit variable modal
    await page.getByRole('button', { name: 'Planting Density: Sustainable' }).click();

    // enter some data
    await page.locator('#value').getByRole('spinbutton').fill('1500');
    await page.locator('#citation').getByRole('textbox').fill('citation text');
    await page.locator('.select > .textfield-container').click();
    await page.locator('li').filter({ hasText: 'In Review' }).click();
    await page.locator('label[for="internal-comments"] + textarea').fill('some internal comments');

    // save changes
    await page.locator('#edit-variable-save').click();

    // wait for success toast message
    await waitFor(page, '#snackbar div:has-text("Success")');

    // verify variable value is updated
    await expect(page.locator('#row2-values').getByText('1500')).toBeVisible();
  });
}

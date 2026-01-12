import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('PeopleTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL!);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Add a new user to organization', async ({ page }, testInfo) => {
    const timestamp = new Date().getTime();
    const newUserEmail = `test-user-${timestamp}@example.com`;

    // navigate to People page
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    // click Add Person button
    await page.getByRole('button', { name: 'Add Person' }).click();
    await expect(page.getByRole('heading', { name: 'Add Person' })).toBeVisible();

    // fill in user details
    await page.locator('#email').getByRole('textbox').click();
    await page.locator('#email').getByRole('textbox').fill(newUserEmail);

    // select role - default is Contributor, change to Manager
    await page.locator('#role').click();
    await page.locator('li').filter({ hasText: 'Manager' }).click();

    // save the new user
    await page.getByRole('button', { name: 'Save' }).click();

    // wait for navigation to user details page
    await page.waitForTimeout(1000);

    // verify we're on the user details page and email is displayed
    await expect(page.getByText(newUserEmail)).toBeVisible();
    await expect(page.getByText('Manager')).toBeVisible();

    // navigate back to People list
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    // verify the new user appears in the list
    await expect(page.getByText(newUserEmail)).toBeVisible();
  });

  test('Remove a user from organization', async ({ page }, testInfo) => {
    const timestamp = new Date().getTime();
    const userToRemoveEmail = `test-remove-${timestamp}@example.com`;

    // first, add a user to remove
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    await page.getByRole('button', { name: 'Add Person' }).click();
    await expect(page.getByRole('heading', { name: 'Add Person' })).toBeVisible();

    await page.locator('#email').getByRole('textbox').click();
    await page.locator('#email').getByRole('textbox').fill(userToRemoveEmail);

    // save the new user
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // navigate back to People list
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    // verify user is in the list
    await expect(page.getByText(userToRemoveEmail)).toBeVisible();

    // find the row with the user and select it
    const userRow = page.locator('tr', { has: page.getByText(userToRemoveEmail) });
    await userRow.locator('input[type="checkbox"]').check();

    // click Remove button
    await page.getByRole('button', { name: 'Remove' }).click();

    // confirm removal in dialog
    await page.waitForTimeout(500);
    await page.locator('button.destructive-primary').click();

    // wait for the removal to complete
    await page.waitForTimeout(1000);

    // verify user is no longer in the list
    await expect(page.getByText(userToRemoveEmail)).toBeHidden();
  });

  test("Update a user's role within organization", async ({ page }, testInfo) => {
    const timestamp = new Date().getTime();
    const userEmail = `test-role-update-${timestamp}@example.com`;

    // first, add a user with Contributor role
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    await page.getByRole('button', { name: 'Add Person' }).click();
    await expect(page.getByRole('heading', { name: 'Add Person' })).toBeVisible();

    await page.locator('#email').getByRole('textbox').click();
    await page.locator('#email').getByRole('textbox').fill(userEmail);

    // keep default role as Contributor
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // verify initial role is Contributor
    await expect(page.getByText('Contributor')).toBeVisible();

    // click Edit button
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.waitForTimeout(500);

    // change role to Manager
    await page.locator('#role').click();
    await page.locator('li').filter({ hasText: 'Manager' }).click();

    // save the changes
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);

    // verify the role has been updated
    await expect(page.getByText('Manager')).toBeVisible();

    // navigate back to People list
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    // verify the updated role appears in the table
    const userRow = page.locator('tr', { has: page.getByText(userEmail) });
    await expect(userRow).toContainText('Manager');
  });

  test('Search for users in the organization', async ({ page }, testInfo) => {
    // navigate to People page
    await page.getByRole('button', { name: 'People' }).click();
    await waitFor(page, '#people-table');

    // get the first user's email from the table
    const firstEmailCell = page.locator('[id^="row"][id$="-email"]').first();
    const emailText = await firstEmailCell.textContent();

    if (emailText) {
      // use the search field
      const searchInput = page.locator('#search').getByRole('textbox');
      await searchInput.fill(emailText);

      // wait for debounce and search results
      await page.waitForTimeout(500);

      // verify the searched user is visible
      await expect(page.getByText(emailText)).toBeVisible();

      // clear the search
      await page.locator('svg[name="cancel"]').click();
      await page.waitForTimeout(500);

      // verify more users are shown after clearing search
      const rowsAfterClear = await page.locator('[id^="row"]').count();
      expect(rowsAfterClear).toBeGreaterThan(0);
    }
  });
});

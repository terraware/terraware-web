import { expect, test } from '@playwright/test';

import { changeToReadOnlyUser, changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../../utils/utils';

test.describe('OnboardingHomeTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Onboarding org');
    await expect(page.getByText('Get Started', exactOptions)).toBeVisible();
  });

  test('Add People navigates to the People page and opens the Add Person modal', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Add People', ...exactOptions }).click();

    await expect(page).toHaveURL(/\/people/);
    await expect(page.locator('#saveNewPerson')).toBeVisible();
    await expect(page.getByText('Fill out this page to add a person to the organization.')).toBeVisible();
  });

  test('Add Species navigates to the new species form', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Add Species', ...exactOptions }).click();

    await expect(page).toHaveURL(/\/species\/new/);
    await expect(page.getByRole('heading', { name: 'Add Species' })).toBeVisible();
    await expect(page.locator('#scientificName')).toBeVisible();
  });

  test('I am the only person marks the Add People task as complete', async ({ page }, testInfo) => {
    await expect(page.getByRole('button', { name: 'I am the only person', ...exactOptions })).toBeVisible();

    await page.getByRole('button', { name: 'I am the only person', ...exactOptions }).click();

    await expect(page.getByRole('button', { name: 'I am the only person', ...exactOptions })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Add People', ...exactOptions })).toBeHidden();
    await expect(page.getByText('Complete', exactOptions)).toBeVisible();
  });
});

test.describe('OnboardingHomeManagerTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToReadOnlyUser(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Empty Organization');
    await expect(page.getByRole('button', { name: 'Add Species', ...exactOptions })).toBeVisible();
  });

  test('Manager-or-higher non-owner only sees the Add Species task', async ({ page }, testInfo) => {
    await expect(page.getByRole('button', { name: 'Add Species', ...exactOptions })).toBeVisible();

    // The Add People / I am the only person tasks are owner-only.
    await expect(page.getByRole('button', { name: 'Add People', ...exactOptions })).toBeHidden();
    await expect(page.getByRole('button', { name: 'I am the only person', ...exactOptions })).toBeHidden();
  });
});

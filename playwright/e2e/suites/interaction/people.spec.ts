import { expect, test } from '@playwright/test';
import { Page } from 'playwright-core';

import { navigateToPeople } from '../../utils/navigation';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../../utils/utils';

type OrganizationRoleLabel = 'Contributor' | 'Manager' | 'Admin';

// Each run invites a brand new person so the tests don't depend on (or clobber) the seeded org members.
const uniqueEmail = () => `e2e-person-${Date.now()}-${Math.round(Math.random() * 100000)}@terraformation.com`;

const personModal = (page: Page) => page.locator('.dialog-box');

const displayedField = (page: Page, label: string) =>
  page.locator(`label.textfield-label:has-text("${label}") + p.textfield-value--display`);

const personRow = (page: Page, email: string) => page.locator('#people-table').locator('tr').filter({ hasText: email });

const selectRole = async (page: Page, role: OrganizationRoleLabel) => {
  const modal = personModal(page);
  await modal.locator('#role').click();
  await modal
    .locator('ul.options-container li')
    .filter({ hasText: new RegExp(`^${role}$`) })
    .click();
};

// Invites a person from the People list and leaves the browser on their profile page.
const addPerson = async (page: Page, email: string, role: OrganizationRoleLabel) => {
  await page.locator('#new-person').click();
  await personModal(page).locator('#email').getByRole('textbox').fill(email);
  await selectRole(page, role);
  await page.locator('#saveNewPerson').click();

  await expect(page.getByText('Person Added')).toBeVisible();
  await expect(page).toHaveURL(/\/people\/\d+/);
};

const backToPeopleList = async (page: Page) => {
  await page.locator('#back').click();
  await waitFor(page, '#people-table');
};

test.describe('PeopleTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
    await navigateToPeople(page);
  });

  test('Add a person to the organization', async ({ page }, testInfo) => {
    const email = uniqueEmail();

    await addPerson(page, email, 'Manager');

    // The profile of the person we just invited: no name yet, since they haven't accepted.
    await expect(displayedField(page, 'Email')).toHaveText(email);
    await expect(displayedField(page, 'Role')).toHaveText('Manager');

    await backToPeopleList(page);

    await expect(personRow(page, email)).toBeVisible();
    await expect(personRow(page, email)).toContainText('Manager');
  });

  test("Update a person's role", async ({ page }, testInfo) => {
    const email = uniqueEmail();

    await addPerson(page, email, 'Contributor');
    await expect(displayedField(page, 'Role')).toHaveText('Contributor');

    await page.getByRole('button', { name: 'Edit Person', ...exactOptions }).click();
    await expect(personModal(page).getByText(email, exactOptions)).toBeVisible();
    // The email of an existing person is fixed; only the role can be changed.
    await expect(personModal(page).locator('#email').getByRole('textbox')).toBeDisabled();

    await selectRole(page, 'Admin');
    await page.locator('#saveNewPerson').click();

    await expect(page.getByText('Changes Saved!')).toBeVisible();
    await expect(displayedField(page, 'Role')).toHaveText('Admin');

    await backToPeopleList(page);

    await expect(personRow(page, email)).toContainText('Admin');
  });

  test('Remove a person from the organization', async ({ page }, testInfo) => {
    const email = uniqueEmail();

    await addPerson(page, email, 'Contributor');
    await backToPeopleList(page);

    await personRow(page, email).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Remove', ...exactOptions }).click();

    await expect(page.getByText('Remove Person', exactOptions)).toBeVisible();
    await page.locator('#removePeople').click();

    await expect(page.getByText('Changes Saved!')).toBeVisible();
    await expect(personRow(page, email)).toBeHidden();
  });
});

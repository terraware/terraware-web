import { expect, test } from '@playwright/test';
import { Page } from 'playwright-core';

import { navigateToPeople } from '../../utils/navigation';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../../utils/utils';

type OrganizationRoleLabel = 'Contributor' | 'Manager' | 'Admin';

const ORG_NAME = 'Empty Organization';
const PERSON = {
  email: 'contributor@terraformation.com',
  firstName: 'Contributor',
  lastName: 'User',
};

const personModal = (page: Page) => page.locator('.dialog-box');

const displayedField = (page: Page, label: string) =>
  page.locator(`label.textfield-label:has-text("${label}") + p.textfield-value--display`);

const personRow = (page: Page) => page.locator('#people-table').locator('tr').filter({ hasText: PERSON.email });

const openPeopleList = async (page: Page) => {
  await page.goto('/');
  await waitFor(page, '#home');
  await selectOrg(page, ORG_NAME);
  await navigateToPeople(page);
  await waitFor(page, '#row1');
};

const backToPeopleList = async (page: Page) => {
  await page.locator('#back').click();
  await waitFor(page, '#row1');
};

const selectRole = async (page: Page, role: OrganizationRoleLabel) => {
  const modal = personModal(page);
  await modal.locator('#role').click();
  await modal
    .locator('ul.options-container li')
    .filter({ hasText: new RegExp(`^${role}$`) })
    .click();
};

// Adds the person from the People list and leaves the browser on their profile page.
const addPerson = async (page: Page, role: OrganizationRoleLabel) => {
  await page.locator('#new-person').click();
  await personModal(page).locator('#email').getByRole('textbox').fill(PERSON.email);
  await selectRole(page, role);
  await page.locator('#saveNewPerson').click();

  await expect(page.getByText('Person Added')).toBeVisible();
  await expect(page).toHaveURL(/\/people\/\d+/);
};

const removePerson = async (page: Page) => {
  await personRow(page).getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Remove', ...exactOptions }).click();

  await expect(page.getByText('Remove Person', exactOptions)).toBeVisible();
  await page.locator('#removePeople').click();

  await expect(page.getByText('Changes Saved!')).toBeVisible();
  await expect(personRow(page)).toBeHidden();
};

const removePersonIfPresent = async (page: Page) => {
  if (await personRow(page).isVisible()) {
    await removePerson(page);
  }
};

test.describe('PeopleTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await openPeopleList(page);
    await removePersonIfPresent(page);
  });

  test.afterEach(async ({ page }, testInfo) => {
    await openPeopleList(page);
    await removePersonIfPresent(page);
  });

  test('Add a person to the organization', async ({ page }, testInfo) => {
    await addPerson(page, 'Manager');

    await expect(displayedField(page, 'Email')).toHaveText(PERSON.email);
    await expect(displayedField(page, 'First Name')).toHaveText(PERSON.firstName);
    await expect(displayedField(page, 'Last Name')).toHaveText(PERSON.lastName);
    await expect(displayedField(page, 'Role')).toHaveText('Manager');

    await backToPeopleList(page);

    await expect(personRow(page)).toBeVisible();
    await expect(personRow(page)).toContainText('Manager');
  });

  test("Update a person's role", async ({ page }, testInfo) => {
    await addPerson(page, 'Contributor');
    await expect(displayedField(page, 'Role')).toHaveText('Contributor');

    await page.getByRole('button', { name: 'Edit Person', ...exactOptions }).click();
    await expect(personModal(page).getByText(PERSON.email, exactOptions)).toBeVisible();
    // The email of an existing person is fixed; only the role can be changed.
    await expect(personModal(page).locator('#email').getByRole('textbox')).toBeDisabled();

    await selectRole(page, 'Admin');
    await page.locator('#saveNewPerson').click();

    await expect(page.getByText('Changes Saved!')).toBeVisible();
    await expect(displayedField(page, 'Role')).toHaveText('Admin');

    await backToPeopleList(page);

    await expect(personRow(page)).toContainText('Admin');
  });

  test('Remove a person from the organization', async ({ page }, testInfo) => {
    await addPerson(page, 'Contributor');
    await backToPeopleList(page);
    await expect(personRow(page)).toBeVisible();

    await removePerson(page);
  });
});

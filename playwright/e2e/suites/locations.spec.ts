import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { selectOrg, waitFor } from '../utils/utils';

test.describe('LocationTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Create a Seedbank', async ({ page }, testInfo) => {
    const newSeedBankName = `My New Seed Bank-${new Date().getTime()}`;

    await page.getByRole('button', { name: 'Locations' }).click();
    await page.getByRole('button', { name: 'Seed Banks' }).click();

    await page.getByRole('button', { name: 'Add Seed Bank' }).click();

    await page.locator('#name').getByRole('textbox').fill(newSeedBankName);
    await page.locator('textarea').click();
    await page.locator('textarea').fill('My Brand New Seed Bank!');
    await page.getByLabel('Build Start Date').fill('2023-12-31');
    await page.getByLabel('Build Completion Date').fill('2024-01-31');
    await page.getByLabel('Operation Start Date').fill('2024-01-31');
    await page.getByRole('row', { name: 'Freezer 1' }).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Add Sub-Location' }).click();
    await page.locator('#sub-location-name').getByRole('textbox').click();
    await page.locator('#sub-location-name').getByRole('textbox').fill('Garage Freezer');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('row', { name: 'Refrigerator 3' }).getByRole('checkbox').check();
    await page.getByRole('row', { name: 'Refrigerator 2' }).getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Add Sub-Location' }).click();
    await page.locator('#sub-location-name').getByRole('textbox').fill('Garage Fridge');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    // wait for page change
    await waitFor(page, '#back');

    await expect(page.getByText(newSeedBankName).nth(1)).toBeVisible();
    await expect(page.getByText('My Brand New Seed Bank!')).toBeVisible();
    await expect(page.getByText('Garage Fridge')).toBeVisible();
    await expect(page.getByText('Garage Freezer')).toBeVisible();
    await expect(page.getByText('Refrigerator 2')).toBeHidden();
    await expect(page.getByText('Refrigerator 3')).toBeHidden();
    await expect(page.getByText('Freezer 1')).toBeHidden();
    await page.getByRole('link', { name: 'Seed Banks' }).click();
    await expect(page.getByRole('cell', { name: newSeedBankName, exact: true })).toBeVisible();
    await page.getByRole('link', { name: newSeedBankName }).click();
    await expect(page.getByRole('main')).toContainText('My Brand New Seed Bank!');
  });

  test('Create a Nursery', async ({ page }, testInfo) => {
    const newNurseryName = `My New Nursery-${new Date().getTime()}`;

    await page.getByRole('button', { name: 'Locations' }).click();
    await page.getByRole('button', { name: 'Nurseries' }).click();
    await page.getByRole('button', { name: 'Add Nursery' }).click();
    await page.locator('#name').getByRole('textbox').fill(newNurseryName);
    await page.locator('textarea').click();
    await page.locator('textarea').fill('My Super Special Test Nursery!!!');
    await page.getByLabel('Build Start Date').click();
    await page.getByLabel('Build Start Date').fill('2024-01-31');
    await page.getByLabel('Build Completion Date').click();
    await page.getByLabel('Build Completion Date').fill('2024-02-01');
    await page.getByLabel('Operation Start Date').click();
    await page.getByLabel('Operation Start Date').fill('2024-02-03');
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('500');
    await page.getByRole('button', { name: 'Add Sub-Location' }).click();
    await page.locator('#sub-location-name').getByRole('textbox').click();
    await page.locator('#sub-location-name').getByRole('textbox').fill('Garage');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Add Sub-Location' }).click();
    await page.locator('#sub-location-name').getByRole('textbox').fill('Shed');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Add Sub-Location' }).click();
    await page.locator('#sub-location-name').getByRole('textbox').fill('Third shelf to the left');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Nursery Added')).toBeVisible();
    await expect(page.getByRole('main')).toContainText(newNurseryName);
    await expect(page.getByRole('main')).toContainText('My Super Special Test Nursery!!!');
    await page.getByRole('cell', { name: 'Garage' }).click();
    await expect(page.locator('#row1-name')).toContainText('Garage');
    await expect(page.locator('#row2-name')).toContainText('Shed');
    await expect(page.locator('#row3-name')).toContainText('Third shelf to the left');
    await page.getByRole('link', { name: 'Nurseries' }).click();
    await expect(page.getByRole('cell', { name: newNurseryName })).toBeVisible();
  });

  test('Add an Organization ', async ({ page }, testInfo) => {
    const newOrgName = `My New Org-${new Date().getTime()}`;

    await page.getByRole('button', { name: 'Terraformation (staging)' }).click();
    await page.getByRole('menuitem', { name: 'Create New Organization' }).click();
    await page.locator('#name').getByRole('textbox').click();
    await page.locator('#name').getByRole('textbox').fill(newOrgName);
    await page.locator('#description').getByRole('textbox').click();
    await page.locator('#description').getByRole('textbox').fill('This is my new organization');
    await page.getByLabel('Country *').click();
    await page.getByLabel('Country *').fill('Unite');
    await page.getByRole('option', { name: 'United States' }).click();
    await page.getByLabel('State *').click();
    await page.getByLabel('State *').fill('Wash');
    await page.getByRole('option', { name: 'Washington' }).click();
    await page.getByLabel('Time Zone *').click();
    await page.getByLabel('Time Zone *').fill('pac');
    await page.getByRole('option', { name: 'Pacific Time - Los Angeles' }).click();
    await page.getByLabel('Seed Bank/Seed Collection').check();
    await page.getByLabel('Nursery').check();
    await page.getByLabel('Seed Bank/Seed Collection').uncheck();
    await page.getByLabel('Planting Site', { exact: true }).check();
    await page.getByRole('textbox').nth(2).click();
    await page.getByText('University or Other Academic').click();
    await page.locator('#create-org-question-website').getByRole('textbox').click();
    await page.locator('#create-org-question-website').getByRole('textbox').fill('fakeuniversity.edu');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('heading', { name: `You have created ${newOrgName}!` })).toBeVisible();
    await page.getByRole('button', { name: 'Organization' }).click();
    await expect(page.getByText(`Organization Name${newOrgName}`)).toBeVisible();
    await expect(page.getByText('DescriptionThis is my new')).toBeVisible();
    await expect(page.getByText('StateWashington')).toBeVisible();
    await expect(page.getByText('CountryUnited States')).toBeVisible();
    await expect(page.getByText('Time ZonePacific Time - Los')).toBeVisible();
    await expect(page.getByText('Organization TypeUniversity')).toBeVisible();
    await expect(page.getByText('Organization Websitefakeuniversity.edu')).toBeVisible();
    await page.getByRole('button', { name: 'Edit Organization' }).click();
    await page.getByText('This is my new organization').click();
    await page.getByText('This is my new organization').dblclick();
    await page.getByText('This is my new organization').fill('This is my old organization');
    await page.locator('.textfield-container > .textfield-value').click();
    await page.getByText('Non-Governmental').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Changes Saved!')).toBeVisible();
    await expect(page.getByText('Organization TypeNon-')).toBeVisible();
    await expect(page.getByText('DescriptionThis is my old')).toBeVisible();
    await page.getByRole('button', { name: 'Home' }).click();
    await page.getByRole('button', { name: newOrgName }).click();
    await page.getByRole('menuitem', { name: 'Terraformation (staging)' }).click();
    await page.waitForTimeout(1000);
  });
});

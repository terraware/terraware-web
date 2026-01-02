import { expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

const yearId = new Date().getFullYear().toString().slice(-2);

test.describe('AccessionTests', () => {
  // Skip the withdraw tests if the first test fails (Add An Accession)
  test.describe.configure({ mode: 'serial' });

  let accessionId = 'UNSET';
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Add An Accession', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seeds' }).click();
    await page.getByRole('button', { name: 'Accessions' }).click();
    await page.getByRole('button', { name: 'Add Accession' }).click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Coconut' }).locator('div').click();

    await page.getByLabel('Collection Date').fill('2023-12-31');

    await page.getByPlaceholder('Collectors').click();
    await page.getByLabel('Close').click();
    await page.getByPlaceholder('Collectors').click();
    await page.getByPlaceholder('Collectors').fill('Alex');
    await page.locator('#collectionSiteName').click();
    await page.locator('#collectionSiteName').fill("Alex's Mansion");
    await page.locator('#collectionSiteLandowner').getByRole('textbox').click();
    await page.locator('#collectionSiteLandowner').getByRole('textbox').fill('Ashtyn');
    await page.getByRole('button', { name: 'Add GPS Coordinates' }).click();
    await page.locator('#gpsCoords0').getByRole('textbox').click();
    await page.locator('#gpsCoords0').getByRole('textbox').fill('2, 4');
    await page.locator('#addGpsCoordsButton').click();
    await page.locator('#gpsCoords1').getByRole('textbox').click();
    await page.locator('#gpsCoords1').getByRole('textbox').fill('8, 8dfdsf');
    await page.locator('#location').getByRole('img').click();
    await page.getByText('garage').click();
    await page.getByRole('button', { name: 'Save' }).click({ delay: 50 });

    const accessionPrefix = `${yearId}-1-2-00`;
    await expect(page.getByRole('main')).toContainText(accessionPrefix);
    await expect(page.getByRole('main')).toContainText('Coconut');
    await expect(page.getByRole('main')).toContainText('Status Awaiting Check-In');
    await expect(page.getByRole('main')).toContainText('Location garage');
    accessionId = (await page.getByText(accessionPrefix).textContent()) as string;

    await expect(page.getByLabel('Accession Details')).toContainText('Alex');
    await expect(page.getByLabel('Accession Details').getByRole('paragraph')).toContainText('(Owner: Ashtyn)');
    await expect(page.getByLabel('Accession Details')).toContainText('Collected from plants');
    await page.getByRole('button', { name: 'Check In' }).click();
    await expect(page.getByRole('main')).toContainText('Awaiting Processing');
    await page
      .getByText('Status', { ...exactOptions })
      .locator('../..')
      .locator('.tw-icon') // edit icon
      .click();
    await page.locator('#accession-status').click();
    await page.getByText('Processing', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await expect(page.getByRole('main')).toContainText('Processing');
    await page
      .getByText('Status', { ...exactOptions })
      .locator('../..')
      .locator('.tw-icon') // edit icon
      .click();
    await page.locator('#accession-status').click();
    await page.getByText('Drying').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('main')).toContainText('Drying');
    await expect(page.getByRole('main')).toContainText('End-drying Reminder Off');
    await page
      .getByText('End-Drying Reminder', { ...exactOptions })
      .locator('../..')
      .locator('.tw-icon') // edit icon
      .click();
    await page.getByLabel('End-Drying Reminder').fill('2034-01-31');
    await page.getByRole('button', { name: 'Set Reminder' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await expect(page.getByRole('main')).toContainText('2034-01-31');
    await page.locator('a').filter({ hasText: 'Add' }).click();
    await page.locator('#remainingQuantity').getByRole('spinbutton').click();
    await page.locator('#remainingQuantity').getByRole('spinbutton').fill('500');
    await page.locator('#subsetWeight').getByRole('spinbutton').click();
    await page.locator('#subsetWeight').getByRole('spinbutton').fill('10');
    await page.locator('#subsetCount').getByRole('spinbutton').click();
    await page.locator('#subsetCount').getByRole('spinbutton').fill('10');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('main')).toContainText('500 Grams');
    await expect(page.getByRole('main')).toContainText('~500 ct');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByLabel('History')).toContainText('Super Admin created accession');
    await expect(page.getByLabel('History')).toContainText('Super Admin updated the status to Awaiting Processing');
    await expect(page.getByLabel('History')).toContainText('Super Admin updated the status to Processing');
    await expect(page.getByLabel('History')).toContainText('Super Admin updated the status to Drying');
    await expect(page.getByLabel('History')).toContainText('Super Admin updated the quantity to 500 grams');
    await page.getByRole('tab', { name: 'Viability Tests' }).click();
    await page.getByRole('button', { name: 'Add Test' }).click();
    await page.locator('#seed-type').click();
    await page.getByText('Fresh').click();
    await page.locator('#substrate').click();
    await page.getByText('Nursery Media').click();
    await page.locator('#seedsTested').getByRole('textbox').fill('5');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: '#' }).click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByRole('button', { name: 'Add Observation' }).click();
    await page.locator('#seedsGerminated').getByRole('textbox').click();
    await page.locator('#seedsGerminated').getByRole('textbox').fill('3');
    await page.getByLabel('Mark as Complete').check();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Apply Result' }).click();
    await expect(page.locator('#row1-viabilityPercent')).toContainText('60%');
    await expect(page.getByRole('main')).toContainText('60%');
    await expect(page.getByRole('main')).toContainText('495 Grams');
    await expect(page.getByRole('main')).toContainText('~495 ct');

    await page.getByRole('button', { name: 'Accessions' }).click();

    const accessionRow = (
      await page
        .getByText(accessionId)
        .locator('../..')
        .evaluate((el) => el.id)
    ).replace('-accessionNumber', '');

    await expect(page.locator(`#${accessionRow}-accessionNumber`)).toContainText(accessionId);
    await page.getByText(accessionId).click();
    await expect(page.getByRole('main')).toContainText('Coconut');
  });

  test.describe('Withdraw Tests', () => {
    test.describe.configure({ mode: 'default' });
    test('Withdraw to Nursery by seed count', async ({ page }, testInfo) => {
      await page.getByRole('button', { name: 'Seeds' }).click();
      await page.getByRole('button', { name: 'Accessions' }).click();

      const accessionRow = (
        await page
          .getByText(accessionId)
          .locator('../..')
          .evaluate((el) => el.id)
      ).replace('-accessionNumber', '');
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await page.getByRole('button', { name: 'Withdraw' }).click();
      await page.locator('#destinationFacilityId').getByRole('textbox').click();
      await page.getByText('Nursery', exactOptions).nth(0).click();
      await page.getByLabel('Seed Count', exactOptions).check();
      await page.locator('#withdrawnQuantity').getByRole('textbox').fill('300');
      await page.getByRole('button', { name: 'Add Notes' }).click();
      await page.locator('textarea').fill('Adding some test notes here!');
      await page.locator('#saveWithdraw').click();
      await expect(page.getByRole('main')).toContainText('195 Grams');
      await expect(page.getByRole('main')).toContainText('~195 ct');
      await page.getByRole('tab', { name: 'History' }).click();
      await expect(page.getByLabel('History')).toContainText(
        'Super Admin withdrew 300 seeds for nurseryAdding some test notes here!'
      );
      await page.getByRole('button', { name: 'Seedlings' }).click();
      await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
      await page.getByText('Coconut', exactOptions).locator('../..').waitFor({ state: 'visible' });
      const coconutRowNum = (
        await page
          .getByText('Coconut', exactOptions)
          .locator('../..')
          .evaluate((el) => el.id)
      ).replace('-species_scientificName', '');
      await expect(page.locator(`#${coconutRowNum}-species_scientificName`)).toContainText('Coconut');
      await expect(page.locator(`#${coconutRowNum}-facilityInventories`)).toContainText('Nursery');
      await expect(page.locator(`#${coconutRowNum}-germinatingQuantity`)).toContainText('300');
      await page.getByRole('tab', { name: 'By Nursery' }).click();
      await expect(page.locator('#row1-facility_name')).toContainText('Nursery');
      await page.getByRole('tab', { name: 'By Batch' }).click();
      await expect(page.locator('#row1-batchNumber')).toContainText('2-1-002');
    });

    test('Withdraw to Outplant', async ({ page }, testInfo) => {
      await page.getByRole('button', { name: 'Seeds' }).click();
      await page.getByRole('button', { name: 'Accessions' }).click();

      const accessionRow = (
        await page
          .getByText(accessionId)
          .locator('../..')
          .evaluate((el) => el.id)
      ).replace('-accessionNumber', '');
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await page.getByRole('button', { name: 'Withdraw' }).click();

      await page.getByPlaceholder('Select...').first().click();
      await page.getByText('Out-planting').click();
      await page.getByLabel('Seed Count', { exact: true }).check();
      await page.locator('#withdrawnQuantity').getByRole('textbox').fill('100');
      await page.locator('#saveWithdraw').click();
      await expect(page.getByRole('main')).toContainText('95 Grams');
      await expect(page.getByRole('main')).toContainText('~95 ct');
    });

    test('Withdraw to Viability Test', async ({ page }, testInfo) => {
      await page.getByRole('button', { name: 'Seeds' }).click();
      await page.getByRole('button', { name: 'Accessions' }).click();

      const accessionRow = (
        await page
          .getByText(accessionId)
          .locator('../..')
          .evaluate((el) => el.id)
      ).replace('-accessionNumber', '');
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await page.getByRole('button', { name: 'Withdraw' }).click();
      await page.locator('.textfield-value > .tw-icon > path').first().click();
      await page.getByText('Viability Testing').click();
      await page.getByPlaceholder('Select...').nth(1).click();
      await page.getByText('Nursery').click();
      await page.locator('div:nth-child(3) > .select > .textfield-container > .textfield-value').click();
      await page.getByText('Soil').click();
      await page.getByPlaceholder('Select...').nth(3).click();
      await page.getByText('Soak').click();
      await page.locator('#withdrawnQuantity').getByRole('spinbutton').fill('20');
      await page.locator('#saveWithdraw').click();
      await expect(page.getByRole('main')).toContainText('75 Grams');
      await expect(page.getByRole('main')).toContainText('~75 ct');
      await page.getByRole('tab', { name: 'Viability Tests' }).click();
      await expect(page.locator('#row1-testType')).toContainText('Nursery Germination');
      await page.getByRole('table', { name: 'enhanced table' }).getByRole('img').click();
      await expect(page.getByRole('main')).toContainText('Viability Result: Pending');
      await expect(page.getByRole('main')).toContainText('Soil');
      await expect(page.getByRole('main')).toContainText('Soak');
      await expect(page.getByRole('main')).toContainText('20');
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByPlaceholder('Select...').nth(1).click();
      await page.getByText('Fresh').click();
      await page.getByRole('button', { name: 'Add Observation' }).click();
      await page.locator('#seedsGerminated').getByRole('textbox').fill('15');
      await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(1000); //Wait for modal to close
      await page.locator('#row1-viabilityPercent').click();
      await expect(page.getByRole('main')).toContainText('15');
      await page.getByRole('button', { name: 'Edit' }).click();
      await page.getByRole('button', { name: 'Add Observation' }).click();
      await page.locator('div:nth-child(3) > div:nth-child(2) > div > .textfield > #seedsGerminated > input').fill('3');
      await page.getByLabel('Mark as Complete').check();
      await page.getByRole('button', { name: 'Save' }).click();
      await page.getByRole('button', { name: 'Apply Result' }).click();
      await expect(page.locator('#row1-viabilityPercent')).toContainText('90%');
    });
  });
});

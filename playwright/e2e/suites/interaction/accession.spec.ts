import { type Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, openNavItem, selectOrg, waitFor } from '../../utils/utils';

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
    await openNavItem(page, 'Seeds', 'Accessions');
    await page.getByRole('button', { name: 'Add Accession' }).click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Coconut' }).locator('div').click();

    await page.getByLabel('Collection Time').fill('12/31/2023 01:05 AM');

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
    await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'hidden', timeout: 10000 });
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
    await page.getByRole('button', { name: 'Set Reminder' }).waitFor({ state: 'hidden', timeout: 10000 });
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
    await expect(page.getByLabel('History')).toContainText('By Super Admin');
    await expect(page.getByLabel('History')).toContainText(`Accession ${accessionId} created`);
    await expect(page.getByLabel('History')).toContainText(
      'status changed from Awaiting Check-In to Awaiting Processing'
    );
    await expect(page.getByLabel('History')).toContainText('status changed from Awaiting Processing to Processing');
    await expect(page.getByLabel('History')).toContainText('status changed from Processing to Drying');
    await expect(page.getByLabel('History')).toContainText('quantity changed from None to 500 grams');
    await expect(page.getByLabel('History')).toContainText('drying end date changed from None to 2034-01-31');
    await expect(page.getByLabel('History')).toContainText('subset weight changed from None to 10 grams');
    await expect(page.getByLabel('History')).toContainText('subset count changed from None to 10');
    await page.getByRole('tab', { name: 'Viability Tests' }).click();
    await page.getByRole('button', { name: 'Add Test' }).click();
    await page.locator('#seed-type').click();
    await page.getByText('Fresh', exactOptions).click();
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
    await page.getByText(accessionId).waitFor({ state: 'visible', timeout: 30000 });
    const accessionRow = (await page.getByText(accessionId).evaluate((el) => el.closest('td')?.id ?? '')).replace(
      '-accessionNumber',
      ''
    );

    await expect(page.locator(`#${accessionRow}-accessionNumber`)).toContainText(accessionId);
    await page.getByText(accessionId).click();
    await expect(page.getByRole('main')).toContainText('Coconut');
  });

  test.describe('Withdraw Tests', () => {
    test.describe.configure({ mode: 'default' });
    test('Withdraw to Nursery by seed count', async ({ page }, testInfo) => {
      await openNavItem(page, 'Seedlings', 'Inventory');
      const initialCoconutGerminatingQuantity = await getSpeciesGerminatingQuantity(page, 'Coconut');

      await openNavItem(page, 'Seeds', 'Accessions');

      const accessionRow = (await page.getByText(accessionId).evaluate((el) => el.closest('td')?.id ?? '')).replace(
        '-accessionNumber',
        ''
      );
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await expect(page.getByRole('link', { name: 'Accessions' })).toBeVisible();
      await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
      const withdrawDialog = page.locator('.dialog-box');
      await withdrawDialog.locator('#destinationFacilityId').getByRole('textbox').click();
      await page.locator('li').getByText('Nursery', exactOptions).nth(0).click();
      await withdrawDialog.locator('textarea').fill('Adding some test notes here!');
      await withdrawDialog.getByRole('button', { name: 'Next' }).click();
      await withdrawDialog.getByLabel('Seed Count', exactOptions).check();
      await withdrawDialog.getByRole('spinbutton').fill('300');
      await withdrawDialog.getByRole('button', { name: 'Next' }).click();
      await withdrawDialog.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
      await expect(page.getByRole('main')).toContainText('195 Grams', { timeout: 30000 });
      await expect(page.getByRole('main')).toContainText('~195 ct');
      await page.getByRole('tab', { name: 'History' }).click();
      // The event log does not render withdrawal notes, unlike the legacy history tab.
      await expect(page.getByLabel('History')).toContainText('withdrew 300 seeds to Nursery');
      await expect(page.getByLabel('History')).toContainText('withdrew 5 seeds for Viability Testing');
      await expect(page.getByLabel('History')).toContainText(
        'Viability test total seeds germinated changed from 0 to 3'
      );
      await expect(page.getByLabel('History')).toContainText('Viability test viability percent changed from 0 to 60');
      // The end date is server-set to today, so assert the field change without the value.
      await expect(page.getByLabel('History')).toContainText('Viability test end date changed from None to');
      await openNavItem(page, 'Seedlings', 'Inventory');
      await expect
        .poll(() => getSpeciesGerminatingQuantity(page, 'Coconut'), { timeout: 30000 })
        .toBe(initialCoconutGerminatingQuantity + 300);
      await page.getByRole('tab', { name: 'By Nursery' }).click();
      await expect(page.getByRole('link', { name: 'Nursery', ...exactOptions })).toBeVisible({ timeout: 30000 });
      await page.getByRole('tab', { name: 'By Batch' }).click();
      const coconutNurseryBatch = page
        .getByRole('row')
        .filter({ has: page.getByRole('cell', { name: 'Coconut', ...exactOptions }) })
        .filter({ has: page.getByRole('cell', { name: 'Nursery', ...exactOptions }) })
        .first();
      await expect(coconutNurseryBatch).toBeVisible();
    });

    test('Withdraw to Plant', async ({ page }, testInfo) => {
      await openNavItem(page, 'Seeds', 'Accessions');

      const accessionRow = (await page.getByText(accessionId).evaluate((el) => el.closest('td')?.id ?? '')).replace(
        '-accessionNumber',
        ''
      );
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).waitFor({ state: 'visible' });
      await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
      const withdrawDialog = page.locator('.dialog-box');
      await withdrawDialog.getByLabel('Planting', exactOptions).check();
      await withdrawDialog.getByRole('button', { name: 'Next' }).click();
      await withdrawDialog.getByLabel('Seed Count', exactOptions).check();
      await withdrawDialog.getByRole('spinbutton').fill('100');
      await withdrawDialog.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
      await expect(page.getByRole('main')).toContainText('95 Grams');
      await expect(page.getByRole('main')).toContainText('~95 ct');
      await page.getByRole('tab', { name: 'History' }).click();
      await expect(page.getByLabel('History')).toContainText('withdrew 100 seeds for Out-planting');
    });

    test('Withdraw to Viability Test', async ({ page }, testInfo) => {
      await openNavItem(page, 'Seeds', 'Accessions');

      const accessionRow = (await page.getByText(accessionId).evaluate((el) => el.closest('td')?.id ?? '')).replace(
        '-accessionNumber',
        ''
      );
      await page.locator(`#${accessionRow}-accessionNumber`).getByText(accessionId).click();
      await expect(page.getByRole('link', { name: 'Accessions' })).toBeVisible();
      await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
      const withdrawDialog = page.locator('.dialog-box');
      await withdrawDialog.getByLabel('Viability Testing', exactOptions).check();
      await withdrawDialog.getByText('Test Type', exactOptions).locator('..').getByRole('textbox').click();
      await page.locator('li').getByText('Nursery', exactOptions).click();
      await withdrawDialog.getByText('Substrate', exactOptions).locator('..').getByRole('textbox').click();
      await page.locator('li').getByText('Soil', exactOptions).click();
      await withdrawDialog.getByText('Treatment', exactOptions).locator('..').getByRole('textbox').click();
      await page.locator('li').getByText('Soak', exactOptions).click();
      await withdrawDialog.getByRole('button', { name: 'Next' }).click();
      await withdrawDialog.getByLabel('Seed Count', exactOptions).check();
      await withdrawDialog.getByRole('spinbutton').fill('20');
      await withdrawDialog.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
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
      await page.getByText('Fresh', exactOptions).click();
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
      await page.getByRole('tab', { name: 'History' }).click();
      await expect(page.getByLabel('History')).toContainText('withdrew 20 seeds for Viability Testing');
      await expect(page.getByLabel('History')).toContainText('Viability test viability percent changed from 75 to 90');
    });
  });
});

const getSpeciesGerminatingQuantity = async (page: Page, species: string) => {
  await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });
  const speciesCell = page.getByRole('cell', { name: species, ...exactOptions });
  if ((await speciesCell.count()) === 0) {
    return 0;
  }

  const rowId = ((await speciesCell.first().getAttribute('id')) ?? '').replace('-scientificName', '');
  const quantityText = await page.locator(`#${rowId}-germinatingQuantity`).textContent();
  const quantity = Number(quantityText?.replaceAll(',', '').trim());
  if (!Number.isFinite(quantity)) {
    throw new Error(`Could not read the germinating quantity for ${species}`);
  }

  return quantity;
};

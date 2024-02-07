import { test, expect } from '@playwright/test';
import { waitFor } from '../utils/utils';

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  // Make all requests look like they are associated with an existing login session
  // so we don't have to depend on a Keycloak server to run the test suite. The
  // session value here is the base64-encoded session ID from dump/session.sql.
  await context.addCookies([
    { name: 'SESSION', value: 'Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh', url: 'http://127.0.0.1:3000' },
  ]);
});

export default function AccessionTests() {
  test('Add An Accession', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');

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
    await page.locator('#collectionSiteName').getByRole('textbox').click();
    await page.locator('#collectionSiteName').getByRole('textbox').fill("Alex's Mansion");
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
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByRole('main')).toContainText('24-1-2-00');
    await expect(page.getByRole('main')).toContainText('Coconut');
    await expect(page.getByRole('main')).toContainText('Status Awaiting Check-In');
    await expect(page.getByRole('main')).toContainText('Location garage');

    await expect(page.getByLabel('Accession Details')).toContainText('Alex');
    await expect(page.getByLabel('Accession Details').getByRole('paragraph')).toContainText('(Owner: Ashtyn)');
    await expect(page.getByLabel('Accession Details')).toContainText('Collected from plants');
    await page.getByRole('button', { name: 'Check In' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('main')).toContainText('Awaiting Processing');
    await page.getByRole('main').getByRole('button').nth(1).click();
    await page.locator('.textfield-value > .tw-icon').click();
    await page.getByText('Processing', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await expect(page.getByRole('main')).toContainText('Processing');
    await page.getByRole('main').getByRole('button').nth(1).click();
    await page.getByPlaceholder('Select...').click();
    await page.getByText('Drying').click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('main')).toContainText('Drying');
    await expect(page.getByRole('main')).toContainText('End-drying Reminder Off');
    await page.getByRole('main').getByRole('button').nth(3).click();
    await page.getByLabel('Turn on End-drying Reminder').check();
    await page.getByLabel('Reminder Date').fill('2034-01-31');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await expect(page.getByRole('main')).toContainText('(2034-01-31)');
    await page.locator('a').nth(2).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('500');
    await page.getByRole('button', { name: 'Add Subset Weight And Count' }).click();
    await page.locator('#subsetWeight').getByRole('spinbutton').click();
    await page.locator('#subsetWeight').getByRole('spinbutton').fill('10');
    await page.locator('#subsetCount').getByRole('spinbutton').click();
    await page.locator('#subsetCount').getByRole('spinbutton').fill('10');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByRole('main')).toContainText('500 Grams');
    await expect(page.getByRole('main')).toContainText('~500 ct');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByLabel('History')).toContainText('Test User created accession');
    await expect(page.getByLabel('History')).toContainText('Test User updated the status to Awaiting Processing');
    await expect(page.getByLabel('History')).toContainText('Test User updated the status to Processing');
    await expect(page.getByLabel('History')).toContainText('Test User updated the status to Drying');
    await expect(page.getByLabel('History')).toContainText('Test User updated the quantity to 500 grams');
    await page.getByRole('tab', { name: 'Viability Tests' }).click();
    await page.getByRole('button', { name: 'Add Test' }).click();
    await page.getByPlaceholder('Select...').nth(1).click();
    await page.getByText('Fresh').click();
    await page.getByPlaceholder('Select...').nth(2).click();
    await page.getByText('Nursery Media').click();
    await page.locator('input[type="text"]').click();
    await page.locator('input[type="text"]').fill('5');
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
    await expect(page.locator('#row1-accessionNumber')).toContainText('24-1-2-001');
    await page.getByText('-1-2-001').click();
    await expect(page.getByRole('main')).toContainText('Coconut');
  });

  test('Withdraw to Nursery', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Seeds' }).click();
    await page.getByRole('button', { name: 'Accessions' }).click();
    await page.locator('#row1-estimatedWeightGrams').getByText('495').click();
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await page.locator('#destinationFacilityId').getByRole('textbox').click();
    await page
      .getByText(/My New Nursery/)
      .nth(0)
      .click();
    await page.locator('input[type="text"]').fill('300');
    await page.getByRole('button', { name: 'Add Notes' }).click();
    await page.locator('textarea').fill('Adding some test notes here!');
    await page.locator('#saveWithdraw').click();
    await expect(page.getByRole('main')).toContainText('195 Grams');
    await expect(page.getByRole('main')).toContainText('~195 ct');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByLabel('History')).toContainText(
      'Test User withdrew 300 seeds for nurseryAdding some test notes here!'
    );
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await expect(page.locator('#row1-species_scientificName')).toContainText('Coconut');
    await expect(page.locator('#row1-facilityInventories')).toContainText(/My New Nursery/);
    await expect(page.locator('#row1-germinatingQuantity')).toContainText('300');
    await page.getByRole('tab', { name: 'By Nursery' }).click();
    await expect(page.locator('#row1-facility_name')).toContainText(/My New Nursery/);
    await page.getByRole('tab', { name: 'By Batch' }).click();
    await expect(page.locator('#row1-batchNumber')).toContainText('2-1-001');
  });

  test('Withdraw to Outplant', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Seeds' }).click();
    await page.getByRole('button', { name: 'Accessions' }).click();
    await page.locator('#row1-estimatedWeightGrams').getByText('195').click();
    await page.getByRole('button', { name: 'Withdraw' }).click();

    await page.getByPlaceholder('Select...').first().click();
    await page.getByText('Out-planting').click();
    await page.getByLabel('Seed Count', { exact: true }).check();
    await page.locator('input[type="text"]').click();
    await page.locator('input[type="text"]').fill('100');
    await page.locator('#saveWithdraw').click();
    await expect(page.getByRole('main')).toContainText('95 Grams');
    await expect(page.getByRole('main')).toContainText('~95 ct');
  });

  test('Withdraw to Viability Test', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');

    await page.getByRole('button', { name: 'Seeds' }).click();
    await page.getByRole('button', { name: 'Accessions' }).click();
    await page.locator('#row1-estimatedWeightGrams').getByText('95').click();
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await page.locator('.textfield-value > .tw-icon > path').first().click();
    await page.getByText('Viability Testing').click();
    await page.getByPlaceholder('Select...').nth(1).click();
    await page.getByText('Nursery').click();
    await page.locator('div:nth-child(3) > .select > .textfield-container > .textfield-value').click();
    await page.getByText('Soil').click();
    await page.getByPlaceholder('Select...').nth(3).click();
    await page.getByText('Soak').click();
    await page.locator('input[type="text"]').click();
    await page.locator('input[type="text"]').fill('20');
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
    await page.locator('input[type="text"]').nth(2).click();
    await page.locator('input[type="text"]').nth(2).fill('3');
    await page.getByLabel('Mark as Complete').check();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Apply Result' }).click();
    await expect(page.locator('#row1-viabilityPercent')).toContainText('90%');
  });
}

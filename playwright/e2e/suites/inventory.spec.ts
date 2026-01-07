import { Locator, expect, test } from '@playwright/test';
import { Page } from 'playwright-core';

import { changeToSuperAdmin } from '../utils/userUtils';
import { exactOptions, selectOrg, waitFor } from '../utils/utils';

test.describe('InventoryTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Add A Batch (no accession)', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
    await page.locator('#new-inventory').click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Banana' }).locator('div').click();
    await page.locator('div:nth-child(2) > .select > .textfield-container').click();

    await page.locator('#facilityId path').click();
    await page.locator('li').getByText('Nursery', exactOptions).nth(0).click();
    await page.locator('#subLocationId path').click();
    await page.getByText('Nursery Garage').click();

    await page.getByLabel('Date Added *').click();
    await page.getByLabel('Date Added *').fill('2024-02-01');
    await page.getByLabel('Seeds Sown Date').fill('2024-02-02');
    await page.getByLabel('Seeds Sown Date').click();
    await page.getByLabel('Germination/Establishment Started Date').click();
    await page.getByLabel('Germination/Establishment Started Date').fill('2024-02-03');
    await page.locator('#germinatingQuantity').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantity').getByRole('spinbutton').fill('0500');
    await page.locator('#activeGrowthQuantity').getByRole('spinbutton').click();
    await page.locator('#activeGrowthQuantity').getByRole('spinbutton').fill('0100');
    await page.locator('#readyQuantity').getByRole('spinbutton').click();
    await page.locator('#readyQuantity').getByRole('spinbutton').fill('0100');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Adding some notes');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Banana', exactOptions)).toBeVisible();
    await expect(page.getByText('Garage')).toBeVisible();
    await expect(page.getByText('-02-01')).toBeVisible();
    await expect(page.getByText('-02-02')).toBeVisible();
    await expect(page.getByText('-02-03')).toBeVisible();
    await expect(page.getByText('Germination/Establishment Quantity 500')).toBeVisible();
    await expect(page.getByText('Active Growth Quantity 100')).toBeVisible();
    await expect(page.getByText('Ready to Plant Quantity 100', exactOptions)).toBeVisible();
    await expect(page.getByText('Total Quantity 200')).toBeVisible();
    await expect(page.getByText('Notes Adding some notes')).toBeVisible();
    page.mouse.wheel(0, 1000);
    await page.getByRole('tab', { name: 'History' }).click();
    page.mouse.wheel(0, 1000);
    await expect(page.getByRole('cell', { name: 'Germination/Establishment Quantity, Active' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Super Admin' })).toBeVisible();
    await page.getByRole('tab', { name: 'Details' }).click();
  });

  test('Add A Batch from an Accession', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
    await page.locator('#new-inventory').click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Kousa Dogwood' }).locator('div').click();

    await page.locator('#accessionId').getByRole('textbox').click();
    await page.getByText('-1-2-001').click();

    await page.locator('#facilityId path').click();
    await page.locator('li').getByText('Nursery', exactOptions).nth(0).click();
    await page.locator('#subLocationId path').click();
    await page.getByText('Nursery Garage').click();

    await page.getByLabel('Date Added *').click();
    await page.getByLabel('Date Added *').fill('2024-02-01');
    await page.locator('#germinatingQuantity').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantity').getByRole('spinbutton').fill('25');
    await page.locator('#activeGrowthQuantity').getByRole('spinbutton').click();
    await page.locator('#activeGrowthQuantity').getByRole('spinbutton').fill('25');
    await page.locator('#readyQuantity').getByRole('spinbutton').click();
    await page.locator('#readyQuantity').getByRole('spinbutton').fill('25');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Adding some notes');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Kousa Dogwood (Kousa Dogwood)', exactOptions)).toBeVisible();
    await expect(page.getByText('Garage')).toBeVisible();
    await expect(page.getByText('Germination/Establishment Quantity 25')).toBeVisible();
    await expect(page.getByText('Active Growth Quantity 25')).toBeVisible();
    await expect(page.getByText('Ready to Plant Quantity 25', exactOptions)).toBeVisible();
    await expect(page.getByText('Total Quantity 50')).toBeVisible();
    await expect(page.getByText('Notes Adding some notes')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Germination/Establishment Quantity, Active' })).toBeVisible();
    await expect(page.locator('#row1-editedByName')).toContainText('Super Admin');
    await page.getByRole('tab', { name: 'Details' }).click();
  });

  test('Transition Status and Withdraw Dead', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
    await page.getByRole('tab', { name: 'By Batch' }).click();
    const batchNumber = await getBatchNumberBySpeciesAndNursery(page, 'Kousa Dogwood', 'Nursery');
    await page.getByRole('link', { name: batchNumber }).click();
    await page.getByLabel('Details').getByRole('button').nth(1).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('20');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByLabel('Details').getByRole('button').nth(2).click();
    await page.locator('#nextGrowthPhase').click();
    await page.getByText('Ready to Plant', exactOptions).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('35');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await page.mouse.wheel(0, -1000);
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await page.getByLabel('Dead').check();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').fill('5');
    await page.locator('#activeGrowthQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#activeGrowthQuantityWithdrawn').getByRole('spinbutton').fill('10');
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').fill('0');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await expect(page.getByRole('main')).toContainText('Germination/Establishment Rate 80');
    await expect(page.getByRole('main')).toContainText('Loss Rate 14');
    await expect(page.getByRole('main')).toContainText('Total Withdrawn 15');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.locator('#row1-editedByName')).toContainText('Super Admin');
    await expect(page.getByRole('cell', { name: 'Withdrawal - Dead' })).toBeVisible();
    await page.getByRole('link', { name: 'Withdrawal - Dead' }).click();
    await expect(page.getByText('Purpose Dead')).toBeVisible();
    await expect(page.getByText('Quantity 15')).toBeVisible();
    await expect(page.getByRole('link', { name: batchNumber })).toBeVisible();
    await expect(page.locator('#row1-name')).toContainText('Kousa Dogwood');
    await expect(page.locator('#row1-germinating')).toContainText('5');
    await expect(page.locator('#row1-activeGrowth')).toContainText('10');
    await expect(page.locator('#row1-ready')).toContainText('0');
    await expect(page.locator('#row1-total')).toContainText('15');
    await page.getByRole('link', { name: 'Withdrawal History' }).click();
    await expect(page.locator('#row1-speciesScientificNames')).toContainText('Kousa Dogwood');
    await expect(page.getByRole('cell', { name: '15', ...exactOptions })).toBeVisible();
  });

  test('Transfer Nurseries', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
    await page.getByRole('tab', { name: 'By Batch' }).click();
    const batchNumber = await getBatchNumberBySpeciesAndNursery(page, 'Banana', 'Nursery');
    await page.getByRole('link', { name: batchNumber }).click();
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await page.waitForTimeout(1000); //Wait for modal to load
    await page.getByLabel('Nursery Transfer').check();
    await page.locator('#destinationFacilityId').getByPlaceholder('Select...').click();
    await page.getByText('Other Nursery', exactOptions).click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.locator('#activeGrowthQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#activeGrowthQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.getByText('Withdrawal DetailsSelect a').click();
    await expect(page.getByText('Withdraw Quantity150')).toBeVisible();
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Transferring some banana to the other nursery');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await expect(page.getByText('1 batch for a total of 150')).toBeVisible();
    await page.getByRole('button', { name: 'Withdrawals' }).click();
    await page.getByRole('tab', { name: 'Withdrawal History' }).click();
    await page.getByRole('row', { name: 'Nursery Transfer' }).locator('[id$="-withdrawnDate"]').click();
    await expect(page.getByText('Purpose Nursery Transfer')).toBeVisible();
    await expect(page.getByText('Quantity 150')).toBeVisible();
    await expect(page.getByText('Destination Other Nursery')).toBeVisible();
    await expect(page.getByText('Notes Transferring some banana')).toBeVisible();
    await expect(page.getByRole('cell', { name: batchNumber })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Banana' })).toBeVisible();
    await expect(page.locator('#row1-germinating')).toBeVisible();
    await expect(page.locator('#row1-activeGrowth')).toBeVisible();
    await expect(page.locator('#row1-ready')).toBeVisible();
    await expect(page.getByRole('cell', { name: '150' })).toBeVisible();
    await page.getByRole('link', { name: batchNumber }).click();
    await expect(page.getByText('Germination/Establishment Quantity 450')).toBeVisible();
    await expect(page.getByText('Active Growth Quantity 50')).toBeVisible();
    await expect(page.getByText('Ready to Plant Quantity 50', exactOptions)).toBeVisible();
    await expect(page.getByText('Total Quantity 100')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Withdrawal - Nursery Transfer' })).toBeVisible();
    await expect(page.locator('#row1-editedByName')).toBeVisible();
    await page.getByRole('link', { name: 'Inventory / Batches of Banana' }).click();
    await page.locator('#row1-germinatingQuantity').click();
    await expect(page.getByRole('cell', { name: batchNumber })).toBeVisible();
    await expect(page.locator('#row1-germinatingQuantity')).toContainText('50');
    await expect(page.locator('#row1-activeGrowthQuantity')).toContainText('50');
    await expect(page.locator('#row1-hardeningOffQuantity')).toContainText('0');
    await expect(page.locator('#row1-readyQuantity')).toContainText('50');
    await expect(page.locator('#row1-totalQuantity')).toContainText('100');
    await expect(page.locator('#row1-totalQuantityWithdrawn')).toContainText('0');
    await expect(page.getByRole('cell', { name: 'Other Nursery', ...exactOptions })).toBeVisible();

    await page.mouse.wheel(0, -1000);
    await page.getByRole('link', { name: 'Inventory' }).click();
    await page.getByRole('tab', { name: 'By Nursery' }).click();
    await page.getByRole('link', { name: 'Other Nursery', ...exactOptions }).click();
    await expect(page.getByText('Germination/Establishment Quantity 50')).toBeVisible();
    await expect(page.getByText('Active Growth Quantity 50')).toBeVisible();
    await expect(page.getByText('Ready to Plant Quantity 50', exactOptions)).toBeVisible();
    await expect(page.getByText('Total Quantity 100')).toBeVisible();
    await expect(page.getByText('Batches at Other Nursery')).toBeVisible();
    await expect(page.getByText('Species Banana')).toBeVisible();
    const newBatchNumber = await getBatchNumberBySpecies(page.locator('.MuiTable-root'), 'Banana');
    await page.getByRole('button', { name: newBatchNumber }).click();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Nursery Transfer' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Super Admin' })).toBeVisible();
  });

  test('Withdraw for Outplanting', async ({ page }, testInfo) => {
    const logs: string[] = [];
    page.on('console', (message) => {
      //logs.push(message.text());
      console.log(message.text());
    });

    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory', ...exactOptions }).click();
    await page.getByRole('tab', { name: 'By Batch' }).click();

    const batchNumber = await getBatchNumberBySpeciesAndNursery(page, 'Kousa Dogwood', 'Nursery');
    await page.getByRole('link', { name: batchNumber }).click();
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await page.getByLabel('Planting').check();
    await page.locator('#plantingSiteId').getByPlaceholder('Select...').click();
    await page.getByText('Planting Site', exactOptions).click();
    await page.getByLabel('Open').first().click();
    await page.getByRole('option', { name: 'East' }).click();
    await page.getByLabel('Open').nth(1).click();
    await page.getByRole('option', { name: 'North' }).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('060');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Withdrawing to Planting Site!');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw', ...exactOptions }).click();
    await expect(page.getByText('One or more batches are now')).toBeVisible();
    await page.getByRole('button', { name: 'Got It!' }).click();
    await expect(page.getByText('1 batch for a total of 60')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Withdrawal - Planting' }).nth(0)).toBeVisible();
    await page.getByRole('button', { name: 'Withdrawals' }).click();
    await expect(page.getByRole('cell', { name: 'Planting Site' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '60' })).toBeVisible();
    await page.getByRole('link', { name: '60' }).click();
    await expect(page.getByText('Destination:Planting Site')).toBeVisible();
    await expect(page.getByText('Substratum:North')).toBeVisible();
    await expect(page.locator('#row1-purpose')).toContainText('Planting');
    await expect(page.locator('#row1-facility_name')).toContainText('Nursery');
    await expect(page.locator('#row1-destinationName')).toContainText('Planting Site');
    await expect(page.locator('#row1-substratumNames')).toContainText('North');
    await expect(page.locator('#row1-speciesScientificNames')).toContainText('Kousa Dogwood');
    await expect(page.locator('#row1-totalWithdrawn')).toContainText('60');
  });

  test('Plants dashboard after outplanting', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard', ...exactOptions }).click();
    await expect(page.getByText('60')).toBeVisible();
    await expect(page.getByText('1 Species', exactOptions)).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(6000); //Wait for map to load
  });

  test('Withdrawals after outplanting', async ({ page }, testInfo) => {
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Withdrawals' }).click();
    const mapTab = page.locator('p.MuiTypography-root').filter({ hasText: 'Map', hasNotText: 'show for this' });
    await mapTab.click();

    // select planting site
    await page.locator('.textfield-container > .textfield-value').click();
    await page
      .locator('li')
      .filter({ hasText: /^Planting Site$/ })
      .click();

    await page.mouse.down();
    await expect(page.getByLabel('Planting Progress').getByText('Planting Progress')).toBeVisible();
    await page.waitForTimeout(6000); //Wait for map to load
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
    await page.locator('.mapboxgl-map').click({
      position: {
        x: 526,
        y: 172,
      },
    });

    await expect(page.getByText('60 Seedlings Sent')).toBeVisible();
    await expect(page.getByText('Kousa Dogwood')).toBeVisible();
    await page.getByRole('link', { name: 'See Withdrawal History' }).click();
    await expect(page.getByText('Destination:Planting Site')).toBeVisible();
    await expect(page.getByText('Substratum:North')).toBeVisible();
  });
});

const getBatchNumberBySpeciesAndNursery = async (page: Page, species: string, nursery: string) => {
  const rowNumber = (
    await page
      .getByText(nursery, exactOptions)
      .locator('../..')
      .getByText(species)
      .first()
      .locator('..')
      .evaluate((el) => el.id)
  )
    .replace('-species_scientificName', '')
    .replace('_noLink', '');
  return (await page.locator(`#${rowNumber}-batchNumber`).textContent()) as string;
};

const getBatchNumberBySpecies = async (parent: Page | Locator, species: string) => {
  const rowNumber = (
    await parent
      .getByText(species)
      .first()
      .locator('../..')
      .evaluate((el) => el.id)
  )
    .replace('-species_scientificName', '')
    .replace('_noLink', '');
  return (await parent.locator(`#${rowNumber}-batchNumber`).textContent()) as string;
};

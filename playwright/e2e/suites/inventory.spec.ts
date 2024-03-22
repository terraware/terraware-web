import { expect, test } from '@playwright/test';

import { addCookies, waitFor } from '../utils/utils';

test.setTimeout(60000);
test.beforeEach(async ({ context }, testInfo) => {
  await addCookies(context);
});

export default function InventoryTests() {
  test('Add A Batch (no accession)', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('button', { name: 'Add Inventory' }).click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Banana' }).locator('div').click();
    await page.locator('div:nth-child(2) > .select > .textfield-container').click();
    await page.locator('#facilityId path').click();

    await page.locator('li').filter({ hasText: 'My New Nursery' }).nth(0).click();

    await page
      .locator('div')
      .filter({ hasText: /^Select\.\.\.$/ })
      .nth(1)
      .click();
    await page.locator('#facilityId').getByRole('textbox').click();
    await page.getByText('Add InventoryAdd InventoryAdd').click();
    await page
      .locator('div')
      .filter({ hasText: /^Select\.\.\.$/ })
      .nth(1)
      .click();
    await page.getByText('Garage').click();
    await page.getByLabel('show-options').locator('path').click();

    await page.getByLabel('Date Added *').click();
    await page.getByLabel('Date Added *').fill('2024-02-01');
    await page.locator('#germinatingQuantity').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantity').getByRole('spinbutton').fill('0500');
    await page.locator('#notReadyQuantity').getByRole('spinbutton').click();
    await page.locator('#notReadyQuantity').getByRole('spinbutton').fill('0100');
    await page.locator('#readyQuantity').getByRole('spinbutton').click();
    await page.locator('#readyQuantity').getByRole('spinbutton').fill('0100');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Adding some notes');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Banana')).toBeVisible();
    await expect(page.getByText('Garage')).toBeVisible();
    await expect(page.getByText('-02-01')).toBeVisible();
    await expect(page.getByText('Germinating Quantity 500')).toBeVisible();
    await expect(page.getByText('Not Ready Quantity 100')).toBeVisible();
    await expect(page.getByText('Ready Quantity 100', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Quantity 200')).toBeVisible();
    await expect(page.getByText('Notes Adding some notes')).toBeVisible();
    page.mouse.wheel(0, 1000);
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Germinating Quantity, Not' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Test User' })).toBeVisible();
    await page.getByRole('tab', { name: 'Details' }).click();
  });

  test('Add A Batch from an Accession', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('button', { name: 'Add Inventory' }).click();
    await page.getByPlaceholder('Search or Select...').click();
    await page.locator('li').filter({ hasText: 'Coconut' }).locator('div').click();

    await page.locator('#accessionId').getByRole('textbox').click();
    await page.getByText('-1-2-001').click();

    await page.locator('#facilityId path').click();

    await page.locator('li').filter({ hasText: 'My New Nursery' }).nth(0).click();

    await page
      .locator('div')
      .filter({ hasText: /^Select\.\.\.$/ })
      .nth(1)
      .click();
    await page.locator('#facilityId').getByRole('textbox').click();
    await page.getByText('Add InventoryAdd InventoryAdd').click();
    await page
      .locator('div')
      .filter({ hasText: /^Select\.\.\.$/ })
      .nth(1)
      .click();
    await page.getByText('Garage').click();
    await page.getByLabel('show-options').locator('path').click();

    await page.getByLabel('Date Added *').click();
    await page.getByLabel('Date Added *').fill('2024-02-01');
    await page.locator('#germinatingQuantity').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantity').getByRole('spinbutton').fill('25');
    await page.locator('#notReadyQuantity').getByRole('spinbutton').click();
    await page.locator('#notReadyQuantity').getByRole('spinbutton').fill('25');
    await page.locator('#readyQuantity').getByRole('spinbutton').click();
    await page.locator('#readyQuantity').getByRole('spinbutton').fill('25');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Adding some notes');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Coconut')).toBeVisible();
    await expect(page.getByText('Garage')).toBeVisible();
    await expect(page.getByText('Germinating Quantity 25')).toBeVisible();
    await expect(page.getByText('Not Ready Quantity 25')).toBeVisible();
    await expect(page.getByText('Ready Quantity 25', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Quantity 50')).toBeVisible();
    await expect(page.getByText('Notes Adding some notes')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Germinating Quantity, Not' })).toBeVisible();
    await expect(page.locator('#row1-editedByName')).toContainText('Test User');
    await page.getByRole('tab', { name: 'Details' }).click();
  });

  test('Transition Status and Withdraw Dead', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('link', { name: '-2-2-003' }).click();
    await page.getByLabel('Details').getByRole('button').nth(1).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('20');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByLabel('Details').getByRole('button').nth(2).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('35');
    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000); //Wait for modal to close
    await page.mouse.wheel(0, -1000);
    await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await page.getByLabel('Dead').check();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').fill('5');
    await page.locator('#notReadyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#notReadyQuantityWithdrawn').getByRole('spinbutton').fill('10');
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').fill('0');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw' }).click();
    await expect(page.getByRole('main')).toContainText('Germination Rate 80');
    await expect(page.getByRole('main')).toContainText('Loss Rate 14');
    await expect(page.getByRole('main')).toContainText('Total Withdrawn 15');
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.locator('#row1-editedByName')).toContainText('Test User');
    await expect(page.getByRole('cell', { name: 'Withdrawal - Dead' })).toBeVisible();
    await page.getByRole('link', { name: 'Withdrawal - Dead' }).click();
    await expect(page.getByText('Purpose Dead')).toBeVisible();
    await expect(page.getByText('Quantity 15')).toBeVisible();
    await expect(page.getByRole('link', { name: '-2-2-003' })).toBeVisible();
    await expect(page.locator('#row1-name')).toContainText('Coconut');
    await expect(page.locator('#row1-germinating')).toContainText('5');
    await expect(page.locator('#row1-notReady')).toContainText('10');
    await expect(page.locator('#row1-ready')).toContainText('0');
    await expect(page.locator('#row1-total')).toContainText('15');
    await page.getByRole('link', { name: 'Withdrawal Log' }).click();
    await expect(page.locator('#row1-speciesScientificNames')).toContainText('Coconut');
    await expect(page.getByRole('cell', { name: '15' })).toBeVisible();
  });

  test('Transfer Nurseries', async ({ page }, testInfo) => {
    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('link', { name: '-2-2-002' }).click();
    await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await page.waitForTimeout(1000); //Wait for modal to load
    await page.getByLabel('Nursery Transfer').check();
    await page.locator('#destinationFacilityId').getByPlaceholder('Select...').click();
    await page.getByText('Nursery', { exact: true }).click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#germinatingQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.locator('#notReadyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#notReadyQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').click();
    await page.locator('#readyQuantityWithdrawn').getByRole('spinbutton').fill('50');
    await page.getByText('Withdrawal DetailsSelect a').click();
    await expect(page.getByText('Withdraw Quantity150')).toBeVisible();
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Transfering some banana to the other nursery');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await expect(page.getByText('1 batch for a total of 150')).toBeVisible();
    await page.getByRole('button', { name: 'Withdrawals' }).click();
    await page.getByRole('tab', { name: 'Withdrawal History' }).click();
    await page.locator('#row2-withdrawnDate').click();
    await expect(page.getByText('Purpose Nursery Transfer')).toBeVisible();
    await expect(page.getByText('Quantity 150')).toBeVisible();
    await expect(page.getByText('Destination Nursery')).toBeVisible();
    await expect(page.getByText('Notes Transfering some banana')).toBeVisible();
    await expect(page.getByRole('cell', { name: '-2-2-002' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Banana' })).toBeVisible();
    await expect(page.locator('#row1-germinating')).toBeVisible();
    await expect(page.locator('#row1-notReady')).toBeVisible();
    await expect(page.locator('#row1-ready')).toBeVisible();
    await expect(page.getByRole('cell', { name: '150' })).toBeVisible();
    await page.getByRole('link', { name: '-2-2-002' }).click();
    await expect(page.getByText('Germinating Quantity 450')).toBeVisible();
    await expect(page.getByText('Not Ready Quantity 50')).toBeVisible();
    await expect(page.getByText('Ready Quantity 50', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Quantity 100')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Withdrawal - Nursery Transfer' })).toBeVisible();
    await expect(page.locator('#row1-editedByName')).toBeVisible();
    await page.getByRole('link', { name: 'Inventory / Batches of Banana' }).click();
    await page.locator('#row1-germinatingQuantity').click();
    await expect(page.getByRole('cell', { name: '-2-1-002' })).toBeVisible();
    await expect(page.locator('#row1-germinatingQuantity')).toContainText('50');
    await expect(page.locator('#row1-notReadyQuantity')).toContainText('50');
    await expect(page.locator('#row1-readyQuantity')).toContainText('50');
    await expect(page.locator('#row1-totalQuantity')).toContainText('100');
    await expect(page.getByRole('cell', { name: '0', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Nursery', exact: true })).toBeVisible();

    await page.mouse.wheel(0, -1000);
    await page.getByRole('link', { name: 'Inventory' }).click();
    await page.getByRole('tab', { name: 'By Nursery' }).click();
    await page.getByRole('link', { name: 'Nursery', exact: true }).click();
    await expect(page.getByText('Germinating Quantity 50')).toBeVisible();
    await expect(page.getByText('Not Ready Quantity 50')).toBeVisible();
    await expect(page.getByText('Ready Quantity 50', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Quantity 100')).toBeVisible();
    await expect(page.getByText('Batches at Nursery')).toBeVisible();
    await expect(page.getByText('Species Banana')).toBeVisible();
    await page.getByRole('button', { name: '-2-1-002' }).click();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Nursery Transfer' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Test User' })).toBeVisible();
  });

  test('Withdraw for Outplanting', async ({ page }, testInfo) => {
    const logs: string[] = [];
    page.on('console', (message) => {
      //logs.push(message.text());
      console.log(message.text());
    });

    await page.goto('http://127.0.0.1:3000');

    await waitFor(page, '#home');
    await page.getByRole('button', { name: 'Seedlings' }).click();
    await page.getByRole('button', { name: 'Inventory' }).click();
    await page.getByRole('tab', { name: 'By Batch' }).click();

    await page.getByRole('link', { name: '-2-2-003' }).click();
    await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await page.getByLabel('Outplant').check();
    await page.locator('#plantingSiteId').getByPlaceholder('Select...').click();
    await page.getByText('Planting Site', { exact: true }).click();
    await page.getByLabel('Open').first().click();
    await page.getByRole('option', { name: 'East' }).click();
    await page.getByLabel('Open').nth(1).click();
    await page.getByRole('option', { name: 'East-North' }).click();
    await page.getByRole('spinbutton').click();
    await page.getByRole('spinbutton').fill('060');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Withdrawing to Planting Site!');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Withdraw', exact: true }).click();
    await expect(page.getByText('One or more batches are now')).toBeVisible();
    await page.getByRole('button', { name: 'Got It!' }).click();
    await expect(page.getByText('1 batch for a total of 60')).toBeVisible();
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('cell', { name: 'Withdrawal - Out Plant' }).nth(0)).toBeVisible();
    await page.getByRole('button', { name: 'Withdrawals' }).click();
    await expect(page.getByRole('cell', { name: 'Planting Site' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '60' })).toBeVisible();
    await page.getByRole('link', { name: '60' }).click();
    await expect(page.getByText('Destination:Planting Site')).toBeVisible();
    await expect(page.getByText('Subzone:East-North')).toBeVisible();
    await expect(page.locator('#row1-purpose')).toContainText('Outplant');
    await expect(page.locator('#row1-facility_name')).toContainText('My New Nursery-');
    await expect(page.locator('#row1-destinationName')).toContainText('Planting Site');
    await expect(page.locator('#row1-plantingSubzoneNames')).toContainText('East-North');
    await expect(page.locator('#row1-speciesScientificNames')).toContainText('Coconut');
    await expect(page.locator('#row1-totalWithdrawn')).toContainText('60');
    await page.getByRole('button', { name: 'Plants' }).click();
    await page.getByRole('button', { name: 'Dashboard' }).click();
    await expect(page.getByText('60 Plants')).toBeVisible();
    await expect(page.getByText('1 Species')).toBeVisible();
    await page.getByText('Total Plants and Species').click();
    await page.mouse.wheel(0, 2000);

    await page.waitForTimeout(2000); //Wait for map to load

    await page.mouse.wheel(0, 2000);

    await page.waitForTimeout(2000); //Wait for map to load
    await page.getByLabel('Map', { exact: true }).click({
      position: {
        x: 562,
        y: 245,
      },
    });
    await expect(page.getByRole('cell', { name: '60 Plants' })).toBeVisible();
    await page.getByLabel('Close popup').click();

    await page.getByRole('button', { name: 'Withdrawals' }).click();
    await page.getByText('Map').click();
    await page.waitForTimeout(2000); //Wait for map to load
    await page.getByLabel('Map', { exact: true }).click({
      position: {
        x: 687,
        y: 276,
      },
    });

    await expect(page.getByText('60 Seedlings Sent')).toBeVisible();
    await expect(page.getByText('Coconut')).toBeVisible();
    await page.getByRole('link', { name: 'See Withdrawal History' }).click();
    await expect(page.getByText('Destination:Planting Site')).toBeVisible();
    await expect(page.getByText('Subzone:East-North')).toBeVisible();
  });
}

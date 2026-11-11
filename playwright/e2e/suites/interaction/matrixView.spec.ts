import { Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { waitFor } from '../../utils/utils';

const APPLICATION_DEAL = 'COL_Terraformation (staging)';
const PHASE_0_DEAL = 'Phase 0 Project Deal';
const PHASE_1_DEAL = 'Phase 1 Project Deal';
// The project profile spec renames this deal, so match either name.
const PHASE_2_DEAL = /^Phase 2 Project Deal/;

const openMatrixView = async (page: Page) => {
  await page.getByRole('link', { name: 'Accelerator Console' }).click();
  await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toBeVisible();
};

const selectView = async (page: Page, optionId: string) => {
  await page.locator('#current-view').click();
  await page.locator(`#${optionId}`).click();
};

const addColumns = async (page: Page, columnNames: string[]) => {
  await page.locator('#manageColumns').click();
  await expect(page.locator('.dialog-box')).toBeVisible();
  for (const columnName of columnNames) {
    await page.locator('.dialog-box').getByLabel(columnName, { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.locator('.dialog-box')).not.toBeVisible();
};

const dataRows = (page: Page) => page.locator('tbody tr');

const expectDealNames = async (page: Page, dealNames: (string | RegExp)[]) => {
  await expect(dataRows(page).locator('td:first-child')).toHaveText(dealNames);
};

const getCell = async (page: Page, dealName: string, columnName: string) => {
  const headers = await page.getByRole('columnheader').allTextContents();
  const columnIndex = headers.findIndex((header) => header.replace(/\d+$/, '') === columnName);
  expect(columnIndex).toBeGreaterThanOrEqual(0);
  return dataRows(page)
    .filter({ has: page.getByRole('cell', { name: dealName, exact: true }) })
    .getByRole('cell')
    .nth(columnIndex);
};

const editTextCell = async (page: Page, dealName: string, columnName: string, value: string) => {
  const cell = await getCell(page, dealName, columnName);
  await cell.dblclick();
  await cell.locator('input').fill(value);
  await cell.locator('input').press('Enter');
  await expect(cell).toHaveText(value);
};

const setMultiSelectOptions = async (
  page: Page,
  dealName: string,
  columnName: string,
  allOptions: string[],
  selectedOptions: string[]
) => {
  const cell = await getCell(page, dealName, columnName);
  await cell.dblclick();
  await cell.locator('div').first().click();
  for (const option of allOptions) {
    const optionRow = page.getByText(option, { exact: true }).last();
    if ((await optionRow.getByRole('checkbox').isChecked()) !== selectedOptions.includes(option)) {
      await optionRow.click();
    }
  }
  await page
    .getByRole('paragraph')
    .filter({ hasText: /^Projects$/ })
    .click();
  return cell;
};

test.describe('MatrixViewTests', () => {
  test.beforeEach(async ({ page, context, baseURL }, testInfo) => {
    await changeToSuperAdmin(context, baseURL);
    await page.goto('/');
    await waitFor(page, '#acceleratorConsoleButton');
  });

  test('Matrix view render', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click({ delay: 50 });
    await page.waitForTimeout(1000); //Wait for table to load
    await page.locator('#current-view').click();
    await page.locator('#default').click();

    await expect(page.getByLabel('Show/Hide filters')).toBeVisible();
    await expect(page.locator('#manageColumns')).toBeVisible();
    await expect(page.getByLabel('Toggle density')).toBeVisible();
    await expect(page.getByLabel('Toggle full screen')).toBeVisible();

    // table column headers
    await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phase' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Eligible Land' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Project Lead' })).toBeVisible();

    // table row values
    await expect(page.getByRole('cell', { name: 'COL_Terraformation (staging)' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Colombia' })).toBeVisible();

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();

    // variables
    await expect(page.locator('label').filter({ hasText: 'Certification' })).toBeVisible();
    await expect(page.getByText('TEST Number of native species')).toBeVisible();

    //selected columns
    await expect(page.locator('li').filter({ hasText: 'Deal Name' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Phase' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Eligible Land' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Country' }).nth(1)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Project Lead' }).nth(1)).toBeVisible();

    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(5);
  });

  test('Add column to matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    await page.getByLabel('Certification').click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.getByRole('columnheader', { name: 'Certification' })).toBeVisible();
    const columnHeaders = page.getByRole('columnheader');
    await expect(columnHeaders).toHaveCount(6);
  });

  test('Column reordering and reset in matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    // Get initial column order
    const initialHeaders = await page.getByRole('columnheader').allTextContents();

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    const selectedColumnsList = page.locator('.dialog-box').getByText('Selected Columns').locator('..').locator('ul');
    const firstColumn = selectedColumnsList.locator('li').nth(1);
    const secondColumn = selectedColumnsList.locator('li').nth(2);
    await firstColumn.dragTo(secondColumn);
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const reorderedHeaders = await page.getByRole('columnheader').allTextContents();
    expect(reorderedHeaders).not.toEqual(initialHeaders);

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    // Reset order
    await page.getByRole('button', { name: 'Reset Order' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);

    // Check that the column order has been reset to original
    const resetHeaders = await page.getByRole('columnheader').allTextContents();
    expect(resetHeaders).toEqual(initialHeaders);
  });

  test('Add multiple columns and reset columns in matrix view', async ({ page }, testInfo) => {
    await page.getByRole('link', { name: 'Accelerator Console' }).click();
    await page.waitForTimeout(1000); //Wait for table to load

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();

    // Add three columns
    await page.locator('input[type="checkbox"]').nth(6).click();
    await page.locator('input[type="checkbox"]').nth(7).click();
    await page.locator('input[type="checkbox"]').nth(8).click();

    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const expandedColumnHeaders = page.getByRole('columnheader');
    await expect(expandedColumnHeaders).toHaveCount(8);

    await page.locator('#manageColumns').click();
    await expect(page.locator('.dialog-box')).toBeVisible();
    // Reset columns
    await page.getByRole('button', { name: 'Reset Columns' }).click();
    await page.getByRole('button', { name: 'Apply' }).click();
    await expect(page.locator('.dialog-box')).not.toBeVisible();
    await page.waitForTimeout(500);
    const resetColumnHeaders = page.getByRole('columnheader');
    await expect(resetColumnHeaders).toHaveCount(5);
    await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phase' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Eligible Land' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Country' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Project Lead' })).toBeVisible();
  });

  test('Current view presets filter projects', async ({ page }) => {
    await openMatrixView(page);
    await expectDealNames(page, [PHASE_0_DEAL, PHASE_1_DEAL, PHASE_2_DEAL]);

    await selectView(page, 'applicants');
    await expect(page.getByText('No records to display')).toBeVisible();

    await selectView(page, 'default');
    await expectDealNames(page, [APPLICATION_DEAL, PHASE_0_DEAL, PHASE_1_DEAL, PHASE_2_DEAL]);
  });

  test('Deal name links to the project and stays pinned', async ({ page }) => {
    await openMatrixView(page);
    await expect(page.getByRole('columnheader', { name: 'Deal Name' })).toHaveAttribute('data-pinned', 'true');

    await page.getByRole('link', { name: PHASE_1_DEAL }).click();
    await expect(page).toHaveURL(/\/accelerator\/projects\/3$/);
  });

  test('Search filters projects and persists after reload', async ({ page }) => {
    await openMatrixView(page);
    await page.getByPlaceholder('Search').fill('Phase 1');
    await expectDealNames(page, [PHASE_1_DEAL]);

    await page.reload();
    await expect(page.getByPlaceholder('Search')).toHaveValue('Phase 1');
    await expectDealNames(page, [PHASE_1_DEAL]);

    await page.getByPlaceholder('Search').clear();
    await expectDealNames(page, [PHASE_0_DEAL, PHASE_1_DEAL, PHASE_2_DEAL]);
  });

  test('Column filters persist after reload', async ({ page }) => {
    await openMatrixView(page);
    await page.getByLabel('Show/Hide filters').click();
    await page.getByPlaceholder('Filter by Phase').fill('Feasibility');
    await expectDealNames(page, [PHASE_1_DEAL]);

    await page.reload();
    await expectDealNames(page, [PHASE_1_DEAL]);
  });

  test('Saved filters on hidden columns are ignored', async ({ page }) => {
    await openMatrixView(page);
    await page.evaluate(() =>
      localStorage.setItem('matrixView_columnFilters', JSON.stringify([{ id: '1117', value: 'No match' }]))
    );

    await page.reload();
    await expectDealNames(page, [PHASE_0_DEAL, PHASE_1_DEAL, PHASE_2_DEAL]);
  });

  test('Sorting persists after reload', async ({ page }) => {
    await openMatrixView(page);
    const dealNameHeader = page.getByRole('columnheader', { name: 'Deal Name' });
    await dealNameHeader.getByText('Deal Name').click();
    await dealNameHeader.getByText('Deal Name').click();
    await expectDealNames(page, [PHASE_2_DEAL, PHASE_1_DEAL, PHASE_0_DEAL]);

    await page.reload();
    await expectDealNames(page, [PHASE_2_DEAL, PHASE_1_DEAL, PHASE_0_DEAL]);
  });

  test('Added columns persist after reload', async ({ page }) => {
    await openMatrixView(page);
    await addColumns(page, ['Slack Link']);
    await expect(await getCell(page, PHASE_0_DEAL, 'Slack Link')).toHaveText('https://example.com/slack');

    await page.reload();
    await expect(page.getByRole('columnheader', { name: 'Slack Link' })).toBeVisible();
    await expect(await getCell(page, PHASE_0_DEAL, 'Slack Link')).toHaveText('https://example.com/slack');
  });

  test('Edit text, number, and link values', async ({ page }) => {
    const plantingDensity = 'Planting Density: Native Forest (trees per ha)';
    await openMatrixView(page);
    await selectView(page, 'default');
    await addColumns(page, ['TEST Organization Name', plantingDensity, 'Slack Link']);

    await editTextCell(page, APPLICATION_DEAL, 'TEST Organization Name', 'E2E Organization');
    await editTextCell(page, APPLICATION_DEAL, plantingDensity, '600');
    await editTextCell(page, PHASE_0_DEAL, 'Slack Link', 'https://example.com/slack-e2e');

    await page.reload();
    await expect(page.getByRole('columnheader', { name: 'TEST Organization Name' })).toBeVisible();
    await expect(await getCell(page, APPLICATION_DEAL, 'TEST Organization Name')).toHaveText('E2E Organization');
    await expect(await getCell(page, APPLICATION_DEAL, plantingDensity)).toHaveText('600');
    await expect(await getCell(page, PHASE_0_DEAL, 'Slack Link')).toHaveText('https://example.com/slack-e2e');

    await editTextCell(page, APPLICATION_DEAL, plantingDensity, '500');
    await editTextCell(page, PHASE_0_DEAL, 'Slack Link', 'https://example.com/slack');
  });

  test('Edit single and multiple select values', async ({ page }) => {
    const singleSelect = 'TEST Do they prep land';
    const multiSelect = 'TEST Reason to use non-native species';
    const allMultiSelectOptions = ['agroforestry timber', 'sustainable timber', 'marketable product'];
    const multiSelectOptions = ['agroforestry timber', 'marketable product'];
    await openMatrixView(page);
    await selectView(page, 'default');
    await addColumns(page, [singleSelect, multiSelect]);

    const singleSelectCell = await getCell(page, APPLICATION_DEAL, singleSelect);
    await singleSelectCell.dblclick();
    await singleSelectCell.getByRole('combobox').click();
    await page.getByRole('option', { name: 'maybe' }).click();
    await singleSelectCell.getByRole('combobox').press('Enter');
    await expect(singleSelectCell).toHaveText('maybe');

    const multiSelectCell = await setMultiSelectOptions(
      page,
      APPLICATION_DEAL,
      multiSelect,
      allMultiSelectOptions,
      multiSelectOptions
    );
    await expect(multiSelectCell).toHaveText(multiSelectOptions.join(', '));

    await page.reload();
    await expect(page.getByRole('columnheader', { name: singleSelect })).toBeVisible();
    await expect(await getCell(page, APPLICATION_DEAL, singleSelect)).toHaveText('maybe');
    await expect(await getCell(page, APPLICATION_DEAL, multiSelect)).toHaveText(multiSelectOptions.join(', '));

    await setMultiSelectOptions(page, APPLICATION_DEAL, multiSelect, allMultiSelectOptions, []);
    await expect(await getCell(page, APPLICATION_DEAL, multiSelect)).toHaveText('');
  });
});

import { APIRequestContext, Locator, Page, expect, test } from '@playwright/test';

import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, openNavItem, selectOrg, waitFor } from '../../utils/utils';

const ORGANIZATION_ID = 1;
const OTHER_ORGANIZATION_ID = 2;
const SEED_BANK_ID = 100;
const TABLE_NAME = 'accessions-by-species';
const SAVED_VIEWS_URL = '/api/v1/users/me/savedTableViews';
const PRESET_NAME = 'Include species with all accessions used up';
const SEARCHED_SPECIES = 'Kousa Dogwood';
const OTHER_SPECIES = 'Other Dogwood';
const ALL_COLUMNS = 'Columns: Species, Common Name, Project, Total Seeds';
const NO_FILTERS = 'Filters: None';
const SORT_ASCENDING = 'Sort: Species ↑';
const SORT_DESCENDING = 'Sort: Species ↓';

type SavedView = { id: number; name: string };

const listSavedViews = async (request: APIRequestContext, organizationId: number): Promise<SavedView[]> => {
  const response = await request.get(SAVED_VIEWS_URL, { params: { organizationId, tableName: TABLE_NAME } });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).views;
};

const deleteAllSavedViews = async (request: APIRequestContext) => {
  for (const organizationId of [ORGANIZATION_ID, OTHER_ORGANIZATION_ID]) {
    for (const view of await listSavedViews(request, organizationId)) {
      expect((await request.delete(`${SAVED_VIEWS_URL}/${view.id}`)).ok()).toBeTruthy();
    }
  }
};

const createUsedUpSpecies = async (request: APIRequestContext) => {
  const scientificName = `Used Up Species ${Date.now()}`;
  const speciesResponse = await request.post('/api/v1/species', {
    data: { organizationId: ORGANIZATION_ID, scientificName },
  });
  expect(speciesResponse.ok()).toBeTruthy();
  const speciesId = (await speciesResponse.json()).id;

  const accessionResponse = await request.post('/api/v2/seedbank/accessions', {
    data: { facilityId: SEED_BANK_ID, speciesId, state: 'Awaiting Check-In' },
  });
  expect(accessionResponse.ok()).toBeTruthy();
  const accessionId = (await accessionResponse.json()).accession.id;

  const usedUpResponse = await request.put(`/api/v2/seedbank/accessions/${accessionId}`, {
    data: {
      facilityId: SEED_BANK_ID,
      remainingQuantity: { quantity: 0, units: 'Seeds' },
      speciesId,
      state: 'Used Up',
    },
  });
  expect(usedUpResponse.ok()).toBeTruthy();

  return scientificName;
};

const currentView = (page: Page) => page.locator('#current-view');
const saveViewButton = (page: Page) => page.locator('#current-view-save-button');
const viewOption = (page: Page, name: string) =>
  page.getByRole('option').filter({ has: page.getByText(name, exactOptions) });
const speciesCell = (page: Page, name: string) => page.locator('tbody').getByRole('link', { name, ...exactOptions });

const expectCurrentView = async (page: Page, name: string, modified = false) => {
  await expect(currentView(page)).toHaveText(modified ? `${name}(modified)` : name);
  if (modified) {
    await expect(saveViewButton(page)).toBeVisible();
  } else {
    await expect(saveViewButton(page)).toBeHidden();
  }
};

const openViewMenu = async (page: Page) => {
  await currentView(page).click();
  await expect(page.getByRole('listbox')).toBeVisible();
};

const selectView = async (page: Page, name: string) => {
  await openViewMenu(page);
  await viewOption(page, name).click();
  await expect(page.getByRole('listbox')).toBeHidden();
};

const goToAccessionsBySpecies = async (page: Page) => {
  await openNavItem(page, 'Seeds', 'Accessions');
  await page.getByRole('tab', { name: 'By Species', ...exactOptions }).click();
  await expect(currentView(page)).toBeVisible();
  await expect(speciesCell(page, SEARCHED_SPECIES)).toBeVisible();
};

const reloadPage = async (page: Page) => {
  await page.reload();
  await expect(currentView(page)).toBeVisible();
};

const search = async (page: Page, text: string) => {
  const searchField = page.getByPlaceholder('Search');
  if (!(await searchField.isVisible())) {
    await page.getByLabel('Show/Hide search').click();
  }
  await searchField.fill(text);
};

const sortBySpecies = async (page: Page) => {
  await page.getByRole('columnheader', { name: 'Species' }).getByText('Species', exactOptions).click();
  await expect(page.getByRole('columnheader', { name: 'Species' })).toHaveAttribute('aria-sort', 'descending');
};

const expectDefaultSort = async (page: Page) =>
  expect(page.getByRole('columnheader', { name: 'Species' })).toHaveAttribute('aria-sort', 'ascending');

const toggleColumn = async (page: Page, name: string) => {
  await page.getByLabel('Show/Hide columns').click();
  await page.getByRole('menu').getByText(name, exactOptions).click();
  await page.keyboard.press('Escape');
};

const hideColumn = async (page: Page, name: string) => {
  await toggleColumn(page, name);
  await expect(page.getByRole('columnheader', { name })).toBeHidden();
};

const showColumn = async (page: Page, name: string) => {
  await toggleColumn(page, name);
  await expect(page.getByRole('columnheader', { name })).toBeVisible();
};

const hideCommonNameColumn = (page: Page) => hideColumn(page, 'Common Name');

const filterColumn = async (page: Page, column: string, text: string) => {
  const filterField = page.getByPlaceholder(`Filter by ${column}`);
  if (!(await filterField.isVisible())) {
    await page.getByLabel('Show/Hide filters').click();
  }
  await filterField.fill(text);
};

const openSaveViewDialog = async (page: Page) => {
  await saveViewButton(page).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
};

const expectSaveViewSummary = async (dialog: Locator, expectedSummary: string[]) => {
  await expect(dialog.getByText('This view saves', exactOptions)).toBeVisible();
  await expect(dialog.locator('.pill .value')).toHaveText(expectedSummary);
  await expect(dialog.getByText('Only you can see views you save.', exactOptions)).toBeVisible();
};

const expectViewDescription = async (page: Page, name: string, description: string) => {
  await openViewMenu(page);
  await expect(viewOption(page, name).getByText(description, exactOptions)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toBeHidden();
};

const saveCurrentView = async (page: Page, name: string, expectedSummary: string[]) => {
  const dialog = await openSaveViewDialog(page);
  await expectSaveViewSummary(dialog, expectedSummary);
  await expect(dialog.locator('#saveView')).toBeDisabled();
  await dialog.locator('#save-view-name').getByRole('textbox').fill(name);
  await dialog.locator('#saveView').click();
  await expect(page.getByText(`${name} saved to My views`)).toBeVisible();
  await expect(dialog).toBeHidden();
};

test.describe('SavedTableViewsTests', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
    await deleteAllSavedViews(page.request);
    await page.goto('/');
    await waitFor(page, '#home');
    await selectOrg(page, 'Terraformation (staging)');
  });

  test('Changing the table marks the view modified and selecting a view resets it', async ({ page }) => {
    await goToAccessionsBySpecies(page);
    await expectCurrentView(page, 'Default');

    await hideCommonNameColumn(page);
    await expectCurrentView(page, 'Default', true);

    await reloadPage(page);
    await expectCurrentView(page, 'Default', true);
    await expect(page.getByRole('columnheader', { name: 'Common Name' })).toBeHidden();

    await search(page, SEARCHED_SPECIES);
    await sortBySpecies(page);
    await expect(speciesCell(page, OTHER_SPECIES)).toBeHidden();
    await expectCurrentView(page, 'Default', true);

    await selectView(page, 'Default');
    await expectCurrentView(page, 'Default');
    await expect(page.getByRole('columnheader', { name: 'Common Name' })).toBeVisible();
    await expect(page.getByPlaceholder('Search')).toHaveValue('');
    await expectDefaultSort(page);
    await expect(speciesCell(page, OTHER_SPECIES)).toBeVisible();
  });

  test('Create a view and switch between it and Default', async ({ page }) => {
    const viewName = 'Kousa sorted';
    await goToAccessionsBySpecies(page);

    await search(page, SEARCHED_SPECIES);
    await sortBySpecies(page);
    await saveCurrentView(page, viewName, [`Search: "${SEARCHED_SPECIES}"`, SORT_DESCENDING, ALL_COLUMNS]);
    await expectCurrentView(page, viewName);
    await expectViewDescription(page, viewName, '1 filter. Sorted by species');

    await selectView(page, 'Default');
    await expectCurrentView(page, 'Default');
    await expect(speciesCell(page, OTHER_SPECIES)).toBeVisible();
    await expectDefaultSort(page);

    await selectView(page, viewName);
    await expectCurrentView(page, viewName);
    await expect(page.getByPlaceholder('Search')).toHaveValue(SEARCHED_SPECIES);
    await expect(speciesCell(page, OTHER_SPECIES)).toBeHidden();

    await reloadPage(page);
    await expectCurrentView(page, viewName);
    await expect(speciesCell(page, OTHER_SPECIES)).toBeHidden();
    await expect(page.getByRole('columnheader', { name: 'Species' })).toHaveAttribute('aria-sort', 'descending');

    await hideCommonNameColumn(page);
    await expectCurrentView(page, viewName, true);
    await selectView(page, viewName);
    await expectCurrentView(page, viewName);
    await expect(page.getByRole('columnheader', { name: 'Common Name' })).toBeVisible();
  });

  test('Save view requires a unique name', async ({ page }) => {
    const viewName = 'Sorted';
    await goToAccessionsBySpecies(page);

    await sortBySpecies(page);
    await saveCurrentView(page, viewName, [SORT_DESCENDING, NO_FILTERS, ALL_COLUMNS]);

    await search(page, SEARCHED_SPECIES);
    const dialog = await openSaveViewDialog(page);
    await expectSaveViewSummary(dialog, [`Search: "${SEARCHED_SPECIES}"`, SORT_DESCENDING, ALL_COLUMNS]);
    const nameField = dialog.locator('#save-view-name').getByRole('textbox');
    await nameField.fill(viewName);
    await expect(dialog).toContainText('A view with this name already exists.');
    await expect(dialog.locator('#saveView')).toBeDisabled();

    await nameField.fill('');
    await expect(dialog).toContainText('Enter a name for this view.');
    await expect(dialog.locator('#saveView')).toBeDisabled();

    await dialog.locator('#cancelSaveView').click();
    await expect(dialog).toBeHidden();
    await expectCurrentView(page, viewName, true);
  });

  test('Summary lists column filters, search, sort and visible columns', async ({ page }) => {
    const viewName = 'Filtered';
    await goToAccessionsBySpecies(page);

    await filterColumn(page, 'Common Name', 'Kousa');
    await search(page, 'Dogwood');
    await hideColumn(page, 'Project');
    await showColumn(page, 'In Storage');
    await sortBySpecies(page);
    await expect(speciesCell(page, SEARCHED_SPECIES)).toBeVisible();
    await expect(speciesCell(page, OTHER_SPECIES)).toBeHidden();

    await saveCurrentView(page, viewName, [
      'Common Name: Kousa',
      'Search: "Dogwood"',
      SORT_DESCENDING,
      'Columns: Species, Common Name, In Storage, Total Seeds',
    ]);
    await expectCurrentView(page, viewName);
    await expectViewDescription(page, viewName, '2 filters. Sorted by species');

    await reloadPage(page);
    await expectCurrentView(page, viewName);
    await expectViewDescription(page, viewName, '2 filters. Sorted by species');
  });

  test('Summary of a view without filters or sort', async ({ page }) => {
    const viewName = 'Unsorted';
    await goToAccessionsBySpecies(page);

    await hideCommonNameColumn(page);
    await sortBySpecies(page);
    await page.getByRole('columnheader', { name: 'Species' }).getByText('Species', exactOptions).click();
    await expect(page.getByRole('columnheader', { name: 'Species' })).toHaveAttribute('aria-sort', 'none');

    await saveCurrentView(page, viewName, [NO_FILTERS, 'Columns: Species, Project, Total Seeds']);
    await expectCurrentView(page, viewName);
    await expectViewDescription(page, viewName, 'No filters');
  });

  test('Rename a view', async ({ page }) => {
    await goToAccessionsBySpecies(page);
    await sortBySpecies(page);
    await saveCurrentView(page, 'Original name', [SORT_DESCENDING, NO_FILTERS, ALL_COLUMNS]);

    await openViewMenu(page);
    await viewOption(page, 'Original name').getByRole('button', { name: 'Edit' }).click();
    const nameField = page.getByRole('listbox').getByRole('textbox', { name: 'View name' });
    await nameField.fill('Renamed view');
    await nameField.press('Enter');
    await expect(page.getByText('Renamed view updated')).toBeVisible();
    await expect(viewOption(page, 'Renamed view')).toBeVisible();
    await expect(viewOption(page, 'Original name')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expectCurrentView(page, 'Renamed view');

    await reloadPage(page);
    await expectCurrentView(page, 'Renamed view');
    await openViewMenu(page);
    await expect(viewOption(page, 'Original name')).toHaveCount(0);
  });

  test('Delete the current view', async ({ page }) => {
    const viewName = 'View to delete';
    await goToAccessionsBySpecies(page);
    await search(page, SEARCHED_SPECIES);
    await saveCurrentView(page, viewName, [`Search: "${SEARCHED_SPECIES}"`, SORT_ASCENDING, ALL_COLUMNS]);
    await expectCurrentView(page, viewName);

    await openViewMenu(page);
    await viewOption(page, viewName).getByRole('button', { name: 'Delete' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`"${viewName}" will be removed from your saved views.`);
    await dialog.locator('#confirmDeleteView').click();
    await expect(page.getByText(`${viewName} deleted`)).toBeVisible();

    await expectCurrentView(page, 'Default');
    await expect(speciesCell(page, OTHER_SPECIES)).toBeVisible();

    await reloadPage(page);
    await expectCurrentView(page, 'Default');
    await openViewMenu(page);
    await expect(viewOption(page, viewName)).toHaveCount(0);
  });

  test('Preset view shows used-up species and can be the base of a saved view', async ({ page }) => {
    const usedUpSpecies = await createUsedUpSpecies(page.request);
    const viewName = 'Used up sorted';
    await goToAccessionsBySpecies(page);
    await expect(speciesCell(page, usedUpSpecies)).toBeHidden();

    await openViewMenu(page);
    await expect(viewOption(page, PRESET_NAME).getByRole('button')).toHaveCount(0);
    await viewOption(page, PRESET_NAME).click();
    await expectCurrentView(page, PRESET_NAME);
    await expect(speciesCell(page, usedUpSpecies)).toBeVisible();

    await reloadPage(page);
    await expectCurrentView(page, PRESET_NAME);
    await expect(speciesCell(page, usedUpSpecies)).toBeVisible();

    await sortBySpecies(page);
    await expectCurrentView(page, PRESET_NAME, true);
    await saveCurrentView(page, viewName, [`Base View: ${PRESET_NAME}`, SORT_DESCENDING, NO_FILTERS, ALL_COLUMNS]);
    await expectCurrentView(page, viewName);
    await expectViewDescription(page, viewName, `${PRESET_NAME}. Sorted by species`);

    await openViewMenu(page);
    await viewOption(page, 'Default').click();
    await expectCurrentView(page, 'Default');
    await expect(speciesCell(page, usedUpSpecies)).toBeHidden();
    await expectDefaultSort(page);

    await selectView(page, viewName);
    await expectCurrentView(page, viewName);
    await expect(speciesCell(page, usedUpSpecies)).toBeVisible();

    await reloadPage(page);
    await expectCurrentView(page, viewName);
    await expect(speciesCell(page, usedUpSpecies)).toBeVisible();
  });

  test('Views are saved separately for each organization', async ({ page }) => {
    const otherOrgViewName = 'Other org view';
    const response = await page.request.post(SAVED_VIEWS_URL, {
      data: { name: otherOrgViewName, organizationId: OTHER_ORGANIZATION_ID, settings: {}, tableName: TABLE_NAME },
    });
    expect(response.ok()).toBeTruthy();

    await goToAccessionsBySpecies(page);
    await sortBySpecies(page);
    await saveCurrentView(page, 'This org view', [SORT_DESCENDING, NO_FILTERS, ALL_COLUMNS]);

    await openViewMenu(page);
    await expect(viewOption(page, 'This org view')).toBeVisible();
    await expect(viewOption(page, otherOrgViewName)).toHaveCount(0);
    await page.keyboard.press('Escape');

    expect((await listSavedViews(page.request, OTHER_ORGANIZATION_ID)).map((view) => view.name)).toEqual([
      otherOrgViewName,
    ]);
    expect((await listSavedViews(page.request, ORGANIZATION_ID)).map((view) => view.name)).toEqual(['This org view']);
  });
});

import { Locator, Page, expect, test } from '@playwright/test';

import { SeededOrganization, deleteOrganization, seedOrganization } from '../../utils/orgSeedUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, waitFor } from '../../utils/utils';

const ORG_TARGET_KEY = -1;

const SET_LOCATION_BANNER =
  'To check which species are native, introduced, or invasive, run the Species Check. You will need to set the location of your projects.';

const columnHeader = (page: Page, header: string): Locator =>
  page.getByRole('columnheader', { name: new RegExp(`^${header}\\b`) });

const openSpeciesList = async (page: Page, organization: SeededOrganization) => {
  await page.goto(`/species?organizationId=${organization.id}`);
  await waitFor(page, '#home');
  await expect(page.getByRole('heading', { name: 'Species', ...exactOptions })).toBeVisible();
};

const openSpeciesCheck = async (page: Page): Promise<Locator> => {
  await page.getByRole('button', { name: 'Run Species Check' }).click();
  const dialog = page.getByRole('dialog', { name: 'Species Check' });
  await expect(dialog).toBeVisible();
  return dialog;
};

const selectAutocomplete = async (page: Page, id: string, value: string) => {
  const input = page.locator(`#${id}`);
  await input.click();
  await input.fill(value);
  await page.getByRole('option', { name: value, ...exactOptions }).click();
};

const setLocation = async (page: Page, targetKey: number, country: string, botanicalCountry: string) => {
  await selectAutocomplete(page, `country-${targetKey}`, country);
  await selectAutocomplete(page, `botanical-country-${targetKey}`, botanicalCountry);
};

test.describe('SpeciesCheckTests', () => {
  let organization: SeededOrganization | undefined;

  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test.afterEach(async ({ page }) => {
    if (organization) {
      await deleteOrganization(page.request, organization.id);
      organization = undefined;
    }
  });

  test('Species Check in an organization with no projects uses the organization location', async ({ page }) => {
    organization = await seedOrganization(page.request, {
      name: 'E2E No Projects',
      species: [{ scientificName: 'Testia alpha' }, { scientificName: 'Testia beta' }],
    });

    await openSpeciesList(page, organization);

    await expect(columnHeader(page, 'Project')).toBeHidden();

    await expect(page.getByText(SET_LOCATION_BANNER)).toBeVisible();
    const dialog = await openSpeciesCheck(page);

    await expect(dialog.getByText('Select a Country and Botanical Country to set the location.')).toBeVisible();
    await expect(dialog.getByText(organization.name, exactOptions)).toBeVisible();

    const setLocationButton = dialog.getByRole('button', { name: 'Set Location', ...exactOptions });
    await expect(setLocationButton).toBeDisabled();
    await setLocation(page, ORG_TARGET_KEY, 'Guatemala', 'Guatemala');
    await expect(setLocationButton).toBeEnabled();
    await setLocationButton.click();

    await expect(dialog.getByText('2 species checked')).toBeVisible();
    await expect(dialog.getByText('Country Guatemala', exactOptions)).toBeVisible();
    await expect(dialog.getByText('Botanical Country Guatemala', exactOptions)).toBeVisible();
    await dialog.getByRole('button', { name: 'Next' }).click();

    await expect(dialog.getByText('Testia alpha')).toBeVisible();
    await expect(dialog.getByText('Testia beta')).toBeVisible();
    await dialog.getByRole('button', { name: 'Done' }).click();

    await expect(dialog.getByText('Species Check complete')).toBeVisible();
    await expect(dialog.getByText('2 suggested statuses applied')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();

    await expect(columnHeader(page, 'Native Status')).toBeVisible();
    await expect(page.getByText(SET_LOCATION_BANNER)).toBeHidden();
  });

  test('Species Check in an organization with one project uses the organization location', async ({ page }) => {
    organization = await seedOrganization(page.request, {
      name: 'E2E One Project',
      projectNames: ['Solo Project'],
      species: [{ scientificName: 'Testia alpha' }, { scientificName: 'Testia beta' }],
    });

    await openSpeciesList(page, organization);

    await expect(columnHeader(page, 'Project')).toBeHidden();

    const dialog = await openSpeciesCheck(page);

    await expect(dialog.getByText('Select a Country and Botanical Country to set the location.')).toBeVisible();
    await expect(dialog.getByText(organization.name, exactOptions)).toBeVisible();
    await expect(dialog.getByText('Solo Project', exactOptions)).toBeHidden();

    const setLocationButton = dialog.getByRole('button', { name: 'Set Location', ...exactOptions });
    await expect(setLocationButton).toBeDisabled();
    await setLocation(page, ORG_TARGET_KEY, 'Guatemala', 'Guatemala');
    await setLocationButton.click();

    await expect(dialog.getByText('2 species checked')).toBeVisible();
    await dialog.getByRole('button', { name: 'Next' }).click();

    await expect(dialog.getByText('Testia alpha')).toBeVisible();
    await expect(dialog.getByText('Testia beta')).toBeVisible();
    await dialog.getByRole('button', { name: 'Done' }).click();

    await expect(dialog.getByText('Species Check complete')).toBeVisible();
    await expect(dialog.getByText('2 suggested statuses applied')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();

    await expect(columnHeader(page, 'Native Status')).toBeVisible();
  });

  test('Species Check in an organization with multiple projects is scoped per project', async ({ page }) => {
    organization = await seedOrganization(page.request, {
      name: 'E2E Many Projects',
      projectNames: ['Alpha Project', 'Beta Project'],
      species: [
        { scientificName: 'Testia alpha', projectIndexes: [0] },
        { scientificName: 'Testia beta', projectIndexes: [1] },
      ],
    });
    const [alpha, beta] = organization.projects;

    await openSpeciesList(page, organization);

    await expect(columnHeader(page, 'Project')).toBeVisible();

    const dialog = await openSpeciesCheck(page);

    await expect(
      dialog.getByText('Select a Country and Botanical Country to set the location of each Project.')
    ).toBeVisible();
    await expect(dialog.getByText(alpha.name, exactOptions)).toBeVisible();
    await expect(dialog.getByText(beta.name, exactOptions)).toBeVisible();
    await expect(dialog.getByText(organization.name, exactOptions)).toBeHidden();

    const setLocationsButton = dialog.getByRole('button', { name: 'Set Locations', ...exactOptions });
    await expect(setLocationsButton).toBeDisabled();
    await setLocation(page, alpha.id, 'Guatemala', 'Guatemala');
    await expect(setLocationsButton).toBeEnabled();
    await setLocationsButton.click();

    await expect(dialog.getByText('1 species checked')).toBeVisible();
    await expect(dialog.getByText(alpha.name, exactOptions)).toBeVisible();
    await expect(dialog.getByText(beta.name, exactOptions)).toBeHidden();
    await dialog.getByRole('button', { name: 'Next' }).click();

    await expect(dialog.getByText('Testia alpha')).toBeVisible();
    await expect(dialog.getByText('Testia beta')).toBeHidden();
    await dialog.getByRole('button', { name: 'Done' }).click();

    await expect(dialog.getByText('Species Check complete')).toBeVisible();
    await expect(dialog.getByText('1 suggested status applied')).toBeVisible();
    await dialog.getByRole('button', { name: 'Close' }).click();

    await expect(columnHeader(page, 'Native Status')).toBeVisible();
  });
});

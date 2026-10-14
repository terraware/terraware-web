import { Locator, Page, expect, test } from '@playwright/test';

import {
  SeededOrganization,
  SeededPlantingSeason,
  SeededPlantingSite,
  deleteOrganization,
  seedNursery,
  seedOrganization,
  seedPlantingSeason,
  seedPlantingSite,
  seedReadyBatch,
  seedSpeciesTarget,
} from '../../utils/orgSeedUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, waitFor } from '../../utils/utils';

const ALPHA_AVAILABLE = 750;
const BETA_AVAILABLE = 100;
const ALPHA_MAIN_TARGET = 1000;
const ALPHA_SECOND_TARGET = 600;
const BETA_MAIN_TARGET = 400;

type Fixture = {
  organization: SeededOrganization;
  mainSite: SeededPlantingSite;
  secondSite: SeededPlantingSite;
  emptySite: SeededPlantingSite;
  mainSeason: SeededPlantingSeason;
  secondSeason: SeededPlantingSeason;
};

const seedFixture = async (page: Page): Promise<Fixture> => {
  const organization = await seedOrganization(page.request, {
    name: 'E2E Inventory Planning',
    species: [{ scientificName: 'Inventoria alpha' }, { scientificName: 'Inventoria beta' }],
  });
  const [alpha, beta] = organization.species;

  const mainSite = await seedPlantingSite(page.request, {
    organizationId: organization.id,
    name: 'Main Site',
    strata: [{ name: 'Stratum A', substrataNames: ['Substratum A1'] }],
  });
  const secondSite = await seedPlantingSite(page.request, {
    organizationId: organization.id,
    name: 'Second Site',
    strata: [{ name: 'Stratum B', substrataNames: ['Substratum B1'] }],
    origin: [36.9, -1.3],
  });

  const emptySite = await seedPlantingSite(page.request, {
    organizationId: organization.id,
    name: 'Empty Site',
    strata: [{ name: 'Stratum C', substrataNames: ['Substratum C1'] }],
    origin: [37.0, -1.3],
  });

  const nurseryId = await seedNursery(page.request, { organizationId: organization.id, name: 'Main Nursery' });
  await seedReadyBatch(page.request, { facilityId: nurseryId, speciesId: alpha.id, readyQuantity: ALPHA_AVAILABLE });
  await seedReadyBatch(page.request, { facilityId: nurseryId, speciesId: beta.id, readyQuantity: BETA_AVAILABLE });

  const mainSeason = await seedPlantingSeason(page.request, {
    plantingSiteId: mainSite.id,
    name: 'Main Season',
  });
  const secondSeason = await seedPlantingSeason(page.request, {
    plantingSiteId: secondSite.id,
    name: 'Second Season',
  });

  await seedSpeciesTarget(page.request, {
    plantingSeasonId: mainSeason.id,
    speciesId: alpha.id,
    substratumId: mainSite.strata[0].substrata[0].id,
    quantity: ALPHA_MAIN_TARGET,
  });
  await seedSpeciesTarget(page.request, {
    plantingSeasonId: mainSeason.id,
    speciesId: beta.id,
    substratumId: mainSite.strata[0].substrata[0].id,
    quantity: BETA_MAIN_TARGET,
  });
  await seedSpeciesTarget(page.request, {
    plantingSeasonId: secondSeason.id,
    speciesId: alpha.id,
    substratumId: secondSite.strata[0].substrata[0].id,
    quantity: ALPHA_SECOND_TARGET,
  });

  return { organization, mainSite, secondSite, emptySite, mainSeason, secondSeason };
};

const openInventoryPlanning = async (page: Page, organization: SeededOrganization) => {
  await page.goto(`/inventory-planning?organizationId=${organization.id}`);
  await waitFor(page, '#home');
  await expect(page.getByText('Allocate inventory for Planting Season species targets.')).toBeVisible();
};

const formatted = (value: number): string => value.toLocaleString('en-US');

const speciesRow = (page: Page, scientificName: string): Locator =>
  page.getByText(scientificName, exactOptions).locator('xpath=../..');

const seasonRow = (page: Page, plantingSiteName: string): Locator =>
  page.getByText(new RegExp(`^${plantingSiteName}\\s+-\\s+`)).locator('xpath=../..');

const filterOption = (page: Page, label: string): Locator =>
  page.locator('li').filter({ hasText: new RegExp(`^${label}$`) });

const selectFilter = async (page: Page, id: string, label: string) => {
  await page.locator(`#${id}`).click();
  await filterOption(page, label).click();
};

test.describe('InventoryPlanningTests', () => {
  let organizationId: number | undefined;

  test.beforeEach(async ({ context, baseURL }) => {
    await changeToSuperAdmin(context, baseURL);
  });

  test.afterEach(async ({ page }) => {
    if (organizationId !== undefined) {
      await deleteOrganization(page.request, organizationId);
      organizationId = undefined;
    }
  });

  test('Totals each species across its planting seasons and expands to show them', async ({ page }) => {
    const { organization, mainSeason, secondSeason } = await seedFixture(page);
    organizationId = organization.id;

    await openInventoryPlanning(page, organization);

    const alphaRow = speciesRow(page, 'Inventoria alpha');
    await expect(alphaRow).toContainText(formatted(ALPHA_AVAILABLE));
    await expect(alphaRow).toContainText(formatted(ALPHA_MAIN_TARGET + ALPHA_SECOND_TARGET));
    const betaRow = speciesRow(page, 'Inventoria beta');
    await expect(betaRow).toContainText(formatted(BETA_AVAILABLE));
    await expect(betaRow).toContainText(formatted(BETA_MAIN_TARGET));

    await expect(alphaRow).toContainText('0%');

    await expect(seasonRow(page, 'Main Site')).toBeHidden();
    await alphaRow.click();
    await expect(seasonRow(page, 'Main Site')).toContainText(mainSeason.name);
    await expect(seasonRow(page, 'Main Site')).toContainText(formatted(ALPHA_MAIN_TARGET));
    await expect(seasonRow(page, 'Second Site')).toContainText(secondSeason.name);
    await expect(seasonRow(page, 'Second Site')).toContainText(formatted(ALPHA_SECOND_TARGET));
  });

  test('Allocating inventory to a season updates the totals and is logged', async ({ page }) => {
    const { organization, mainSeason } = await seedFixture(page);
    organizationId = organization.id;
    const alphaId = organization.species[0].id;

    await openInventoryPlanning(page, organization);
    await speciesRow(page, 'Inventoria alpha').click();

    await seasonRow(page, 'Main Site').getByRole('button').click();
    await page.locator(`#alloc-${mainSeason.id}-${alphaId}`).getByRole('spinbutton').fill('800');
    await page.keyboard.press('Enter');

    await expect(speciesRow(page, 'Inventoria alpha')).toContainText('50%');

    await page.getByRole('button', { name: 'Change History' }).click();
    await expect(
      page.getByText(`800 plants of Inventoria alpha allocated to ${mainSeason.name} for Main Site`)
    ).toBeVisible();

    await page.reload();
    await expect(speciesRow(page, 'Inventoria alpha')).toContainText('50%');
  });

  test('Filters narrow the table to a planting site, season and species', async ({ page }) => {
    const { organization, secondSeason } = await seedFixture(page);
    organizationId = organization.id;

    await openInventoryPlanning(page, organization);
    await expect(speciesRow(page, 'Inventoria beta')).toBeVisible();

    await selectFilter(page, 'filter-planting-site', 'Second Site');
    await expect(speciesRow(page, 'Inventoria alpha')).toContainText(formatted(ALPHA_SECOND_TARGET));
    await expect(page.getByText('Inventoria beta', exactOptions)).toBeHidden();

    await page.locator('#filter-planting-season').click();
    await expect(filterOption(page, secondSeason.name)).toBeVisible();
    await expect(filterOption(page, 'Main Season')).toBeHidden();
    await filterOption(page, secondSeason.name).click();

    await page.locator('#filter-species').click();
    await expect(filterOption(page, 'Inventoria alpha')).toBeVisible();
    await expect(filterOption(page, 'Inventoria beta')).toBeHidden();
    await page.keyboard.press('Escape');

    await selectFilter(page, 'filter-planting-site', 'Empty Site');
    await expect(page.getByText('There are no active Planting Seasons for the selected Planting Site.')).toBeVisible();
  });
});

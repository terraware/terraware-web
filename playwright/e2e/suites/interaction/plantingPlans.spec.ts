import { Page, expect, test } from '@playwright/test';

import {
  SeededOrganization,
  SeededPlantingSite,
  deleteOrganization,
  seedOrganization,
  seedPlantingSeason,
  seedPlantingSite,
  seedSiteSpeciesTarget,
} from '../../utils/orgSeedUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, openNavItem, waitFor } from '../../utils/utils';

const PLANTED_INITIAL_DENSITY = 1500;
const PLANTED_TARGET_DENSITY = 2000;
const BARE_INITIAL_DENSITY = 800;

type Fixture = {
  organization: SeededOrganization;
  plantedSite: SeededPlantingSite;
  bareSite: SeededPlantingSite;
};

const seedFixture = async (page: Page): Promise<Fixture> => {
  const organization = await seedOrganization(page.request, {
    name: 'E2E Planting Plans',
    species: [{ scientificName: 'Plantae alpha' }],
  });

  const plantedSite = await seedPlantingSite(page.request, {
    organizationId: organization.id,
    name: 'North Site',
    strata: [
      {
        name: 'Stratum A',
        substrataNames: ['Substratum A1', 'Substratum A2'],
        initialPlantingDensity: PLANTED_INITIAL_DENSITY,
        targetPlantDensity: PLANTED_TARGET_DENSITY,
      },
    ],
  });

  await seedSiteSpeciesTarget(page.request, {
    plantingSiteId: plantedSite.id,
    speciesId: organization.species[0].id,
    stratumIds: [plantedSite.strata[0].id],
    targetPlants: 5000,
  });

  const bareSite = await seedPlantingSite(page.request, {
    organizationId: organization.id,
    name: 'South Site',
    strata: [{ name: 'Stratum B', substrataNames: ['Substratum B1'], initialPlantingDensity: BARE_INITIAL_DENSITY }],
    origin: [36.9, -1.3],
  });

  return { organization, plantedSite, bareSite };
};

const expectPlantingPlansPage = async (page: Page) => {
  await expect(
    page.getByText('Manage planting plans for Planting Sites, including site goals and planting seasons.')
  ).toBeVisible();
};

const openPlantingPlans = async (page: Page, organization: SeededOrganization) => {
  await page.goto(`/?organizationId=${organization.id}`);
  await waitFor(page, '#home');
  await openNavItem(page, 'Plantings', 'Planting Plans');
  await expectPlantingPlansPage(page);
};

const planBox = (page: Page, siteName: string) => page.getByRole('button', { name: new RegExp(siteName) });

const plantsLabel = (site: SeededPlantingSite, density: number): string => {
  const plants = site.strata.reduce((total, stratum) => total + Math.round(stratum.areaHa * density), 0);
  return `${plants.toLocaleString('en-US')} plants`;
};

test.describe('PlantingPlansTests', () => {
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

  test('Lists a plan for every planting site and opens its details', async ({ page }) => {
    const { organization, plantedSite, bareSite } = await seedFixture(page);
    organizationId = organization.id;

    await openPlantingPlans(page, organization);

    const plantedBox = planBox(page, plantedSite.name);
    await expect(plantedBox).toContainText('Stratum A');
    await expect(plantedBox).toContainText('Substratum A1');
    await expect(plantedBox).toContainText('Substratum A2');
    await expect(plantedBox).toContainText(plantsLabel(plantedSite, PLANTED_INITIAL_DENSITY));
    await expect(plantedBox).toContainText('1 species');

    const bareBox = planBox(page, bareSite.name);
    await expect(bareBox).toContainText(plantsLabel(bareSite, BARE_INITIAL_DENSITY));
    await expect(bareBox).toContainText('No species set');

    await bareBox.click();
    await expect(page).toHaveURL(new RegExp(`/planting-plans/${bareSite.id}`));
    await expect(page.getByText('Planting Plan', exactOptions)).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');

    await expect(page.getByText(plantsLabel(bareSite, BARE_INITIAL_DENSITY))).toBeVisible();
    await expect(page.getByText('No plants set')).toBeVisible();
  });

  test('Switches between the overview, site goals and planting seasons segments', async ({ page }) => {
    const { organization, plantedSite } = await seedFixture(page);
    organizationId = organization.id;

    await openPlantingPlans(page, organization);
    await planBox(page, plantedSite.name).click();

    await expect(page.getByText(plantsLabel(plantedSite, PLANTED_INITIAL_DENSITY))).toBeVisible();
    await expect(page.getByText('by initial planting density')).toBeVisible();
    await expect(page.getByText(plantsLabel(plantedSite, PLANTED_TARGET_DENSITY))).toBeVisible();
    await expect(page.getByText('by target plant density')).toBeVisible();
    await expect(page.getByText('1 species', exactOptions)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Planting Season' })).toBeHidden();

    await page.getByRole('tab', { name: 'Site Goals' }).click();
    await expect(page.getByRole('tab', { name: 'Site Goals' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Manage site goals for planting densities and species.')).toBeVisible();
    await expect(page.getByText('Initial Planting Density', exactOptions)).toBeVisible();
    await expect(page.getByText('Target Plant Density', exactOptions)).toBeVisible();
    await expect(page.getByText('Species to Plant', exactOptions)).toBeVisible();
    await expect(page.getByText(organization.species[0].scientificName, exactOptions)).toBeVisible();

    await page.getByRole('tab', { name: 'Planting Seasons' }).click();
    await expect(page.getByText('Manage planting seasons and dates to meet initial planting goals.')).toBeVisible();
    await expect(page.getByText('There are no Planting Seasons.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Planting Season' })).toBeVisible();
  });

  test('Opens a segment directly from the section query parameter and lists planting seasons', async ({ page }) => {
    const { organization, plantedSite } = await seedFixture(page);
    organizationId = organization.id;
    const season = await seedPlantingSeason(page.request, {
      plantingSiteId: plantedSite.id,
      name: 'Long Rains',
    });

    await page.goto(`/planting-plans/${plantedSite.id}?organizationId=${organization.id}&section=plantingSeasons`);
    await waitFor(page, '#home');

    await expect(page.getByRole('tab', { name: 'Planting Seasons' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(season.name, exactOptions)).toBeVisible();
    await expect(page.getByText('There are no Planting Seasons.')).toBeHidden();
  });

  test('Shows an empty state for an organization without planting sites', async ({ page }) => {
    const organization = await seedOrganization(page.request, {
      name: 'E2E No Planting Plans',
      species: [{ scientificName: 'Plantae alpha' }],
    });
    organizationId = organization.id;

    await page.goto(`/planting-plans?organizationId=${organization.id}`);
    await waitFor(page, '#home');
    await expectPlantingPlansPage(page);

    await expect(page.getByText('There are no Planting Plans.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Planting Plans', ...exactOptions })).toBeHidden();
  });
});

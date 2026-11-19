import { APIRequestContext, Locator, Page, expect, test } from '@playwright/test';

import {
  SeededOrganization,
  SeededSpecies,
  deleteOrganization,
  seedNursery,
  seedOrganization,
} from '../../utils/orgSeedUtils';
import { changeToSuperAdmin } from '../../utils/userUtils';
import { exactOptions, openNavItem, waitFor } from '../../utils/utils';

const SEED_BANK_NAME = 'Withdrawals Seed Bank';
const NURSERY_NAME = 'Withdrawals Nursery';
const NURSERY_NOTES = 'Transferred in two crates';
const BULK_NOTES = 'Shipped to the research lab';
const WITHDRAWN_BY = 'Super Admin';

// Two grams per seed, so every quantity below has a whole-number estimate in the other unit.
const SUBSET_WEIGHT_GRAMS = 20;
const SUBSET_COUNT = 10;
const REMAINING_GRAMS = 1000;

const NURSERY_SEEDS = 300;
const NURSERY_ESTIMATED_GRAMS = 600;
const BULK_ALPHA_GRAMS = 40;
const BULK_ALPHA_ESTIMATED_SEEDS = 20;
const BULK_BETA_GRAMS = 60;
const BULK_BETA_ESTIMATED_SEEDS = 30;
const VIABILITY_SEEDS = 25;
const VIABILITY_ESTIMATED_GRAMS = 50;

const JSON_HEADERS = { Accept: 'application/json' };

const postJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.post(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `POST ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const putJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.put(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `PUT ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

/** The server stores withdrawal dates as given, so UTC today is never in the seed bank's future. */
const today = (): string => new Date().toISOString().split('T')[0];

type AccessionPayload = {
  id: number;
  accessionNumber: string;
  viabilityTests?: { id: number }[];
};

type SeededAccession = {
  id: number;
  accessionNumber: string;
  speciesName: string;
};

const seedSeedBank = async (
  request: APIRequestContext,
  { organizationId, name }: { organizationId: number; name: string }
): Promise<number> => {
  const { id } = await postJson<{ id: number }>(request, '/api/v1/facilities', {
    organizationId,
    name,
    type: 'Seed Bank',
    timeZone: 'Etc/UTC',
  });
  return id;
};

/**
 * Creates an accession holding a weight of seeds, with the subset measurements the server needs
 * before it will estimate a withdrawal's quantity in the other unit.
 */
const seedAccession = async (
  request: APIRequestContext,
  { facilityId, species }: { facilityId: number; species: SeededSpecies }
): Promise<SeededAccession> => {
  const { accession } = await postJson<{ accession: AccessionPayload }>(request, '/api/v2/seedbank/accessions', {
    facilityId,
    speciesId: species.id,
    state: 'In Storage',
  });

  await putJson(request, `/api/v2/seedbank/accessions/${accession.id}`, {
    facilityId,
    speciesId: species.id,
    state: 'In Storage',
    remainingQuantity: { quantity: REMAINING_GRAMS, units: 'Grams' },
    subsetWeight: { quantity: SUBSET_WEIGHT_GRAMS, units: 'Grams' },
    subsetCount: SUBSET_COUNT,
  });

  return { id: accession.id, accessionNumber: accession.accessionNumber, speciesName: species.scientificName };
};

const withdrawToNursery = async (
  request: APIRequestContext,
  { accessionId, nurseryId, seeds }: { accessionId: number; nurseryId: number; seeds: number }
): Promise<{ id: number; batchNumber: string }> => {
  const { batch } = await postJson<{ batch: { id: number; batchNumber: string } }>(
    request,
    `/api/v2/seedbank/accessions/${accessionId}/transfers/nursery`,
    {
      activeGrowthQuantity: 0,
      date: today(),
      destinationFacilityId: nurseryId,
      germinatingQuantity: seeds,
      hardeningOffQuantity: 0,
      notes: NURSERY_NOTES,
      readyQuantity: 0,
    }
  );
  return batch;
};

const withdrawGrams = async (
  request: APIRequestContext,
  { accessionId, grams }: { accessionId: number; grams: number }
): Promise<void> => {
  await postJson(request, `/api/v2/seedbank/accessions/${accessionId}/withdrawals`, {
    date: today(),
    notes: BULK_NOTES,
    purpose: 'Other',
    withdrawnQuantity: { quantity: grams, units: 'Grams' },
  });
};

/** Viability testing withdrawals exist only as the shadow of a test, so the test is what we create. */
const withdrawForViabilityTest = async (
  request: APIRequestContext,
  { accessionId, seeds }: { accessionId: number; seeds: number }
): Promise<number> => {
  const { accession } = await postJson<{ accession: AccessionPayload }>(
    request,
    `/api/v2/seedbank/accessions/${accessionId}/viabilityTests`,
    {
      seedsTested: seeds,
      startDate: today(),
      testType: 'Lab',
    }
  );

  const viabilityTestId = accession.viabilityTests?.[0]?.id;
  expect(viabilityTestId, 'The created viability test should come back on the accession').toBeDefined();
  return viabilityTestId as number;
};

type Fixture = {
  organization: SeededOrganization;
  nurseryAccession: SeededAccession;
  batch: { id: number; batchNumber: string };
  bulkAlpha: SeededAccession;
  bulkBeta: SeededAccession;
  viabilityAccession: SeededAccession;
  viabilityTestId: number;
};

const seedFixture = async (page: Page): Promise<Fixture> => {
  const request = page.request;

  const organization = await seedOrganization(request, {
    name: 'E2E Seeds Withdrawals',
    species: [
      { scientificName: 'Withdrawalia nurseria' },
      { scientificName: 'Withdrawalia alpha' },
      { scientificName: 'Withdrawalia beta' },
      { scientificName: 'Withdrawalia testis' },
    ],
  });
  const [nurserySpecies, alphaSpecies, betaSpecies, testedSpecies] = organization.species;

  const seedBankId = await seedSeedBank(request, { organizationId: organization.id, name: SEED_BANK_NAME });
  const nurseryId = await seedNursery(request, { organizationId: organization.id, name: NURSERY_NAME });

  const nurseryAccession = await seedAccession(request, { facilityId: seedBankId, species: nurserySpecies });
  const bulkAlpha = await seedAccession(request, { facilityId: seedBankId, species: alphaSpecies });
  const bulkBeta = await seedAccession(request, { facilityId: seedBankId, species: betaSpecies });
  const viabilityAccession = await seedAccession(request, { facilityId: seedBankId, species: testedSpecies });

  // The details page groups withdrawals that the same user created within ten seconds of each
  // other, so these four land in one window on purpose: each page below is expected to show only
  // the withdrawals that share its own purpose, and the viability test to stand alone regardless.
  const batch = await withdrawToNursery(request, {
    accessionId: nurseryAccession.id,
    nurseryId,
    seeds: NURSERY_SEEDS,
  });
  await withdrawGrams(request, { accessionId: bulkAlpha.id, grams: BULK_ALPHA_GRAMS });
  await withdrawGrams(request, { accessionId: bulkBeta.id, grams: BULK_BETA_GRAMS });
  const viabilityTestId = await withdrawForViabilityTest(request, {
    accessionId: viabilityAccession.id,
    seeds: VIABILITY_SEEDS,
  });

  return { organization, nurseryAccession, batch, bulkAlpha, bulkBeta, viabilityAccession, viabilityTestId };
};

const openWithdrawalsLog = async (page: Page, organization: SeededOrganization) => {
  await page.goto(`/?organizationId=${organization.id}`);
  await waitFor(page, '#home');
  await openNavItem(page, 'Seeds', 'Withdrawals');
  await expect(page.getByText('Seeds Withdrawals', exactOptions)).toBeVisible();
};

const logRow = (page: Page, accessionNumber: string): Locator =>
  page.getByRole('row').filter({ has: page.getByRole('link', { name: accessionNumber, ...exactOptions }) });

/** The log's cells carry an id ending in the column they belong to, e.g. `row1-purpose`. */
const logCell = (row: Locator, columnId: string): Locator => row.locator(`[id$="-${columnId}"]`);

const openDetailsFrom = async (page: Page, row: Locator) => {
  await logCell(row, 'date').getByRole('link').click();
  await expect(page.getByRole('link', { name: 'Withdrawal History' })).toBeVisible();
};

/** The Details section renders each field as a card whose title sits above its contents. */
const overviewCard = (page: Page, title: string): Locator => page.getByText(title, exactOptions).locator('xpath=..');

const accessionRow = (page: Page, accessionNumber: string): Locator =>
  page.getByRole('row').filter({ has: page.getByRole('link', { name: accessionNumber, ...exactOptions }) });

test.describe('SeedsWithdrawalsTests', () => {
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

  test('Logs a nursery withdrawal and opens its details with the batch it filled', async ({ page }) => {
    const { organization, nurseryAccession, batch } = await seedFixture(page);
    organizationId = organization.id;

    await openWithdrawalsLog(page, organization);

    const row = logRow(page, nurseryAccession.accessionNumber);
    await expect(logCell(row, 'date')).toHaveText(today());
    await expect(logCell(row, 'speciesName')).toHaveText(nurseryAccession.speciesName);
    await expect(logCell(row, 'purpose')).toHaveText('Nursery');
    await expect(logCell(row, 'seedBankName')).toHaveText(SEED_BANK_NAME);
    await expect(logCell(row, 'quantity')).toHaveText(`${NURSERY_SEEDS} ct`);
    await expect(logCell(row, 'destination')).toHaveText(NURSERY_NAME);
    await expect(logCell(row, 'withdrawnByName')).toHaveText(WITHDRAWN_BY);

    // Only the date and the accession number link anywhere: the purpose deliberately does not
    // link to the batch it created.
    await expect(logCell(row, 'purpose').getByRole('link')).toHaveCount(0);
    await expect(row.getByRole('link')).toHaveCount(2);

    await openDetailsFrom(page, row);

    await expect(overviewCard(page, 'Purpose')).toContainText('Nursery');
    await expect(overviewCard(page, 'From: Seed Bank')).toContainText(SEED_BANK_NAME);
    await expect(overviewCard(page, 'Destination')).toContainText(NURSERY_NAME);
    await expect(overviewCard(page, 'Notes')).toContainText(NURSERY_NOTES);
    await expect(
      overviewCard(page, 'Batch').getByRole('link', { name: batch.batchNumber, ...exactOptions })
    ).toHaveAttribute('href', `/inventory/batch/${batch.id}`);
    await expect(page.getByText('Viability Test', exactOptions)).toHaveCount(0);

    const detailsRow = accessionRow(page, nurseryAccession.accessionNumber);
    await expect(
      detailsRow.getByRole('link', { name: nurseryAccession.accessionNumber, ...exactOptions })
    ).toHaveAttribute('href', `/accessions/${nurseryAccession.id}`);
    await expect(detailsRow).toContainText(nurseryAccession.speciesName);
    await expect(detailsRow).toContainText(`${NURSERY_SEEDS} ct (~${NURSERY_ESTIMATED_GRAMS} g)`);
  });

  test('Keeps a row per accession for a withdrawal that emptied several of them', async ({ page }) => {
    const { organization, bulkAlpha, bulkBeta, nurseryAccession } = await seedFixture(page);
    organizationId = organization.id;

    await openWithdrawalsLog(page, organization);

    const alphaRow = logRow(page, bulkAlpha.accessionNumber);
    const betaRow = logRow(page, bulkBeta.accessionNumber);
    await expect(logCell(alphaRow, 'purpose')).toHaveText('Other');
    await expect(logCell(alphaRow, 'quantity')).toHaveText(`${BULK_ALPHA_GRAMS} g`);
    await expect(logCell(betaRow, 'purpose')).toHaveText('Other');
    await expect(logCell(betaRow, 'quantity')).toHaveText(`${BULK_BETA_GRAMS} g`);

    const expectBothAccessions = async () => {
      await expect(accessionRow(page, bulkAlpha.accessionNumber)).toContainText(
        `${BULK_ALPHA_GRAMS} g (~${BULK_ALPHA_ESTIMATED_SEEDS} ct)`
      );
      await expect(accessionRow(page, bulkBeta.accessionNumber)).toContainText(
        `${BULK_BETA_GRAMS} g (~${BULK_BETA_ESTIMATED_SEEDS} ct)`
      );
      // The withdrawals made in the same window for other purposes stay on their own pages.
      await expect(page.getByText(nurseryAccession.accessionNumber, exactOptions)).toHaveCount(0);
    };

    // Each row links to its own withdrawal, but both withdrawals were made in one go, so either
    // link has to land on a page describing the whole group.
    await openDetailsFrom(page, alphaRow);
    await expect(overviewCard(page, 'Notes')).toContainText(BULK_NOTES);
    await expectBothAccessions();

    await page.getByRole('link', { name: 'Withdrawal History' }).click();
    await expect(page.getByText('Seeds Withdrawals', exactOptions)).toBeVisible();

    await openDetailsFrom(page, logRow(page, bulkBeta.accessionNumber));
    await expectBothAccessions();
  });

  test('Keeps a viability testing withdrawal on its own and links to the test', async ({ page }) => {
    const { organization, viabilityAccession, viabilityTestId, bulkAlpha } = await seedFixture(page);
    organizationId = organization.id;

    await openWithdrawalsLog(page, organization);

    const row = logRow(page, viabilityAccession.accessionNumber);
    await expect(logCell(row, 'purpose')).toHaveText('Viability Testing');
    await expect(logCell(row, 'quantity')).toHaveText(`${VIABILITY_SEEDS} ct`);
    await expect(logCell(row, 'purpose').getByRole('link')).toHaveCount(0);

    await openDetailsFrom(page, row);

    await expect(overviewCard(page, 'Purpose')).toContainText('Viability Testing');
    await expect(
      overviewCard(page, 'Viability Test').getByRole('link', { name: `#${viabilityTestId}`, ...exactOptions })
    ).toHaveAttribute('href', `/accessions/${viabilityAccession.id}?viabilityTestId=${viabilityTestId}`);
    await expect(page.getByText('Batch', exactOptions)).toHaveCount(0);

    await expect(accessionRow(page, viabilityAccession.accessionNumber)).toContainText(
      `${VIABILITY_SEEDS} ct (~${VIABILITY_ESTIMATED_GRAMS} g)`
    );
    // Another withdrawal was created seconds earlier, but viability tests are never grouped.
    await expect(page.getByText(bulkAlpha.accessionNumber, exactOptions)).toHaveCount(0);
  });
});

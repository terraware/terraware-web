import React from 'react';

import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { buildOrganization, mockGet, mockImage, mockPost, renderWithProviders, server } from 'src/test-utils';

import SeedsWithdrawalDetailsView from './index';

const ORG_ID = 1;
const SEED_BANK_ID = 101;
const ANCHOR_ID = 7;
const USER_ID = 20;
const BATCH_ID = 31;
const OTHER_SEED_BANK_ID = 102;

type SeedWithdrawalSearchResult = Record<string, string>;

const buildSearchResult = (overrides: Partial<SeedWithdrawalSearchResult> = {}): SeedWithdrawalSearchResult => ({
  id: String(ANCHOR_ID),
  accession_id: '42',
  accession_accessionNumber: 'ACC-001',
  accession_species_scientificName: 'Acacia koa',
  accession_facility_id: String(SEED_BANK_ID),
  accession_facility_name: 'Main Seed Bank',
  date: '2026-03-14',
  destination: 'Lab bench 3',
  notes: 'Shipped in two boxes',
  'purpose(raw)': 'Other',
  'quantity(raw)': '40',
  'units(raw)': 'Grams',
  ...overrides,
});

type Creation = {
  withdrawalId: number;
  accessionId: number;
  timestamp: string;
  userId?: number;
  facilityId?: number;
};

const buildCreationEvent = ({
  withdrawalId,
  accessionId,
  timestamp,
  userId = USER_ID,
  facilityId = SEED_BANK_ID,
}: Creation) => ({
  action: { type: 'Created' },
  subject: {
    type: 'Withdrawal',
    withdrawalId,
    accessionId,
    facilityId,
    fullText: 'Withdrawal created',
    shortText: 'Created',
  },
  timestamp,
  userId,
  userName: 'Ada Lovelace',
});

/**
 * Answers with the creation events the request actually asked for: a request narrowed to one seed
 * bank only sees that bank's events, so a page that narrows the query loses the other banks' rows.
 */
const mockCreations = (events: ReturnType<typeof buildCreationEvent>[]) => {
  server.use(
    http.post('/api/v1/events/list', async ({ request }) => {
      const body = (await request.json()) as { facilityId?: number };
      const visible = body.facilityId ? events.filter((event) => event.subject.facilityId === body.facilityId) : events;
      return HttpResponse.json({ status: 'ok', events: visible });
    })
  );
};

/**
 * The page searches twice: once for the withdrawal in the URL, then once for its whole group. This
 * answers each request with only the withdrawals it asked for, so a page that asks for the wrong
 * ids renders the wrong rows.
 */
const mockSearch = (results: SeedWithdrawalSearchResult[]) => {
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { search: { children: { field?: string; values?: string[] }[] } };
      const ids = body.search.children.find((child) => child.field === 'id')?.values ?? [];
      return HttpResponse.json({ status: 'ok', results: results.filter((result) => ids.includes(result.id)) });
    })
  );
};

const renderDetails = () =>
  renderWithProviders(<SeedsWithdrawalDetailsView />, {
    organization: { selectedOrganization: buildOrganization({ id: ORG_ID }) },
    route: `/seeds/withdrawals/${ANCHOR_ID}`,
    path: APP_PATHS.SEEDS_WITHDRAWALS_DETAILS,
  });

/** The card in the Details section labelled `title`, to read its contents from. */
const detailsCard = (title: string): HTMLElement => screen.getByText(title).parentElement as HTMLElement;

describe('SeedsWithdrawalDetailsView', () => {
  it('shows the details of a multi-accession withdrawal, with a row per accession', async () => {
    mockSearch([
      buildSearchResult(),
      buildSearchResult({
        id: '8',
        accession_id: '43',
        accession_accessionNumber: 'ACC-002',
        accession_species_scientificName: 'Metrosideros polymorpha',
        'quantity(raw)': '8',
        'units(raw)': 'Ounces',
      }),
    ]);
    mockPost('/api/v1/events/list', {
      events: [
        buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' }),
        buildCreationEvent({ withdrawalId: 8, accessionId: 43, timestamp: '2026-03-14T10:00:03Z' }),
      ],
    });

    renderDetails();

    expect(await screen.findByText('2026-03-14')).toBeVisible();

    expect(within(detailsCard(strings.PURPOSE)).getByText(strings.OTHER)).toBeVisible();
    expect(within(detailsCard(strings.FROM_SEED_BANK)).getByText('Main Seed Bank')).toBeVisible();
    expect(within(detailsCard(strings.DESTINATION)).getByText('Lab bench 3')).toBeVisible();
    expect(within(detailsCard(strings.NOTES)).getByText('Shipped in two boxes')).toBeVisible();

    expect(screen.getByRole('link', { name: 'ACC-001' })).toHaveAttribute('href', '/accessions/42');
    expect(screen.getByRole('link', { name: 'ACC-002' })).toHaveAttribute('href', '/accessions/43');
    expect(screen.getByRole('cell', { name: 'Acacia koa' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Metrosideros polymorpha' })).toBeVisible();
    expect(screen.getByRole('cell', { name: `40 ${strings.G}` })).toBeVisible();
    expect(screen.getByRole('cell', { name: `8 ${strings.OZ}` })).toBeVisible();

    expect(screen.queryByText(strings.BATCH)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.PHOTOS)).not.toBeInTheDocument();
  });

  it('names the destination nursery and shows the photos of the batch it filled', async () => {
    mockSearch([
      buildSearchResult({
        'purpose(raw)': 'Nursery',
        destination: '',
        batch_id: String(BATCH_ID),
        batch_batchNumber: 'B-01',
        batch_facility_name: 'Kigali Nursery',
      }),
    ]);
    mockPost('/api/v1/events/list', {
      events: [buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' })],
    });
    mockGet(`/api/v1/nursery/batches/${BATCH_ID}/photos`, { photos: [{ id: 5 }] });
    mockImage(`/api/v1/nursery/batches/${BATCH_ID}/photos/:photoId`);

    renderDetails();

    expect(await screen.findByRole('link', { name: 'ACC-001' })).toBeVisible();
    expect(within(detailsCard(strings.PURPOSE)).getByText(strings.NURSERY)).toBeVisible();
    expect(within(detailsCard(strings.DESTINATION)).getByText('Kigali Nursery')).toBeVisible();

    expect(within(detailsCard(strings.BATCH)).getByRole('link', { name: 'B-01' })).toHaveAttribute(
      'href',
      `/inventory/batch/${BATCH_ID}`
    );
    expect(screen.queryByRole('columnheader', { name: new RegExp(strings.BATCH) })).not.toBeInTheDocument();

    expect(screen.getByText(strings.PHOTOS)).toBeVisible();
    expect(await screen.findByAltText('0')).toBeInTheDocument();
  });

  it('keeps a viability testing withdrawal on its own, and links to the test', async () => {
    mockSearch([
      buildSearchResult({ 'purpose(raw)': 'Viability Testing', viabilityTest_id: '77' }),
      buildSearchResult({
        id: '9',
        accession_id: '44',
        accession_accessionNumber: 'ACC-003',
        'purpose(raw)': 'Viability Testing',
        viabilityTest_id: '78',
      }),
    ]);
    // Another viability test withdrawn in the same breath: close enough in time to be grouped, but
    // viability tests are withdrawn one accession at a time and never belong to a group.
    mockPost('/api/v1/events/list', {
      events: [
        buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' }),
        buildCreationEvent({ withdrawalId: 9, accessionId: 44, timestamp: '2026-03-14T10:00:02Z' }),
      ],
    });

    renderDetails();

    expect(await screen.findByRole('link', { name: 'ACC-001' })).toBeVisible();
    expect(screen.queryByText('ACC-003')).not.toBeInTheDocument();

    expect(within(detailsCard(strings.VIABILITY_TEST)).getByRole('link', { name: '#77' })).toHaveAttribute(
      'href',
      '/accessions/42?viabilityTestId=77'
    );
    expect(screen.queryByText(strings.BATCH)).not.toBeInTheDocument();
  });

  it('follows a seed count with the estimated weight, and a weight with the estimated count', async () => {
    mockSearch([
      buildSearchResult({
        'quantity(raw)': '500',
        'units(raw)': 'Seeds',
        'estimatedWeightQuantity(raw)': '300',
        'estimatedWeightUnits(raw)': 'Grams',
      }),
      buildSearchResult({
        id: '9',
        accession_id: '44',
        accession_accessionNumber: 'ACC-003',
        'quantity(raw)': '40',
        'units(raw)': 'Grams',
        'estimatedCount(raw)': '67',
      }),
    ]);
    mockPost('/api/v1/events/list', {
      events: [
        buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' }),
        buildCreationEvent({ withdrawalId: 9, accessionId: 44, timestamp: '2026-03-14T10:00:01Z' }),
      ],
    });

    renderDetails();

    expect(await screen.findByRole('cell', { name: `500 ${strings.CT} (~300 ${strings.G})` })).toBeVisible();
    expect(screen.getByRole('cell', { name: `40 ${strings.G} (~67 ${strings.CT})` })).toBeVisible();
  });

  it('leaves the quantity on its own when the accession has no subset weight to estimate from', async () => {
    mockSearch([buildSearchResult({ 'quantity(raw)': '500', 'units(raw)': 'Seeds' })]);
    mockPost('/api/v1/events/list', {
      events: [buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' })],
    });

    renderDetails();

    expect(await screen.findByRole('cell', { name: `500 ${strings.CT}` })).toBeVisible();
  });

  it('keeps the accessions of a bulk withdrawal that spans seed banks', async () => {
    mockSearch([
      buildSearchResult(),
      buildSearchResult({
        id: '9',
        accession_id: '44',
        accession_accessionNumber: 'ACC-003',
        accession_facility_id: String(OTHER_SEED_BANK_ID),
        accession_facility_name: 'Coastal Seed Bank',
      }),
    ]);
    mockCreations([
      buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' }),
      buildCreationEvent({
        withdrawalId: 9,
        accessionId: 44,
        timestamp: '2026-03-14T10:00:01Z',
        facilityId: OTHER_SEED_BANK_ID,
      }),
    ]);

    renderDetails();

    expect(await screen.findByRole('link', { name: 'ACC-001' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'ACC-003' })).toBeVisible();
    expect(within(detailsCard(strings.FROM_SEED_BANK)).getByText('Main Seed Bank, Coastal Seed Bank')).toBeVisible();
  });

  it('falls back to the withdrawal itself when the creation history cannot be read', async () => {
    mockSearch([
      buildSearchResult(),
      buildSearchResult({ id: '9', accession_id: '44', accession_accessionNumber: 'ACC-003' }),
    ]);
    server.use(http.post('/api/v1/events/list', () => new HttpResponse(null, { status: 500 })));

    renderDetails();

    expect(await screen.findByRole('link', { name: 'ACC-001' })).toBeVisible();
    expect(screen.queryByText('ACC-003')).not.toBeInTheDocument();
  });

  it('leaves out a withdrawal made seconds later for a different purpose', async () => {
    mockSearch([
      buildSearchResult(),
      buildSearchResult({
        id: '9',
        accession_id: '44',
        accession_accessionNumber: 'ACC-003',
        'purpose(raw)': 'Nursery',
        destination: '',
        batch_id: String(BATCH_ID),
        batch_batchNumber: 'B-01',
        batch_facility_name: 'Kigali Nursery',
      }),
    ]);
    mockPost('/api/v1/events/list', {
      events: [
        buildCreationEvent({ withdrawalId: ANCHOR_ID, accessionId: 42, timestamp: '2026-03-14T10:00:00Z' }),
        buildCreationEvent({ withdrawalId: 9, accessionId: 44, timestamp: '2026-03-14T10:00:02Z' }),
      ],
    });

    renderDetails();

    expect(await screen.findByRole('link', { name: 'ACC-001' })).toBeVisible();
    expect(screen.queryByText('ACC-003')).not.toBeInTheDocument();
    expect(screen.queryByText(strings.PHOTOS)).not.toBeInTheDocument();
  });
});

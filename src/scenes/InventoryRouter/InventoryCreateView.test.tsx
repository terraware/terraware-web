import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import ToastSnackbar from 'src/components/ToastSnackbar';
import { SearchResponseAccession } from 'src/queries/search/accessions';
import InventoryCreateView from 'src/scenes/InventoryRouter/InventoryCreateView';
import { InventoryListTypes } from 'src/scenes/InventoryRouter/InventoryV2View';
import strings from 'src/strings';
import {
  buildBatch,
  buildFacility,
  buildOrganization,
  buildSpecies,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
  server,
} from 'src/test-utils';

const CREATE_BATCH_URL = '/api/v1/nursery/batches';
const SPECIES_ID = 7;
const NURSERY_ID = 200;
const NEW_BATCH_ID = 555;
const ACCESSION_ID = 42;

const SPECIES = buildSpecies({ id: SPECIES_ID, scientificName: 'Acacia koa', commonName: 'Koa' });
const NURSERY = buildFacility({ id: NURSERY_ID, name: 'South Nursery', facilityNumber: 2 });

const ACCESSION: SearchResponseAccession = {
  id: String(ACCESSION_ID),
  accessionNumber: '24-1-1-042',
  remainingQuantity: '10',
  'remainingQuantity(raw)': '10',
  remainingUnits: 'Seeds',
  speciesName: SPECIES.scientificName,
  state: 'In Storage',
};

/**
 * The species selector and the accessions dropdown both read from the generic search endpoint,
 * distinguished by prefix.
 */
const mockFormData = ({ accessions = [] }: { accessions?: SearchResponseAccession[] } = {}) => {
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const { prefix } = (await request.json()) as { prefix?: string };
      const results =
        prefix === 'species'
          ? [{ id: String(SPECIES_ID), scientificName: SPECIES.scientificName, commonName: SPECIES.commonName }]
          : prefix === 'accessions'
            ? accessions
            : [];
      return HttpResponse.json({ status: 'ok', results });
    })
  );
  mockGet('/api/v1/species', { species: [SPECIES] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/facilities/:facilityId/subLocations', { subLocations: [] });
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderCreateView = ({ inventoryListType }: { inventoryListType?: string } = {}) =>
  renderWithProviders(
    <>
      <InventoryCreateView />
      <ToastSnackbar />
      <LocationProbe />
    </>,
    {
      route: '/inventory/new',
      organization: {
        selectedOrganization: buildOrganization({ facilities: [buildFacility(), NURSERY] }),
      },
      currentUser: { userPreferences: inventoryListType ? { inventoryListType } : {} },
    }
  );

const selectSpecies = async (user: UserEvent) => {
  await user.click(document.querySelector('#speciesSelector') as Element);
  await user.click(await screen.findByText(SPECIES.scientificName));
};

const quantityInput = (id: string): HTMLInputElement => {
  const input = document.querySelector<HTMLInputElement>(`#${id} input`);
  if (!input) {
    throw new Error(`No quantity input ${id}`);
  }
  return input;
};

const enterQuantity = async (user: UserEvent, id: string, quantity: string) => {
  await user.clear(quantityInput(id));
  await user.type(quantityInput(id), quantity);
};

/** The messages attached to a field. Error text is a `label` pointing at the field it describes. */
const messagesFor = (id: string): string[] =>
  Array.from(document.querySelectorAll(`label[for="${id}"]`)).map((label) => label.textContent ?? '');

const enterDate = async (user: UserEvent, id: string, date: string) => {
  await user.click(document.querySelector(`#${id}`) as Element);
  await user.keyboard(date.replace(/-/g, ''));
};

const fillValidForm = async (user: UserEvent) => {
  await selectSpecies(user);
  await selectDropdownOption(user, 'facilityId', NURSERY.name);
  await enterQuantity(user, 'germinatingQuantity', '4');
  await enterQuantity(user, 'readyQuantity', '6');
};

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

const createdBatch = buildBatch({ id: NEW_BATCH_ID, facilityId: NURSERY_ID, speciesId: SPECIES_ID });

describe('InventoryCreateView', () => {
  it('creates a batch with the entered species, nursery, date and quantities', async () => {
    mockFormData();
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderCreateView();

    await fillValidForm(user);
    await enterQuantity(user, 'activeGrowthQuantity', '3');
    await enterQuantity(user, 'hardeningOffQuantity', '2');
    await enterDate(user, 'addedDate', '2024-03-15');
    await save(user);

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({
      speciesId: SPECIES_ID,
      facilityId: NURSERY_ID,
      addedDate: '2024-03-15',
      germinatingQuantity: 4,
      activeGrowthQuantity: 3,
      hardeningOffQuantity: 2,
      readyQuantity: 6,
    });
  });

  it.each([
    {
      preference: undefined,
      expected: `/inventory/species/${SPECIES_ID}/batch/${NEW_BATCH_ID}`,
    },
    {
      preference: InventoryListTypes.BATCHES_BY_SPECIES,
      expected: `/inventory/species/${SPECIES_ID}/batch/${NEW_BATCH_ID}`,
    },
    {
      preference: InventoryListTypes.BATCHES_BY_NURSERY,
      expected: `/inventory/nursery/${NURSERY_ID}/batch/${NEW_BATCH_ID}`,
    },
    {
      preference: InventoryListTypes.BATCHES_BY_BATCH,
      expected: `/inventory/batch/${NEW_BATCH_ID}`,
    },
  ])('opens the new batch at $expected when the inventory list preference is $preference', async (testCase) => {
    mockFormData();
    captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderCreateView({ inventoryListType: testCase.preference });

    await fillValidForm(user);
    await save(user);

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(testCase.expected));
  });

  it('keeps the user on the form and reports the failure when the batch cannot be created', async () => {
    mockFormData();
    mockError('post', CREATE_BATCH_URL);
    const { user } = renderCreateView();

    await fillValidForm(user);
    await save(user);

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    // Leaving the form would tell the user the batch exists when it does not.
    expect(screen.getByTestId('location').textContent).toBe('/inventory/new');
    expect(quantityInput('readyQuantity')).toHaveValue(6);
  });

  it('refuses to save a batch with no seedlings in any phase', async () => {
    mockFormData();
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderCreateView();

    await selectSpecies(user);
    await selectDropdownOption(user, 'facilityId', NURSERY.name);
    await save(user);

    expect(await screen.findByText(strings.ERROR_BATCH_SEED_COUNT)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });

  it('flags the missing species and nursery and sends nothing', async () => {
    mockFormData();
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderCreateView();

    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    await waitFor(() => expect(messagesFor('speciesSelector')).toContain(strings.REQUIRED_FIELD));
    expect(messagesFor('facilityId')).toContain(strings.REQUIRED_FIELD);
    expect(creates).toHaveLength(0);
  });

  it('refuses quantities that exceed the seeds remaining in the selected accession', async () => {
    mockFormData({ accessions: [ACCESSION] });
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const transfers = captureRequests('post', `/api/v2/seedbank/accessions/${ACCESSION_ID}/transfers/nursery`);
    const { user } = renderCreateView();

    await selectSpecies(user);
    await selectDropdownOption(user, 'accessionId', ACCESSION.accessionNumber);
    await selectDropdownOption(user, 'facilityId', NURSERY.name);
    await enterQuantity(user, 'germinatingQuantity', '8');
    await enterQuantity(user, 'readyQuantity', '5');
    await save(user);

    await waitFor(() => expect(messagesFor('readyQuantity')).toContain(strings.NOT_ENOUGH_SEEDS_IN_ACCESSION));
    expect(messagesFor('germinatingQuantity')).not.toContain(strings.NOT_ENOUGH_SEEDS_IN_ACCESSION);
    expect(creates).toHaveLength(0);
    expect(transfers).toHaveLength(0);
  });

  it('creates a batch from an accession by transferring its seeds to the nursery', async () => {
    mockFormData({ accessions: [ACCESSION] });
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const transfers = captureRequests('post', `/api/v2/seedbank/accessions/${ACCESSION_ID}/transfers/nursery`, {
      batch: buildBatch({ id: NEW_BATCH_ID, version: 1 }),
    });
    const updates = captureRequests('put', `/api/v1/nursery/batches/${NEW_BATCH_ID}`, {
      batch: buildBatch({ id: NEW_BATCH_ID, version: 2 }),
    });
    const quantityUpdates = captureRequests('put', `/api/v1/nursery/batches/${NEW_BATCH_ID}/quantities`, {
      batch: createdBatch,
    });
    const { user } = renderCreateView();

    await selectSpecies(user);
    await selectDropdownOption(user, 'accessionId', ACCESSION.accessionNumber);
    await selectDropdownOption(user, 'facilityId', NURSERY.name);
    await enterQuantity(user, 'germinatingQuantity', '4');
    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    await waitFor(() => expect(quantityUpdates).toHaveLength(1));
    expect(creates).toHaveLength(0);
    expect(transfers).toHaveLength(1);
    expect(await transfers[0].json()).toMatchObject({
      destinationFacilityId: NURSERY_ID,
      germinatingQuantity: 4,
      readyQuantity: 6,
    });
    expect(await updates[0].json()).toMatchObject({ version: 1 });
    expect(await quantityUpdates[0].json()).toMatchObject({ germinatingQuantity: 4, readyQuantity: 6, version: 2 });
    await waitFor(() =>
      expect(screen.getByTestId('location').textContent).toBe(`/inventory/species/${SPECIES_ID}/batch/${NEW_BATCH_ID}`)
    );
  });
});

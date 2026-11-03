import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import ToastSnackbar from 'src/components/ToastSnackbar';
import { OriginPage } from 'src/scenes/InventoryRouter/InventoryBatchView';
import BatchDetailsModal from 'src/scenes/InventoryRouter/view/BatchDetailsModal';
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

const SPECIES = buildSpecies({ id: SPECIES_ID, scientificName: 'Acacia koa', commonName: 'Koa' });
const NURSERY = buildFacility({ id: NURSERY_ID, name: 'South Nursery', facilityNumber: 2 });

/** The species selector and the accessions dropdown both read from the generic search endpoint. */
const mockFormData = () => {
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const { prefix } = (await request.json()) as { prefix?: string };
      const results =
        prefix === 'species'
          ? [{ id: String(SPECIES_ID), scientificName: SPECIES.scientificName, commonName: SPECIES.commonName }]
          : [];
      return HttpResponse.json({ status: 'ok', results });
    })
  );
  mockGet('/api/v1/species', { species: [SPECIES] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/facilities/:facilityId/subLocations', { subLocations: [] });
};

const renderModal = (
  origin: OriginPage,
  originId: number,
  { onClose = () => undefined }: { onClose?: () => void } = {}
) =>
  renderWithProviders(
    <>
      <BatchDetailsModal origin={origin} originId={originId} onClose={onClose} />
      <ToastSnackbar />
    </>,
    { organization: { selectedOrganization: buildOrganization({ facilities: [buildFacility(), NURSERY] }) } }
  );

const selectSpecies = async (user: UserEvent) => {
  await user.click(document.querySelector('#speciesSelector') as Element);
  await user.click(await screen.findByText(SPECIES.scientificName));
};

const enterQuantity = async (user: UserEvent, id: string, quantity: string) => {
  const input = document.querySelector<HTMLInputElement>(`#${id} input`);
  if (!input) {
    throw new Error(`No quantity input ${id}`);
  }
  await user.clear(input);
  await user.type(input, quantity);
};

/** A field's label, ignoring the asterisk that marks it as required. */
const fieldLabelled = (label: string) =>
  screen.queryByText(
    (_content, element) => element?.tagName === 'LABEL' && element.textContent?.replace('*', '').trim() === label
  );

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

const createdBatch = buildBatch({ id: 555, facilityId: NURSERY_ID, speciesId: SPECIES_ID });

describe('BatchDetailsModal (add batch)', () => {
  it('asks only for the nursery when adding from a species page, and files the batch under that species', async () => {
    mockFormData();
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderModal('Species', SPECIES_ID);

    expect(fieldLabelled(strings.SPECIES)).not.toBeInTheDocument();
    expect(fieldLabelled(strings.NURSERY)).toBeInTheDocument();

    await selectDropdownOption(user, 'facilityId', NURSERY.name);
    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ speciesId: SPECIES_ID, facilityId: NURSERY_ID, readyQuantity: 6 });
  });

  it('asks only for the species when adding from a nursery page, and files the batch under that nursery', async () => {
    mockFormData();
    const creates = captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    const { user } = renderModal('Nursery', NURSERY_ID);

    expect(fieldLabelled(strings.SPECIES)).toBeInTheDocument();
    expect(fieldLabelled(strings.NURSERY)).not.toBeInTheDocument();

    await selectSpecies(user);
    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ speciesId: SPECIES_ID, facilityId: NURSERY_ID, readyQuantity: 6 });
  });

  it('closes once the batch has been created', async () => {
    mockFormData();
    captureRequests('post', CREATE_BATCH_URL, { batch: createdBatch });
    let closed = false;
    const { user } = renderModal('Nursery', NURSERY_ID, { onClose: () => (closed = true) });

    await selectSpecies(user);
    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    await waitFor(() => expect(closed).toBe(true));
  });

  it('keeps the modal open and reports the failure when the batch cannot be created', async () => {
    mockFormData();
    mockError('post', CREATE_BATCH_URL);
    let closed = false;
    const { user } = renderModal('Nursery', NURSERY_ID, { onClose: () => (closed = true) });

    await selectSpecies(user);
    await enterQuantity(user, 'readyQuantity', '6');
    await save(user);

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    // Closing here would tell the user the batch exists when it does not.
    expect(closed).toBe(false);
    expect(screen.getByRole('dialog', { name: strings.ADD_BATCH })).toBeInTheDocument();
  });
});

import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { ScheduledDatePayload } from 'src/queries/generated/plantingSeasons';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';
import WithdrawFromBatchesModal from 'src/scenes/NurseryRouter/WithdrawFromBatchesModal';
import strings from 'src/strings';
import {
  buildFacility,
  buildOrganization,
  buildSeedBank,
  captureRequests,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

const PLANTING_SITE_ID = 2;
const PLANTING_SEASON_ID = 1;
const SCHEDULED_PLANTING_DATE_ID = 11;
const REQUEST_DATE = '2026-06-08';
const SPECIES_ID = 7;
const WITHDRAWAL_ID = 900;

const CREATE_WITHDRAWAL_URL = '/api/v1/nursery/withdrawals';
const UPLOAD_PHOTO_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos';

const NURSERY_WITH_READY_PLANTS = buildFacility({ id: 100, name: 'Hilltop Nursery' });
const NURSERY_WITH_NO_READY_PLANTS = buildFacility({ id: 200, name: 'Riverside Nursery' });
const NURSERY_WITHOUT_BATCHES = buildFacility({ id: 300, name: 'Valley Nursery' });
const NURSERY_WITH_OTHER_SPECIES = buildFacility({ id: 400, name: 'Lakeside Nursery' });

const organization = buildOrganization({
  facilities: [
    NURSERY_WITH_READY_PLANTS,
    NURSERY_WITH_NO_READY_PLANTS,
    NURSERY_WITHOUT_BATCHES,
    NURSERY_WITH_OTHER_SPECIES,
    buildSeedBank(),
  ],
});

type RequestSubstratum = PlantingDateRequestRow['substrata'][0];

const buildRequestSubstratum = (overrides: Partial<RequestSubstratum> = {}): RequestSubstratum => ({
  substratumId: 1,
  substratumName: 'North',
  stratumId: 1,
  stratumName: 'Upper',
  species: [{ speciesId: SPECIES_ID, scientificName: 'Acacia koa', quantity: 100, withdrawnQuantity: 0 }],
  ...overrides,
});

const buildPlantingDateRequestRow = (overrides: Partial<PlantingDateRequestRow> = {}): PlantingDateRequestRow => ({
  date: REQUEST_DATE,
  plantingSeasonId: PLANTING_SEASON_ID,
  plantingSeasonName: 'Winter',
  plantingSiteId: PLANTING_SITE_ID,
  plantingSiteName: 'Abrewatia Hills',
  status: 'Pending',
  speciesNames: ['Acacia koa'],
  speciesCount: 1,
  requestedPlants: 100,
  withdrawnPlants: 0,
  species: [
    {
      speciesId: SPECIES_ID,
      scientificName: 'Acacia koa',
      requestedQuantity: 100,
      withdrawnQuantity: 0,
    },
  ],
  substrata: [buildRequestSubstratum()],
  ...overrides,
});

/** A request split across two substrata, so one batch can be withdrawn into both. */
const twoSubstratumRequest = buildPlantingDateRequestRow({
  requestedPlants: 200,
  species: [{ speciesId: SPECIES_ID, scientificName: 'Acacia koa', requestedQuantity: 200, withdrawnQuantity: 0 }],
  substrata: [buildRequestSubstratum(), buildRequestSubstratum({ substratumId: 2, substratumName: 'South' })],
});

/** A row from the `batches` search, in the raw shape the search endpoint returns. */
const buildBatchForWithdrawResult = (overrides: {
  id: number;
  batchNumber: string;
  facility: { id: number; name: string };
  readyQuantity: number;
  speciesId?: number;
}) => ({
  id: `${overrides.id}`,
  batchNumber: overrides.batchNumber,
  facility_id: `${overrides.facility.id}`,
  facility_name: overrides.facility.name,
  species_id: `${overrides.speciesId ?? SPECIES_ID}`,
  species_scientificName: 'Acacia koa',
  'readyQuantity(raw)': `${overrides.readyQuantity}`,
});

const BATCH_A = { id: 10, batchNumber: '26-2-1-001', facility: NURSERY_WITH_READY_PLANTS, readyQuantity: 50 };
const BATCH_B = { id: 20, batchNumber: '26-2-1-002', facility: NURSERY_WITH_READY_PLANTS, readyQuantity: 30 };
/** Ready to plant, but not a species the request asks for. */
const BATCH_OF_OTHER_SPECIES = {
  id: 40,
  batchNumber: '26-2-1-004',
  facility: NURSERY_WITH_OTHER_SPECIES,
  readyQuantity: 25,
  speciesId: SPECIES_ID + 1,
};
const BATCH_WITH_NOTHING_READY = {
  id: 30,
  batchNumber: '26-2-1-003',
  facility: NURSERY_WITH_NO_READY_PLANTS,
  readyQuantity: 0,
};

const buildScheduledDate = (overrides: Partial<ScheduledDatePayload> = {}): ScheduledDatePayload => ({
  date: REQUEST_DATE,
  scheduledPlantingDateId: SCHEDULED_PLANTING_DATE_ID,
  species: [{ allocatedQuantity: 100, quantity: 100, speciesId: SPECIES_ID, substratumId: 1 }],
  ...overrides,
});

const createdWithdrawal = { withdrawal: { id: WITHDRAWAL_ID } };

beforeEach(() => {
  const batches = [BATCH_A, BATCH_B, BATCH_WITH_NOTHING_READY, BATCH_OF_OTHER_SPECIES].map(buildBatchForWithdrawResult);

  mockGet('/api/v1/projects', { projects: [] });
  mockGet(`/api/v1/planting-seasons/${PLANTING_SEASON_ID}/scheduled-dates`, {
    scheduledDates: [buildScheduledDate()],
  });

  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      // Apply the facility and species filters the way the server would, so a missing or wrong
      // filter in the request changes what the modal is given.
      const body = (await request.json()) as { search: { children: { field: string; values: string[] }[] } };
      const results = batches.filter((batch) =>
        body.search.children.every(
          ({ field, values }) => !(field in batch) || values.includes(batch[field as keyof typeof batch])
        )
      );
      return HttpResponse.json({ status: 'ok', results });
    })
  );
});

const renderModal = (
  request: PlantingDateRequestRow = buildPlantingDateRequestRow(),
  onClose: () => void = () => undefined
) =>
  renderWithProviders(
    <WithdrawFromBatchesModal
      open
      onClose={onClose}
      request={request}
      plantingSiteId={PLANTING_SITE_ID}
      plantingSeasonId={PLANTING_SEASON_ID}
    />,
    { organization: { selectedOrganization: organization } }
  );

type User = ReturnType<typeof renderModal>['user'];

const button = (name: string) => screen.getByRole('button', { name });

/**
 * The quantity inputs have an empty label, so they have no accessible name; the id encoding the
 * batch and substratum is the only handle on a specific cell.
 */
const quantityInput = (batchId: number, substratumId: number): HTMLInputElement => {
  const input = document.querySelector(`#withdraw-${batchId}-${substratumId} input`);
  if (!input) {
    throw new Error(`No quantity field for batch ${batchId} in substratum ${substratumId}`);
  }
  return input as HTMLInputElement;
};

const enterQuantity = async (user: User, batchId: number, substratumId: number, quantity: number) => {
  const input = quantityInput(batchId, substratumId);
  await user.clear(input);
  await user.type(input, `${quantity}`);
};

/** Opens the nursery dropdown and returns its options once the nurseries with ready plants have loaded. */
const openNurseryOptions = async (user: User): Promise<HTMLElement> => {
  await user.click(await screen.findByPlaceholderText(strings.SELECT_NURSERY));
  const options = await screen.findByRole('list');
  await within(options).findByText(NURSERY_WITH_READY_PLANTS.name);
  return options;
};

const goToQuantities = async (user: User) => {
  const options = await openNurseryOptions(user);
  await user.click(within(options).getByText(NURSERY_WITH_READY_PLANTS.name));
  await user.click(button(strings.NEXT));
  await waitFor(() => quantityInput(BATCH_A.id, 1));
};

const goToPhotos = async (user: User, quantity = 20) => {
  await goToQuantities(user);
  await enterQuantity(user, BATCH_A.id, 1, quantity);
  await user.click(button(strings.NEXT));
};

describe('WithdrawFromBatchesModal', () => {
  it('offers only nurseries that have plants of the requested species ready to plant', async () => {
    const { user } = renderModal();

    const options = await openNurseryOptions(user);

    expect(within(options).getByText(NURSERY_WITH_READY_PLANTS.name)).toBeInTheDocument();
    expect(within(options).queryByText(NURSERY_WITH_NO_READY_PLANTS.name)).not.toBeInTheDocument();
    expect(within(options).queryByText(NURSERY_WITHOUT_BATCHES.name)).not.toBeInTheDocument();
    expect(within(options).queryByText(NURSERY_WITH_OTHER_SPECIES.name)).not.toBeInTheDocument();
    expect(within(options).queryByText(buildSeedBank().name)).not.toBeInTheDocument();
  });

  it('withdraws the entered quantities as out-plantings against the scheduled date, one withdrawal per substratum', async () => {
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, createdWithdrawal);

    const { user } = renderModal(twoSubstratumRequest);

    const dateInput = screen.getByLabelText(strings.WITHDRAW_DATE_REQUIRED);
    await user.click(dateInput);
    await user.keyboard('{Control>}a{/Control}');
    await user.paste('2026-06-05');
    expect(dateInput).toHaveValue('2026-06-05');

    await goToQuantities(user);
    // Batch A is split across both substrata; batch B goes only to the second.
    await enterQuantity(user, BATCH_A.id, 1, 20);
    await enterQuantity(user, BATCH_A.id, 2, 15);
    await enterQuantity(user, BATCH_B.id, 2, 5);
    await user.click(button(strings.NEXT));
    await user.click(button(strings.WITHDRAW));

    await waitFor(() => expect(withdrawals).toHaveLength(2));
    const bodies = await Promise.all(withdrawals.map((request) => request.json()));

    const withdrawal = (substratumId: number, batchWithdrawals: { batchId: number; quantity: number }[]) => ({
      facilityId: NURSERY_WITH_READY_PLANTS.id,
      purpose: 'Out Plant',
      plantingSiteId: PLANTING_SITE_ID,
      plantingSeasonId: PLANTING_SEASON_ID,
      substratumId,
      scheduledPlantingDateRequestId: SCHEDULED_PLANTING_DATE_ID,
      withdrawnDate: '2026-06-05',
      batchWithdrawals: batchWithdrawals.map(({ batchId, quantity }) => ({
        batchId,
        readyQuantityWithdrawn: quantity,
        notReadyQuantityWithdrawn: 0,
        germinatingQuantityWithdrawn: 0,
        activeGrowthQuantityWithdrawn: 0,
      })),
    });

    expect(bodies).toEqual(
      expect.arrayContaining([
        withdrawal(1, [{ batchId: BATCH_A.id, quantity: 20 }]),
        withdrawal(2, [
          { batchId: BATCH_A.id, quantity: 15 },
          { batchId: BATCH_B.id, quantity: 5 },
        ]),
      ])
    );
  });

  it('will not continue when a batch is split across substrata for more than it has ready', async () => {
    const { user } = renderModal(twoSubstratumRequest);

    await goToQuantities(user);
    // Each cell is within the batch's 50 ready plants, but together they exceed it.
    await enterQuantity(user, BATCH_A.id, 1, 30);
    await enterQuantity(user, BATCH_A.id, 2, 30);

    expect(button(strings.NEXT)).toBeDisabled();
    expect(
      screen.getAllByText(strings.formatString(strings.EXCEEDS_READY_TO_PLANT, 60, BATCH_A.readyQuantity).toString())
    ).not.toHaveLength(0);

    await enterQuantity(user, BATCH_A.id, 2, 20);

    expect(button(strings.NEXT)).toBeEnabled();
  });

  it('will not send the withdrawal when the request has no matching scheduled planting date', async () => {
    const scheduledDateLookups = captureRequests(
      'get',
      `/api/v1/planting-seasons/${PLANTING_SEASON_ID}/scheduled-dates`,
      { scheduledDates: [buildScheduledDate({ date: '2026-07-01' })] }
    );

    const { user } = renderModal();

    await goToPhotos(user);

    // Otherwise the button could be disabled only because the lookup has not come back yet.
    expect(scheduledDateLookups).toHaveLength(1);
    expect(button(strings.WITHDRAW)).toBeDisabled();
  });

  it('confirms how many plants were withdrawn and closes, uploading nothing when no photos were added', async () => {
    mockPost(CREATE_WITHDRAWAL_URL, createdWithdrawal);
    const uploads = captureRequests('post', UPLOAD_PHOTO_URL, { id: 1 });

    let closed = false;
    const { user, store } = renderModal(undefined, () => (closed = true));

    await goToPhotos(user);
    await user.click(button(strings.WITHDRAW));

    await waitFor(() => expect(closed).toBe(true));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings
        .formatString(strings.BATCH_WITHDRAW_SUCCESS, '1', strings.BATCHES_SINGULAR, '20', strings.SEEDLINGS_PLURAL)
        .toString(),
    });
    expect(uploads).toHaveLength(0);
  });

  it('only sends the unsaved substrata when retrying after part of the withdrawal fails', async () => {
    let attempts = 0;
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, createdWithdrawal);
    server.use(
      http.post(CREATE_WITHDRAWAL_URL, () => {
        attempts += 1;
        // The second substratum fails the first time it is sent.
        return attempts === 2
          ? HttpResponse.json({ status: 'error', error: { message: 'failed' } }, { status: 500 })
          : undefined;
      })
    );

    let closed = false;
    const { user, store } = renderModal(twoSubstratumRequest, () => (closed = true));

    await goToQuantities(user);
    await enterQuantity(user, BATCH_A.id, 1, 20);
    await enterQuantity(user, BATCH_B.id, 2, 5);
    await user.click(button(strings.NEXT));
    await user.click(button(strings.WITHDRAW));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.WITHDRAWAL_PARTIALLY_SAVED,
      })
    );
    expect(closed).toBe(false);

    await user.click(button(strings.WITHDRAW));

    await waitFor(() => expect(closed).toBe(true));
    // The failed attempt never reaches the capturing handler, so these are the saved withdrawals:
    // each substratum exactly once.
    const bodies = await Promise.all(withdrawals.map((request) => request.json()));
    expect(bodies.map((body) => body.substratumId)).toEqual([1, 2]);
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings
        .formatString(strings.BATCH_WITHDRAW_SUCCESS, '2', strings.BATCHES_PLURAL, '25', strings.SEEDLINGS_PLURAL)
        .toString(),
    });
  });

  it('attaches photos to the first saved withdrawal when a retry saves the rest', async () => {
    let attempts = 0;
    server.use(
      http.post(CREATE_WITHDRAWAL_URL, () => {
        attempts += 1;
        // The first substratum saves as 101, the second fails once and then saves as 102.
        return attempts === 2
          ? HttpResponse.json({ status: 'error', error: { message: 'failed' } }, { status: 500 })
          : HttpResponse.json({ status: 'ok', withdrawal: { id: attempts === 1 ? 101 : 102 } });
      })
    );
    const uploads = captureRequests('post', UPLOAD_PHOTO_URL, { id: 1 });

    let closed = false;
    const { user } = renderModal(twoSubstratumRequest, () => (closed = true));

    await goToQuantities(user);
    await enterQuantity(user, BATCH_A.id, 1, 20);
    await enterQuantity(user, BATCH_B.id, 2, 5);
    await user.click(button(strings.NEXT));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
    await user.click(button(strings.WITHDRAW));
    await waitFor(() => expect(attempts).toBe(2));
    await waitFor(() => expect(button(strings.WITHDRAW)).toBeEnabled());

    await user.click(button(strings.WITHDRAW));

    await waitFor(() => expect(closed).toBe(true));
    expect(uploads.map((upload) => new URL(upload.url).pathname)).toEqual(['/api/v1/nursery/withdrawals/101/photos']);
  });

  it('closes once the withdrawal is saved even if a photo fails to upload', async () => {
    mockPost(CREATE_WITHDRAWAL_URL, createdWithdrawal);
    mockError('post', UPLOAD_PHOTO_URL);

    let closed = false;
    const { user, store } = renderModal(undefined, () => (closed = true));

    await goToPhotos(user);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
    await user.click(button(strings.WITHDRAW));

    // Staying open would invite a retry that withdraws the same plants again.
    await waitFor(() => expect(closed).toBe(true));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'success' });
  });

  it('keeps the modal open and reports the failure when the withdrawal fails', async () => {
    mockError('post', CREATE_WITHDRAWAL_URL);

    let closed = false;
    const { user, store } = renderModal(undefined, () => (closed = true));

    await goToPhotos(user);
    await user.click(button(strings.WITHDRAW));

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
    });
    // Closing would tell the user the plants were withdrawn when they were not.
    expect(closed).toBe(false);
    expect(button(strings.WITHDRAW)).toBeInTheDocument();
  });

  it('attaches the added photos to the withdrawal that was created', async () => {
    mockPost(CREATE_WITHDRAWAL_URL, createdWithdrawal);
    const uploads = captureRequests('post', UPLOAD_PHOTO_URL, { id: 1 });

    const { user } = renderModal();

    await goToPhotos(user);
    // The photo chooser's file input has no label, so it can only be reached through the DOM.
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, [
      new File(['x'], 'first.jpg', { type: 'image/jpeg' }),
      new File(['y'], 'second.jpg', { type: 'image/jpeg' }),
    ]);
    await user.click(button(strings.WITHDRAW));

    await waitFor(() => expect(uploads).toHaveLength(2));
    uploads.forEach((upload) => {
      expect(new URL(upload.url).pathname).toBe(`/api/v1/nursery/withdrawals/${WITHDRAWAL_ID}/photos`);
    });
    const uploadedFiles = await Promise.all(
      uploads.map(async (upload) => ((await upload.formData()).get('file') as File | null)?.name)
    );
    expect(uploadedFiles.sort()).toEqual(['first.jpg', 'second.jpg']);
  });
});

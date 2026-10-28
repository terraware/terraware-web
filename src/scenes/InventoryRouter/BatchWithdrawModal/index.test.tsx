import React, { useState } from 'react';

import { getTodaysDateFormatted } from '@terraware/web-components/utils';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import { NurseryBatchesSearchResponseElement } from 'src/queries/search/batches';
import BatchWithdrawModal from 'src/scenes/InventoryRouter/BatchWithdrawModal';
import strings from 'src/strings';
import {
  buildBatchSearchRow,
  buildFacility,
  buildOrganization,
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
  server,
} from 'src/test-utils';
import { Organization } from 'src/types/Organization';

const WITHDRAWALS_URL = '/api/v1/nursery/withdrawals';
const PHOTOS_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos';
const WITHDRAWAL_ID = 900;

const NURSERY_A = buildFacility({ id: 100, name: 'North Nursery' });
const NURSERY_B = buildFacility({ id: 200, name: 'South Nursery', facilityNumber: 2 });

const PLANTING_SITE_ID = 10;
const PLANTING_SEASON_ID = 20;
const STRATUM_ID = 40;
const SUBSTRATUM_ID = 50;

const PLANTING_SITE = buildPlantingSite({
  id: PLANTING_SITE_ID,
  name: 'Hillside',
  strata: [
    buildStratum({
      id: STRATUM_ID,
      name: 'Upper Stratum',
      substrata: [buildSubstratum({ id: SUBSTRATUM_ID, name: 'Upper Substratum' })],
    }),
  ],
});

const PLANTING_SEASON: PlantingSeasonPayload = {
  id: PLANTING_SEASON_ID,
  name: 'Wet Season',
  plantingSiteId: PLANTING_SITE_ID,
  startDate: '2026-01-01',
  endDate: '2027-06-01',
  status: 'Active',
  speciesTargets: [{ speciesId: 1, substratumId: SUBSTRATUM_ID, quantity: 50 }],
};

/** A batch with stock in every phase, so non-planting withdrawals have all four inputs to fill. */
const MIXED_BATCH = buildBatchSearchRow(
  { id: '1', batchNumber: 'B-001' },
  { germinatingQuantity: 5, activeGrowthQuantity: 10, hardeningOffQuantity: 8, readyQuantity: 20 }
);

/**
 * The modal's default withdrawal date depends on the time zone Luxon is set to when it opens, which
 * the app's date picker changes. Tests that care about the date enter it rather than relying on the
 * default.
 */
const enterWithdrawDate = async (user: UserEvent, date: string) => {
  const dateInput = screen.getByLabelText(strings.WITHDRAW_DATE_REQUIRED);
  await user.click(dateInput);
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(date);
};

/** "Today" as the modal decides whether a withdrawal emptied a batch today. */
const modalToday = () => getTodaysDateFormatted();

type MockOptions = {
  batches?: NurseryBatchesSearchResponseElement[];
  sites?: PlantingSitePayload[];
  seasons?: PlantingSeasonPayload[];
};

/**
 * The endpoints the modal and its purpose step load on open. The batches arrive through the
 * generic search endpoint; any other search (planting date requests, species targets) gets an
 * empty result.
 */
const mockModalData = ({ batches = [MIXED_BATCH], sites = [], seasons = [] }: MockOptions = {}) => {
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { prefix?: string };
      return HttpResponse.json({ status: 'ok', results: body.prefix === 'batches' ? batches : [] });
    })
  );
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/tracking/sites', { sites });
  mockGet('/api/v1/planting-seasons', { seasons });
  mockGet('/api/v1/planting-seasons/:seasonId/scheduled-dates', { scheduledDates: [] });
};

const captureWithdrawals = () => captureRequests('post', WITHDRAWALS_URL, { withdrawal: { id: WITHDRAWAL_ID } });

const renderModal = ({
  batchIds = [1],
  organization = buildOrganization(),
}: { batchIds?: number[]; organization?: Organization } = {}) => {
  const state = { closeCount: 0 };
  const result = renderWithProviders(
    <BatchWithdrawModal open batchIds={batchIds} onClose={() => (state.closeCount += 1)} />,
    { organization: { selectedOrganization: organization } }
  );
  return { ...result, state };
};

const waitForDialog = () => screen.findByRole('dialog', { name: strings.WITHDRAW_FROM_BATCHES });

// The planting option's label carries an info tooltip whose text joins its accessible name.
const isPlantingOption = (name: string) => name.startsWith(strings.PLANTING);
const findPlantingRadio = () => screen.findByRole('radio', { name: isPlantingOption });
const queryPlantingRadio = () => screen.queryByRole('radio', { name: isPlantingOption });

const nextButton = () => screen.getByRole('button', { name: strings.NEXT });

const clickNextWhenEnabled = async (user: UserEvent) => {
  await waitFor(() => expect(nextButton()).toBeEnabled());
  await user.click(nextButton());
};

// The quantity inputs have no label of their own (each cell's label is empty and the column header
// is not associated with it), so they can only be reached through the id SeedlingBatchBox gives
// their wrapper.
type Phase =
  | 'germinatingQuantityWithdrawn'
  | 'activeGrowthQuantityWithdrawn'
  | 'hardeningOffQuantityWithdrawn'
  | 'readyQuantityWithdrawn';

const phaseInput = (batchId: number, phase: Phase) =>
  document.querySelector<HTMLInputElement>(`#withdraw-${batchId}-${phase} input`);

const outplantInput = (batchId: number) => document.querySelector<HTMLInputElement>(`#withdraw-${batchId} input`);

const typeQuantity = async (user: UserEvent, input: HTMLInputElement | null, value: number) => {
  if (!input) {
    throw new Error('quantity input not rendered');
  }
  await user.clear(input);
  await user.type(input, String(value));
};

// The notes label is not associated with its textarea (the label targets an id the textarea
// doesn't carry), so find the textbox next to the label instead.
const notesField = () =>
  within(screen.getByText(strings.NOTES_OPTIONAL).parentElement as HTMLElement).getByRole('textbox');

const attachPhoto = async (user: UserEvent) => {
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!fileInput) {
    throw new Error('photo input not rendered');
  }
  await user.upload(fileInput, new File(['x'], 'photo.jpg', { type: 'image/jpeg' }));
};

/** Dead withdrawal of one ready seedling from MIXED_BATCH, stopping on the photos step. */
const advanceToPhotosWithOneSeedling = async (user: UserEvent) => {
  await waitForDialog();
  await clickNextWhenEnabled(user);
  await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 1);
  await clickNextWhenEnabled(user);
};

const chooseOutplantDestination = async (user: UserEvent) => {
  await user.click(await findPlantingRadio());
  await waitFor(() => expect(document.querySelector('#to-planting-site input')).not.toBeNull());
  await selectDropdownOption(user, 'to-planting-site', PLANTING_SITE.name);
  await selectDropdownOption(user, 'planting-season', PLANTING_SEASON.name);
  await selectDropdownOption(user, 'stratum', 'Upper Stratum');
  await selectDropdownOption(user, 'substratum', 'Upper Substratum');
};

describe('BatchWithdrawModal submitting a withdrawal', () => {
  it('sends every phase quantity, the nursery, date and notes for a dead withdrawal, with no destination', async () => {
    mockModalData();
    const withdrawals = captureWithdrawals();
    const { user } = renderModal();

    await waitForDialog();
    await enterWithdrawDate(user, '2026-03-14');
    await user.type(notesField(), 'Root rot');
    await clickNextWhenEnabled(user);

    await typeQuantity(user, phaseInput(1, 'germinatingQuantityWithdrawn'), 1);
    await typeQuantity(user, phaseInput(1, 'activeGrowthQuantityWithdrawn'), 2);
    await typeQuantity(user, phaseInput(1, 'hardeningOffQuantityWithdrawn'), 3);
    await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 4);
    await clickNextWhenEnabled(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    const body = await withdrawals[0].json();
    expect(body).toEqual({
      purpose: 'Dead',
      facilityId: NURSERY_A.id,
      withdrawnDate: '2026-03-14',
      notes: 'Root rot',
      batchWithdrawals: [
        {
          batchId: 1,
          germinatingQuantityWithdrawn: 1,
          activeGrowthQuantityWithdrawn: 2,
          hardeningOffQuantityWithdrawn: 3,
          readyQuantityWithdrawn: 4,
        },
      ],
    });
  });

  it('sends only ready-to-plant seedlings and the planting destination for an out-plant withdrawal', async () => {
    mockModalData({ sites: [PLANTING_SITE], seasons: [PLANTING_SEASON] });
    const withdrawals = captureWithdrawals();
    const { user } = renderModal();

    // Quantities entered for phases that cannot be planted, under a purpose that allows them...
    await waitForDialog();
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'germinatingQuantityWithdrawn'), 1);
    await typeQuantity(user, phaseInput(1, 'activeGrowthQuantityWithdrawn'), 2);
    await typeQuantity(user, phaseInput(1, 'hardeningOffQuantityWithdrawn'), 3);
    await user.click(screen.getByRole('button', { name: strings.BACK }));

    // ...must not reach the server once the user switches to planting.
    await chooseOutplantDestination(user);
    await clickNextWhenEnabled(user);
    await typeQuantity(user, outplantInput(1), 6);
    await clickNextWhenEnabled(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    const body = await withdrawals[0].json();
    expect(body).toMatchObject({
      purpose: 'Out Plant',
      facilityId: NURSERY_A.id,
      plantingSiteId: PLANTING_SITE_ID,
      plantingSeasonId: PLANTING_SEASON_ID,
      substratumId: SUBSTRATUM_ID,
      batchWithdrawals: [
        {
          batchId: 1,
          germinatingQuantityWithdrawn: 0,
          activeGrowthQuantityWithdrawn: 0,
          hardeningOffQuantityWithdrawn: 0,
          readyQuantityWithdrawn: 6,
        },
      ],
    });
    expect(body).not.toHaveProperty('destinationFacilityId');
  });

  it('confirms how many batches and seedlings were withdrawn and closes', async () => {
    mockModalData();
    captureWithdrawals();
    const { user, store, state } = renderModal();

    await waitForDialog();
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'activeGrowthQuantityWithdrawn'), 2);
    await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 3);
    await clickNextWhenEnabled(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(state.closeCount).toBe(1));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings
        .formatString(strings.BATCH_WITHDRAW_SUCCESS, '1', strings.BATCHES_SINGULAR, '5', strings.SEEDLINGS_PLURAL)
        .toString(),
    });
  });

  it('tells the user a batch is now empty before closing when they withdraw all of it today', async () => {
    mockModalData();
    captureWithdrawals();
    const { user, state } = renderModal();

    await waitForDialog();
    await enterWithdrawDate(user, modalToday());
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'germinatingQuantityWithdrawn'), 5);
    await typeQuantity(user, phaseInput(1, 'activeGrowthQuantityWithdrawn'), 10);
    await typeQuantity(user, phaseInput(1, 'hardeningOffQuantityWithdrawn'), 8);
    await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 20);
    await clickNextWhenEnabled(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    expect(await screen.findByText(strings.EMPTY_BATCHES_AFTER_WITHDRAW)).toBeInTheDocument();
    expect(state.closeCount).toBe(0);

    await user.click(screen.getByRole('button', { name: strings.GOT_IT }));

    await waitFor(() => expect(state.closeCount).toBe(1));
  });

  it('keeps the modal open, reports the failure and uploads no photos when the withdrawal fails', async () => {
    mockModalData();
    mockError('post', WITHDRAWALS_URL);
    const uploads = captureRequests('post', PHOTOS_URL, { id: 1 });
    const { user, store, state } = renderModal();

    await advanceToPhotosWithOneSeedling(user);
    await attachPhoto(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    // Closing here would tell the user the seedlings were withdrawn when the inventory is unchanged.
    expect(state.closeCount).toBe(0);
    expect(screen.getByRole('dialog', { name: strings.WITHDRAW_FROM_BATCHES })).toBeInTheDocument();
    expect(uploads).toHaveLength(0);
  });

  it('uploads attached photos to the withdrawal that was just created', async () => {
    mockModalData();
    captureWithdrawals();
    const uploads = captureRequests('post', PHOTOS_URL, { id: 1 });
    const { user } = renderModal();

    await advanceToPhotosWithOneSeedling(user);
    await attachPhoto(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(uploads).toHaveLength(1));
    expect(new URL(uploads[0].url).pathname).toBe(`/api/v1/nursery/withdrawals/${WITHDRAWAL_ID}/photos`);
  });

  it('does not mistake a batch it just emptied for an empty selection while photos upload', async () => {
    let rows = [buildBatchSearchRow({ id: '1' }, { readyQuantity: 3 })];
    let searches = 0;
    let finishUpload = () => undefined as void;
    const uploadHeld = new Promise<void>((resolve) => (finishUpload = resolve));
    mockModalData();
    server.use(
      http.post('/api/v1/search', () => {
        searches += 1;
        return HttpResponse.json({ status: 'ok', results: rows });
      }),
      http.post(WITHDRAWALS_URL, () => {
        rows = [buildBatchSearchRow({ id: '1' }, { readyQuantity: 0 })];
        return HttpResponse.json({ status: 'ok', withdrawal: { id: WITHDRAWAL_ID } });
      }),
      http.post(PHOTOS_URL, async () => {
        await uploadHeld;
        return HttpResponse.json({ status: 'ok', id: 1 });
      })
    );
    const { user, store, state } = renderModal();

    await waitForDialog();
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 3);
    await clickNextWhenEnabled(user);
    await attachPhoto(user);
    const searchesBeforeWithdrawing = searches;
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    // The withdrawal refetches the batches, which come back empty while the photo is still uploading.
    await waitFor(() => expect(searches).toBeGreaterThan(searchesBeforeWithdrawing));
    await waitFor(() =>
      expect(
        Object.values(store.getState()['rtk-query'].queries).some(
          (query) =>
            query?.endpointName === 'listBatchesByIds' &&
            (query.data as NurseryBatchesSearchResponseElement[] | undefined)?.[0]?.['readyQuantity(raw)'] === 0
        )
      ).toBe(true)
    );
    expect(store.getState().snackbar.snackbars.toast).toBeNull();
    expect(state.closeCount).toBe(0);
    expect(screen.getByRole('dialog', { name: strings.WITHDRAW_FROM_BATCHES })).toBeInTheDocument();

    finishUpload();

    expect(await screen.findByText(strings.EMPTY_BATCHES_AFTER_WITHDRAW)).toBeInTheDocument();
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'success' });
  });

  it('tells the user there is nothing to withdraw and closes when every selected batch is empty', async () => {
    mockModalData({ batches: [buildBatchSearchRow({ id: '1' }, { readyQuantity: 0 })] });
    const { store, state } = renderModal();

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.NO_BATCHES_TO_WITHDRAW_FROM,
      })
    );
    expect(state.closeCount).toBe(1);
    expect(screen.queryByRole('dialog', { name: strings.WITHDRAW_FROM_BATCHES })).not.toBeInTheDocument();
  });
});

describe('BatchWithdrawModal purposes and validation', () => {
  it('does not offer planting to contributors', async () => {
    mockModalData({ sites: [PLANTING_SITE] });
    renderModal({ organization: buildOrganization({ role: 'Contributor' }) });

    expect(await screen.findByRole('radio', { name: strings.DEAD })).toBeInTheDocument();
    expect(queryPlantingRadio()).not.toBeInTheDocument();
  });

  it.each(['Manager', 'Admin'] as const)('offers planting to a %s', async (role) => {
    mockModalData({ sites: [PLANTING_SITE] });
    renderModal({ organization: buildOrganization({ role }) });

    const planting = await findPlantingRadio();
    await waitFor(() => expect(planting).toBeEnabled());
  });

  it('requires a substratum before an out-plant withdrawal can continue', async () => {
    mockModalData({ sites: [PLANTING_SITE] });
    const { user } = renderModal();

    await user.click(await findPlantingRadio());
    await waitFor(() => expect(document.querySelector('#to-planting-site input')).not.toBeNull());
    await selectDropdownOption(user, 'to-planting-site', PLANTING_SITE.name);
    await selectDropdownOption(user, 'stratum', 'Upper Stratum');

    expect(nextButton()).toBeDisabled();

    await selectDropdownOption(user, 'substratum', 'Upper Substratum');

    expect(nextButton()).toBeEnabled();
  });

  it('requires a destination nursery before a nursery transfer can continue', async () => {
    mockModalData();
    const { user } = renderModal({ organization: buildOrganization({ facilities: [NURSERY_A, NURSERY_B] }) });

    await user.click(await screen.findByRole('radio', { name: strings.NURSERY_TRANSFER }));

    expect(nextButton()).toBeDisabled();

    await selectDropdownOption(user, 'to-nursery', NURSERY_B.name);

    expect(nextButton()).toBeEnabled();
  });

  it('blocks continuing and explains why when a quantity exceeds what the batch holds', async () => {
    mockModalData();
    const { user } = renderModal();

    await waitForDialog();
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'germinatingQuantityWithdrawn'), 6);

    expect(screen.getByText(strings.formatString(strings.EXCEEDS_AVAILABLE_X, 5).toString())).toBeInTheDocument();
    expect(nextButton()).toBeDisabled();
  });

  describe('with batches in two nurseries', () => {
    const NORTH_BATCH = buildBatchSearchRow({ id: '1', batchNumber: 'N-001' }, { readyQuantity: 20 });
    const SOUTH_BATCH = buildBatchSearchRow(
      { id: '2', batchNumber: 'S-001', facility_id: String(NURSERY_B.id), facility_name: NURSERY_B.name },
      { readyQuantity: 30 }
    );
    const organization = buildOrganization({ facilities: [NURSERY_A, NURSERY_B] });

    it('withdraws only from the nursery the user chose', async () => {
      mockModalData({ batches: [NORTH_BATCH, SOUTH_BATCH] });
      const withdrawals = captureWithdrawals();
      const { user } = renderModal({ batchIds: [1, 2], organization });

      await waitForDialog();
      await selectDropdownOption(user, 'from-nursery', NURSERY_A.name);
      await clickNextWhenEnabled(user);
      await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 4);
      await user.click(screen.getByRole('button', { name: strings.BACK }));

      await selectDropdownOption(user, 'from-nursery', NURSERY_B.name);
      await clickNextWhenEnabled(user);
      expect(phaseInput(1, 'readyQuantityWithdrawn')).toBeNull();
      await typeQuantity(user, phaseInput(2, 'readyQuantityWithdrawn'), 7);
      await clickNextWhenEnabled(user);
      await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

      await waitFor(() => expect(withdrawals).toHaveLength(1));
      expect(await withdrawals[0].json()).toMatchObject({
        facilityId: NURSERY_B.id,
        batchWithdrawals: [expect.objectContaining({ batchId: 2, readyQuantityWithdrawn: 7 })],
      });
    });

    it('clears entered quantities when the From nursery changes', async () => {
      mockModalData({ batches: [NORTH_BATCH, SOUTH_BATCH] });
      const { user } = renderModal({ batchIds: [1, 2], organization });

      await waitForDialog();
      await selectDropdownOption(user, 'from-nursery', NURSERY_A.name);
      await clickNextWhenEnabled(user);
      await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 4);
      await user.click(screen.getByRole('button', { name: strings.BACK }));

      await selectDropdownOption(user, 'from-nursery', NURSERY_B.name);
      await selectDropdownOption(user, 'from-nursery', NURSERY_A.name);
      await user.click(nextButton());

      expect(phaseInput(1, 'readyQuantityWithdrawn')).toHaveValue(null);
      expect(nextButton()).toBeDisabled();
    });
  });
});

describe('BatchWithdrawModal on a page that keeps it mounted while closed', () => {
  /** Mirrors InventoryBatchView, which renders the modal permanently and toggles `open`. */
  const AlwaysMountedHost = ({ initiallyOpen }: { initiallyOpen: boolean }) => {
    const [open, setOpen] = useState(initiallyOpen);
    const [batchId, setBatchId] = useState(1);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open withdrawal</button>
        <button onClick={() => setBatchId(2)}>Go to batch 2</button>
        <BatchWithdrawModal open={open} batchIds={[batchId]} onClose={() => setOpen(false)} />
      </>
    );
  };

  // The lazy batch query registers in the store as soon as it is triggered, so this tells
  // synchronously whether the closed modal started loading, before any response could arrive.
  const hasRequestedBatches = (store: ReturnType<typeof renderWithProviders>['store']) =>
    Object.values(store.getState()['rtk-query'].queries).some((query) => query?.endpointName === 'listBatchesByIds');

  it('does not report an empty batch until the user tries to withdraw from it', async () => {
    mockModalData({ batches: [buildBatchSearchRow({ id: '1' }, { readyQuantity: 0 })] });
    const { user, store } = renderWithProviders(<AlwaysMountedHost initiallyOpen={false} />);

    expect(hasRequestedBatches(store)).toBe(false);

    await user.click(screen.getByRole('button', { name: 'Open withdrawal' }));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.NO_BATCHES_TO_WITHDRAW_FROM,
      })
    );
  });

  it('opens for a batch with stock after an empty batch was checked on the same page', async () => {
    const rowsById: Record<string, NurseryBatchesSearchResponseElement> = {
      '1': buildBatchSearchRow({ id: '1', batchNumber: 'EMPTY-001' }, { readyQuantity: 0 }),
      '2': buildBatchSearchRow({ id: '2', batchNumber: 'STOCKED-002' }, { readyQuantity: 10 }),
    };
    mockModalData();
    server.use(
      http.post('/api/v1/search', async ({ request }) => {
        const body = (await request.json()) as { search: { children: { field: string; values: string[] }[] } };
        const ids = body.search.children.find((child) => child.field === 'id')?.values ?? [];
        return HttpResponse.json({ status: 'ok', results: ids.map((id) => rowsById[id]).filter(Boolean) });
      })
    );
    const { user, store } = renderWithProviders(<AlwaysMountedHost initiallyOpen={false} />);

    await user.click(screen.getByRole('button', { name: 'Open withdrawal' }));
    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ msg: strings.NO_BATCHES_TO_WITHDRAW_FROM })
    );

    await user.click(screen.getByRole('button', { name: 'Go to batch 2' }));
    await user.click(screen.getByRole('button', { name: 'Open withdrawal' }));

    // The empty result for batch 1 must not close the modal before batch 2's result arrives.
    expect(await waitForDialog()).toBeInTheDocument();
    expect(await screen.findByText('STOCKED-002')).toBeInTheDocument();
    expect(screen.queryByText('EMPTY-001')).not.toBeInTheDocument();
  });

  it('checks again when reopened for a batch that was empty last time', async () => {
    let rows = [buildBatchSearchRow({ id: '1', batchNumber: 'B-001' }, { readyQuantity: 0 })];
    mockModalData();
    server.use(http.post('/api/v1/search', () => HttpResponse.json({ status: 'ok', results: rows })));
    const { user, store } = renderWithProviders(<AlwaysMountedHost initiallyOpen={false} />);

    await user.click(screen.getByRole('button', { name: 'Open withdrawal' }));
    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ msg: strings.NO_BATCHES_TO_WITHDRAW_FROM })
    );

    // Stock added somewhere this page doesn't know about, such as another session.
    rows = [buildBatchSearchRow({ id: '1', batchNumber: 'B-001' }, { readyQuantity: 10 })];
    await user.click(screen.getByRole('button', { name: 'Open withdrawal' }));

    expect(await waitForDialog()).toBeInTheDocument();
    expect(await screen.findByText('B-001')).toBeInTheDocument();
  });

  it('keeps the success message after the user dismisses the empty-batch notice', async () => {
    let rows = [buildBatchSearchRow({ id: '1' }, { readyQuantity: 3 })];
    mockModalData();
    server.use(
      http.post('/api/v1/search', () => HttpResponse.json({ status: 'ok', results: rows })),
      http.post(WITHDRAWALS_URL, () => {
        rows = [buildBatchSearchRow({ id: '1' }, { readyQuantity: 0 })];
        return HttpResponse.json({ status: 'ok', withdrawal: { id: WITHDRAWAL_ID } });
      })
    );
    const { user, store } = renderWithProviders(<AlwaysMountedHost initiallyOpen />);

    await waitForDialog();
    await clickNextWhenEnabled(user);
    await typeQuantity(user, phaseInput(1, 'readyQuantityWithdrawn'), 3);
    await clickNextWhenEnabled(user);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));
    await user.click(await screen.findByRole('button', { name: strings.GOT_IT }));

    await waitFor(() => expect(screen.queryByText(strings.EMPTY_BATCHES_AFTER_WITHDRAW)).not.toBeInTheDocument());
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'success' });
  });
});

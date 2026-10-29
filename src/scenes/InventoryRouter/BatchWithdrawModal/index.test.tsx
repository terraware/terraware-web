import React from 'react';

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
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';
import { Organization } from 'src/types/Organization';

const WITHDRAWALS_URL = '/api/v1/nursery/withdrawals';
const PHOTOS_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos';
const WITHDRAWAL_ID = 900;

const NURSERY_A = buildFacility({ id: 100, name: 'North Nursery' });
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

  it('tells the user there is nothing to withdraw when every selected batch is empty', async () => {
    mockModalData({ batches: [buildBatchSearchRow({ id: '1' }, { readyQuantity: 0 })] });
    const { store } = renderModal();

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.NO_BATCHES_TO_WITHDRAW_FROM,
      })
    );
  });
});

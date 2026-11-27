import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import strings from 'src/strings';
import { captureRequests, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

beforeAll(() => {
  // The purpose step renders truncated text areas that observe their own size; jsdom has no
  // ResizeObserver, so provide a no-op to keep the form from crashing.
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      observe() {
        return undefined;
      }
      unobserve() {
        return undefined;
      }
      disconnect() {
        return undefined;
      }
    };
  }
});

const SEARCH_URL = '/api/v1/search';
const CREATE_WITHDRAWAL_URL = '/api/v1/nursery/withdrawals';
// Path pattern (MSW :param) matched against the concrete id the component builds from the response.
const UPLOAD_PHOTO_URL = '/api/v1/nursery/withdrawals/:withdrawalId/photos';

const WITHDRAWAL_ID = 999;

// The single batch drives BatchWithdrawFlow down its one-batch path, which skips the "select
// batches" step and goes straight from purpose to photos. facility_id matches the nursery in the
// default test organization so the nursery is auto-selected.
const BATCH = {
  id: '10',
  batchNumber: 'B-001',
  addedDate: '2026-01-01',
  facility_id: '100',
  facility_name: 'Test Nursery',
  species_id: '1',
  species_scientificName: 'Acacia koa',
  species_commonName: '',
  germinatingQuantity: '0',
  'germinatingQuantity(raw)': 0,
  activeGrowthQuantity: '0',
  'activeGrowthQuantity(raw)': 0,
  hardeningOffQuantity: '0',
  'hardeningOffQuantity(raw)': 0,
  readyQuantity: '100',
  'readyQuantity(raw)': 100,
  totalQuantity: '100',
  'totalQuantity(raw)': 100,
  project_id: '',
  project_name: '',
  version: '1',
};

const mockFlowDependencies = (customPurposes: WithdrawalCustomPurposePayload[] = []) => {
  // Batches the flow opens with (POST /api/v1/search via listBatchesByIds).
  mockPost(SEARCH_URL, { results: [BATCH] });
  // Reference data the purpose step loads on mount. Empty planting sites keeps "Out Plant"
  // disabled; a single-nursery org keeps "Nursery Transfer" disabled — so the purpose settles
  // where a valid single-batch quantity path exists without extra dropdown wiring.
  mockGet('/api/v1/tracking/sites', { sites: [] });
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/withdrawalCustomPurposes', { customPurposes });
};

describe('BatchWithdrawFlow photo upload', () => {
  it('uploads the attached photo to the created withdrawal after the withdrawal is saved', async () => {
    mockFlowDependencies();
    mockPost(CREATE_WITHDRAWAL_URL, {
      withdrawal: {
        id: WITHDRAWAL_ID,
        facilityId: 100,
        purpose: 'Dead',
        withdrawnDate: '2026-01-01',
        batchWithdrawals: [{ batchId: 10, readyQuantityWithdrawn: 5, activeGrowthQuantityWithdrawn: 0 }],
      },
    });
    const uploads = captureRequests('post', UPLOAD_PHOTO_URL, { id: 1 });

    const { user, container } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await screen.findByRole('radio', { name: strings.DEAD }));

    const readyInput = await waitFor(() => {
      const el = container.querySelector('#readyQuantityWithdrawn input');
      if (!el) {
        throw new Error('ready-to-plant quantity field not rendered');
      }
      return el as HTMLInputElement;
    });
    await user.clear(readyInput);
    await user.type(readyInput, '5');

    await user.click(screen.getByRole('button', { name: strings.NEXT }));

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput, file);

    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(uploads).toHaveLength(1));

    expect(uploads[0].url).toContain(`/withdrawals/${WITHDRAWAL_ID}/photos`);
    expect(uploads[0].method).toBe('POST');
  });

  it('does not upload anything when the withdrawal is completed without a photo', async () => {
    mockFlowDependencies();
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, {
      withdrawal: {
        id: WITHDRAWAL_ID,
        facilityId: 100,
        purpose: 'Dead',
        withdrawnDate: '2026-01-01',
        batchWithdrawals: [{ batchId: 10, readyQuantityWithdrawn: 5, activeGrowthQuantityWithdrawn: 0 }],
      },
    });
    const uploads = captureRequests('post', UPLOAD_PHOTO_URL, { id: 1 });

    const { user, container } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await screen.findByRole('radio', { name: strings.DEAD }));

    const readyInput = await waitFor(() => {
      const el = container.querySelector('#readyQuantityWithdrawn input');
      if (!el) {
        throw new Error('ready-to-plant quantity field not rendered');
      }
      return el as HTMLInputElement;
    });
    await user.clear(readyInput);
    await user.type(readyInput, '5');

    await user.click(screen.getByRole('button', { name: strings.NEXT }));
    await user.click(await screen.findByRole('button', { name: strings.WITHDRAW }));

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    expect(uploads).toHaveLength(0);
  });
});

describe('BatchWithdrawFlow naming an Other withdrawal', () => {
  const SAVED_PURPOSES: WithdrawalCustomPurposePayload[] = [{ id: 1, name: 'Sale', isArchived: false }];

  const customPurposeField = () => screen.getByPlaceholderText(strings.ENTER_OR_SELECT);
  const findCustomPurposeField = () => screen.findByPlaceholderText(strings.ENTER_OR_SELECT);

  const withdrawFiveSeedlings = async (user: UserEvent, container: HTMLElement) => {
    const readyInput = await waitFor(() => {
      const el = container.querySelector('#readyQuantityWithdrawn input');
      if (!el) {
        throw new Error('ready-to-plant quantity field not rendered');
      }
      return el as HTMLInputElement;
    });
    await user.clear(readyInput);
    await user.type(readyInput, '5');
    await user.click(screen.getByRole('button', { name: strings.NEXT }));
    await user.click(await screen.findByRole('button', { name: strings.WITHDRAW }));
  };

  it('sends the name the user picked, and treats naming a purpose as choosing Other', async () => {
    mockFlowDependencies(SAVED_PURPOSES);
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, {
      withdrawal: { id: WITHDRAWAL_ID, facilityId: 100, purpose: 'Other', withdrawnDate: '2026-01-01' },
    });

    const { user, container } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await findCustomPurposeField());
    await user.click(await screen.findByRole('option', { name: 'Sale' }));

    expect(screen.getByRole('radio', { name: strings.OTHER_COLON })).toBeChecked();

    await withdrawFiveSeedlings(user, container);

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    expect(await withdrawals[0].json()).toMatchObject({ purpose: 'Other', customPurpose: 'Sale' });
  });

  it('stays on the purpose step while the name is longer than the server accepts', async () => {
    mockFlowDependencies(SAVED_PURPOSES);
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, {
      withdrawal: { id: WITHDRAWAL_ID, facilityId: 100, purpose: 'Other', withdrawnDate: '2026-01-01' },
    });

    const { user } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await findCustomPurposeField());
    await user.paste('S'.repeat(51));
    await user.click(screen.getByRole('button', { name: strings.NEXT }));

    // The name the field shows is the name that would be saved, so the step holds until it fits.
    expect(
      await screen.findByText(strings.formatString(strings.NAME_MAXIMUM_LENGTH_X, 50) as string)
    ).toBeInTheDocument();
    expect(customPurposeField()).toHaveValue('S'.repeat(51));
    expect(withdrawals).toHaveLength(0);
  });

  it('drops a name the user typed before switching to another purpose', async () => {
    mockFlowDependencies(SAVED_PURPOSES);
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, {
      withdrawal: { id: WITHDRAWAL_ID, facilityId: 100, purpose: 'Dead', withdrawnDate: '2026-01-01' },
    });

    const { user, container } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await findCustomPurposeField());
    await user.paste('Sale');
    await user.click(screen.getByRole('radio', { name: strings.DEAD }));

    await waitFor(() => expect(customPurposeField()).toHaveValue(''));

    await withdrawFiveSeedlings(user, container);

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    const body = await withdrawals[0].json();
    expect(body).toMatchObject({ purpose: 'Dead' });
    expect(body).not.toHaveProperty('customPurpose');
  });

  it('sends no name when the user chooses Other and leaves the field blank', async () => {
    mockFlowDependencies(SAVED_PURPOSES);
    const withdrawals = captureRequests('post', CREATE_WITHDRAWAL_URL, {
      withdrawal: { id: WITHDRAWAL_ID, facilityId: 100, purpose: 'Other', withdrawnDate: '2026-01-01' },
    });

    const { user, container } = renderWithProviders(<BatchWithdrawFlow batchIds={[10]} />);

    await user.click(await screen.findByRole('radio', { name: strings.OTHER_COLON }));
    await withdrawFiveSeedlings(user, container);

    await waitFor(() => expect(withdrawals).toHaveLength(1));
    const body = await withdrawals[0].json();
    expect(body).toMatchObject({ purpose: 'Other' });
    expect(body).not.toHaveProperty('customPurpose');
  });
});

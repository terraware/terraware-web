import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import UndoWithdrawalModal from 'src/scenes/NurseryRouter/UndoWithdrawalModal';
import strings from 'src/strings';
import { buildWithdrawalRow, captureRequests, mockError, mockPost, renderWithProviders } from 'src/test-utils';

const WITHDRAWAL_ID = 500;
const UNDO_URL = `/api/v1/nursery/withdrawals/${WITHDRAWAL_ID}/undo`;

const row = buildWithdrawalRow({ withdrawalId: WITHDRAWAL_ID });

describe('UndoWithdrawalModal', () => {
  it('asks for confirmation before doing anything', () => {
    renderWithProviders(<UndoWithdrawalModal row={row} onClose={() => undefined} />);

    expect(screen.getByText(strings.UNDO_WITHDRAWAL_CONFIRMATION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UNDO_WITHDRAWAL })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.CANCEL })).toBeInTheDocument();
  });

  it('closes without calling the API when cancelled', async () => {
    // Registered so that a stray call would be recorded rather than merely erroring, which lets the
    // assertion below distinguish "never called" from "called and failed".
    const requests = captureRequests('post', UNDO_URL);

    let closed = false;
    const { user } = renderWithProviders(<UndoWithdrawalModal row={row} onClose={() => (closed = true)} />);

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(closed).toBe(true);
    expect(requests).toHaveLength(0);
  });

  it('posts the undo to the withdrawal being undone', async () => {
    const requests = captureRequests('post', UNDO_URL);

    const { user } = renderWithProviders(<UndoWithdrawalModal row={row} onClose={() => undefined} />);
    await user.click(screen.getByRole('button', { name: strings.UNDO_WITHDRAWAL }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].url).toContain(`/withdrawals/${WITHDRAWAL_ID}/undo`);
    expect(requests[0].method).toBe('POST');
  });

  it('confirms success and closes the modal', async () => {
    mockPost(UNDO_URL);

    let closed = false;
    const { user, store } = renderWithProviders(<UndoWithdrawalModal row={row} onClose={() => (closed = true)} />);

    await user.click(screen.getByRole('button', { name: strings.UNDO_WITHDRAWAL }));

    await waitFor(() => expect(closed).toBe(true));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      title: strings.WITHDRAWAL_UNDONE,
    });
  });

  it('keeps the modal open and reports the failure when the undo fails', async () => {
    mockError('post', UNDO_URL);

    let closed = false;
    const { user, store } = renderWithProviders(<UndoWithdrawalModal row={row} onClose={() => (closed = true)} />);

    await user.click(screen.getByRole('button', { name: strings.UNDO_WITHDRAWAL }));

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
    });

    // The important half: closing on failure would tell the user the withdrawal was undone when it
    // was not, and the table behind the modal would still show it.
    expect(closed).toBe(false);
    expect(screen.getByText(strings.UNDO_WITHDRAWAL_CONFIRMATION)).toBeInTheDocument();
  });
});

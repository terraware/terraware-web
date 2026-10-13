import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';

import ToastSnackbar from 'src/components/ToastSnackbar';
import { sendSnackbar } from 'src/redux/features/snackbar/snackbarSlice';
import { renderWithProviders } from 'src/test-utils';
import { ToastOptions } from 'src/types/Snackbar';

const MESSAGE = 'Your file was uploaded';
const OUTSIDE = 'Somewhere else on the page';

const renderWithToast = (options?: ToastOptions) => {
  const result = renderWithProviders(
    <>
      <p>{OUTSIDE}</p>
      <ToastSnackbar />
    </>
  );
  act(() => {
    result.store.dispatch(sendSnackbar({ msg: MESSAGE, priority: 'info', type: 'toast', ...options }));
  });
  return result;
};

describe('ToastSnackbar', () => {
  it('does not offer a close button on a toast that hides itself', async () => {
    renderWithToast();

    expect(await screen.findByText(MESSAGE)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closes a toast that hides itself when the user clicks elsewhere', async () => {
    const { user } = renderWithToast();
    await screen.findByText(MESSAGE);

    await user.click(screen.getByText(OUTSIDE));

    await waitFor(() => expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument());
  });

  it('keeps a persistent toast open when the user clicks elsewhere', async () => {
    const { user } = renderWithToast({ autoHideDuration: null });
    await screen.findByText(MESSAGE);

    await user.click(screen.getByText(OUTSIDE));

    expect(screen.getByText(MESSAGE)).toBeInTheDocument();
  });

  it('closes a persistent toast when the user clicks its close button', async () => {
    const { user } = renderWithToast({ autoHideDuration: null });
    await screen.findByText(MESSAGE);

    await user.click(screen.getByRole('button'));

    await waitFor(() => expect(screen.queryByText(MESSAGE)).not.toBeInTheDocument());
  });
});

import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { captureRequests, dialogTitled, mockError, renderWithProviders, server } from 'src/test-utils';

import DeleteViewModal from './DeleteViewModal';

const VIEW = { id: 42, name: 'Retired only' };
const DELETE_PATH = `/api/v1/users/me/savedTableViews/${VIEW.id}`;

const deleteButton = () => screen.getByRole('button', { name: strings.DELETE_VIEW });
const cancelButton = () => screen.getByRole('button', { name: strings.CANCEL });
const closeIconButton = () => within(dialogTitled(strings.DELETE_VIEW_TITLE)).getByRole('button', { name: '' });

describe('DeleteViewModal', () => {
  it('names the view being deleted in the confirmation', () => {
    renderWithProviders(<DeleteViewModal onClose={() => undefined} view={VIEW} />);

    expect(
      screen.getByText(strings.formatString(strings.DELETE_VIEW_CONFIRMATION, VIEW.name) as string)
    ).toBeInTheDocument();
  });

  it('deletes the view, reports success, and closes', async () => {
    const requests = captureRequests('delete', DELETE_PATH);
    const onClose = rstest.fn();
    const onDeleted = rstest.fn();
    const { store, user } = renderWithProviders(
      <DeleteViewModal onClose={onClose} onDeleted={onDeleted} view={VIEW} />
    );

    await user.click(deleteButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(requests).toHaveLength(1);
    expect(onDeleted).toHaveBeenCalledWith(VIEW.id);
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings.formatString(strings.SAVED_VIEW_DELETED, VIEW.name),
    });
  });

  it('keeps the modal open and reports the failure when the delete fails', async () => {
    mockError('delete', DELETE_PATH);
    const onClose = rstest.fn();
    const onDeleted = rstest.fn();
    const { store, user } = renderWithProviders(
      <DeleteViewModal onClose={onClose} onDeleted={onDeleted} view={VIEW} />
    );

    await user.click(deleteButton());

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
    expect(deleteButton()).toBeEnabled();
  });

  it('cannot be cancelled or closed while the delete is in flight', async () => {
    let respond: () => void = () => undefined;
    const responded = new Promise<void>((resolve) => (respond = resolve));
    server.use(
      http.delete(DELETE_PATH, async () => {
        await responded;
        return HttpResponse.json({ status: 'ok' });
      })
    );
    const onClose = rstest.fn();
    const { user } = renderWithProviders(<DeleteViewModal onClose={onClose} view={VIEW} />);

    await user.click(deleteButton());

    await waitFor(() => expect(deleteButton()).toBeDisabled());
    expect(cancelButton()).toBeDisabled();
    await user.click(closeIconButton());
    expect(onClose).not.toHaveBeenCalled();

    respond();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('closes without deleting when cancelled', async () => {
    const requests = captureRequests('delete', DELETE_PATH);
    const onClose = rstest.fn();
    const { user } = renderWithProviders(<DeleteViewModal onClose={onClose} view={VIEW} />);

    await user.click(cancelButton());

    expect(onClose).toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});

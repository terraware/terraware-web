import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { captureRequests, dialogTitled, mockError, renderWithProviders, server } from 'src/test-utils';

import SaveViewModal, { SaveViewModalProps } from './SaveViewModal';

const SAVED_VIEWS_PATH = '/api/v1/users/me/savedTableViews';
const ORG_ID = 7;
const TABLE_NAME = 'species';
const SETTINGS = { sorting: [{ id: 'name', desc: true }] };

const renderModal = (props: Partial<SaveViewModalProps> = {}) =>
  renderWithProviders(
    <SaveViewModal
      baseView='default'
      existingNames={['Active only']}
      onClose={() => undefined}
      open
      organizationId={ORG_ID}
      settings={SETTINGS}
      tableName={TABLE_NAME}
      {...props}
    />
  );

const nameField = () => screen.getByRole('textbox');
const saveButton = () => screen.getByRole('button', { name: strings.SAVE_VIEW_BUTTON });
const closeIconButton = () => within(dialogTitled(strings.SAVE_VIEW)).getByRole('button', { name: '' });

describe('SaveViewModal', () => {
  it('cannot save until the existing view names have loaded', async () => {
    const { user } = renderModal({ existingNames: undefined });

    await user.type(nameField(), 'New view');

    expect(saveButton()).toBeDisabled();
  });

  it('cannot save without a name, and shows no error before the name is edited', () => {
    renderModal();

    expect(saveButton()).toBeDisabled();
    expect(screen.queryByText(strings.VIEW_NAME_REQUIRED)).not.toBeInTheDocument();
  });

  it('asks for a name once the user clears it', async () => {
    const { user } = renderModal();

    await user.type(nameField(), 'x');
    await user.clear(nameField());

    expect(screen.getByText(strings.VIEW_NAME_REQUIRED)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('rejects a name that matches an existing view regardless of case and trailing spaces', async () => {
    const { user } = renderModal();

    await user.type(nameField(), 'ACTIVE only  ');

    expect(screen.getByText(strings.VIEW_NAME_EXISTS)).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it('allows saving a new unique name', async () => {
    const { user } = renderModal();

    await user.type(nameField(), 'Retired only');

    expect(saveButton()).toBeEnabled();
    expect(screen.queryByText(strings.VIEW_NAME_EXISTS)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.VIEW_NAME_REQUIRED)).not.toBeInTheDocument();
  });

  it('lists what the view will save when a summary is given', () => {
    renderModal({ summary: ['Sorted by name', '2 filters'] });

    expect(screen.getByText(strings.THIS_VIEW_SAVES)).toBeInTheDocument();
    expect(screen.getByText('Sorted by name')).toBeInTheDocument();
    expect(screen.getByText('2 filters')).toBeInTheDocument();
  });

  it('omits the summary heading when there is no summary', () => {
    renderModal();

    expect(screen.queryByText(strings.THIS_VIEW_SAVES)).not.toBeInTheDocument();
  });

  it('tells the user saved views are private', () => {
    renderModal();

    expect(screen.getByText(strings.SAVED_VIEWS_PRIVATE)).toBeInTheDocument();
  });

  it('creates the view with a trimmed name, reports success, and closes', async () => {
    const requests = captureRequests('post', SAVED_VIEWS_PATH, { id: 99 });
    const onClose = rstest.fn();
    const onSaved = rstest.fn();
    const { store, user } = renderModal({ onClose, onSaved });

    await user.type(nameField(), 'Retired only  ');
    await user.click(saveButton());

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toEqual({
      baseView: 'default',
      name: 'Retired only',
      organizationId: ORG_ID,
      settings: SETTINGS,
      tableName: TABLE_NAME,
    });
    expect(onSaved).toHaveBeenCalledWith(99);
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings.formatString(strings.SAVED_VIEW_CREATED, 'Retired only'),
    });
  });

  it('keeps the modal open and reports the failure when saving fails', async () => {
    mockError('post', SAVED_VIEWS_PATH);
    const onClose = rstest.fn();
    const onSaved = rstest.fn();
    const { store, user } = renderModal({ onClose, onSaved });

    await user.type(nameField(), 'Retired only');
    await user.click(saveButton());

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
    expect(nameField()).toHaveValue('Retired only');
  });

  it('shows a busy skrim and cannot be closed while the save is in flight', async () => {
    let respond: () => void = () => undefined;
    const responded = new Promise<void>((resolve) => (respond = resolve));
    server.use(
      http.post(SAVED_VIEWS_PATH, async () => {
        await responded;
        return HttpResponse.json({ id: 99, status: 'ok' });
      })
    );
    const onClose = rstest.fn();
    const onSaved = rstest.fn();
    const { user } = renderModal({ onClose, onSaved });

    await user.type(nameField(), 'Retired only');
    await user.click(saveButton());

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    await user.click(closeIconButton());
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    expect(onClose).not.toHaveBeenCalled();

    respond();
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSaved).toHaveBeenCalledWith(99);
  });

  it('closes without saving when cancelled', async () => {
    const requests = captureRequests('post', SAVED_VIEWS_PATH, { id: 99 });
    const onClose = rstest.fn();
    const { user } = renderModal({ onClose });

    await user.type(nameField(), 'Retired only');
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});

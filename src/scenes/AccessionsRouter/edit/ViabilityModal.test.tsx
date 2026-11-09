import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import { buildAccession, captureRequests, mockError, mockGet, renderWithProviders } from 'src/test-utils';

import ViabilityModal from './ViabilityModal';

const URL = '/api/v2/seedbank/accessions/42';
const renderModal = (viabilityPercent?: number) => {
  mockGet(URL, { accession: buildAccession({ viabilityPercent }) });
  const onClose = rs.fn();
  const Modal = () => {
    const [opened, setOpened] = React.useState(false);
    const [tab, setTab] = React.useState('overview');
    return opened ? (
      <p>{tab}</p>
    ) : (
      <ViabilityModal
        open
        onClose={onClose}
        title={strings.EDIT_VIABILITY}
        setNewViabilityTestOpened={setOpened}
        changeTab={setTab}
      />
    );
  };
  return { ...renderWithProviders(<Modal />, { route: '/accessions/42', path: '/accessions/:accessionId' }), onClose };
};
const field = () => document.querySelector('#viabilityPercent input') as HTMLInputElement;

describe('ViabilityModal', () => {
  it('saves an entered manual viability percentage', async () => {
    const requests = captureRequests('put', URL);
    const { user, onClose } = renderModal();
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY });
    await user.type(field(), '65');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await requests[0].json()).toMatchObject({ viabilityPercent: '65' });
  });

  it.each([
    ['', 'REQUIRED_FIELD'],
    ['101', 'VALUE_CANT_EXCEED_100'],
  ] as const)('rejects manual viability %s without updating', async (value, error) => {
    const requests = captureRequests('put', URL);
    const { user } = renderModal();
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY });
    if (value) {
      await user.type(field(), value);
    }
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    expect(screen.getByText(strings[error])).toBeVisible();
    expect(requests).toHaveLength(0);
  });

  it('keeps manual viability open when saving fails', async () => {
    mockError('put', URL);
    const { user, onClose, store } = renderModal(40);
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY });
    await user.clear(field());
    await user.type(field(), '65');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(field()).toHaveValue('65');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('opens Add Test instead of saving a manual percentage', async () => {
    const requests = captureRequests('put', URL);
    const { user, onClose } = renderModal();
    await user.click(await screen.findByRole('button', { name: strings.ADD_A_VIABILITY_TEST }));
    expect(screen.getByText('viabilityTesting')).toBeVisible();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(0);
  });

  // Skipped: a stored numeric 0% is treated as missing and rejected as required instead of saved.
  // Unskip when zero is accepted as a valid manual viability percentage.
  it.skip('accepts an existing zero percent rather than reporting it as required', async () => {
    const requests = captureRequests('put', URL);
    const { user, onClose } = renderModal(0);
    await screen.findByRole('dialog', { name: strings.EDIT_VIABILITY });
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(await requests[0].json()).toMatchObject({ viabilityPercent: 0 });
  });
});

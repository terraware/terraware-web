import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildAccession,
  buildViabilityTest,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';
import { ViabilityTest } from 'src/types/Accession';

import ViabilityResultModal from './ViabilityResultModal';

const URL = '/api/v2/seedbank/accessions/42';
const renderModal = (overrides: Partial<ViabilityTest> = {}) => {
  mockGet(URL, { accession: buildAccession() });
  const onClose = rs.fn();
  return {
    ...renderWithProviders(
      <ViabilityResultModal
        open
        onClose={onClose}
        viabilityTest={buildViabilityTest({
          seedsTested: 25,
          testResults: [{ recordingDate: '2024-02-02', seedsGerminated: 8 }],
          ...overrides,
        })}
      />,
      { route: '/accessions/42', path: '/accessions/:accessionId' }
    ),
    onClose,
  };
};

describe('ViabilityResultModal', () => {
  it.each([
    [{}, '32%', 32],
    [{ testType: 'Cut', seedsTested: 20, seedsFilled: 12, seedsCompromised: 3 }, '75%', 75],
  ] as const)('applies the displayed result %s only on confirmation', async (test, label, percent) => {
    const requests = captureRequests('put', URL);
    const { user, onClose } = renderModal(test);
    expect(await screen.findByText(label)).toBeVisible();
    // Wait for the accession needed to apply the result, not just the test's static display.
    await waitFor(() => expect(screen.getByRole('button', { name: strings.APPLY_RESULT })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: strings.APPLY_RESULT }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(requests).toHaveLength(1);
    expect(await requests[0].json()).toMatchObject({ id: 42, viabilityPercent: percent });
  });

  it('cancels without changing accession viability', async () => {
    const requests = captureRequests('put', URL);
    const { user, onClose } = renderModal();
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(0);
  });

  it('keeps the result open when applying fails', async () => {
    mockError('put', URL);
    const { user, onClose, store } = renderModal();
    await screen.findByText('32%');
    await user.click(screen.getByRole('button', { name: strings.APPLY_RESULT }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('32%')).toBeVisible();
  });
});

import React from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import { buildAccession, buildViabilityTest, captureRequests, mockError, renderWithProviders } from 'src/test-utils';
import { ViabilityTest } from 'src/types/Accession';

import ViabilityResultModal from './ViabilityResultModal';

const URL = '/api/v2/seedbank/accessions/42';
const renderModal = (overrides: Partial<ViabilityTest> = {}) => {
  const loads = captureRequests('get', URL, { accession: buildAccession() });
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
    waitForAccession: async () => {
      await waitFor(() => expect(loads).toHaveLength(1));
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    },
  };
};

describe('ViabilityResultModal', () => {
  it.each([
    [{}, '32%', 32],
    [{ testType: 'Cut', seedsTested: 20, seedsFilled: 12, seedsCompromised: 3 }, '75%', 75],
  ] as const)('applies the displayed result %s only on confirmation', async (test, label, percent) => {
    const requests = captureRequests('put', URL);
    const { user, onClose, waitForAccession } = renderModal(test);
    expect(await screen.findByText(label)).toBeVisible();
    await waitForAccession();
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
    const { user, onClose, store, waitForAccession } = renderModal();
    await screen.findByText('32%');
    await waitForAccession();
    await user.click(screen.getByRole('button', { name: strings.APPLY_RESULT }));
    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('32%')).toBeVisible();
  });
});

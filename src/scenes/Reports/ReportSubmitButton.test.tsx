import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import strings from 'src/strings';
import {
  buildAcceleratorReport,
  captureRequests,
  dialogTitled,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import ReportSubmitButton from './ReportSubmitButton';

const REPORT_ID = 3;
const REPORT_URL = `/api/v1/accelerator/reports/${REPORT_ID}`;

const LoadedStatus = () => (
  <output aria-label='Loaded status'>{useOneAcceleratorReport(REPORT_ID).report?.status}</output>
);

const renderButton = () =>
  renderWithProviders(
    <>
      <LoadedStatus />
      <ReportSubmitButton reportId={REPORT_ID} />
    </>
  );

const submitButton = () => screen.getByRole('button', { name: strings.SUBMIT_FOR_APPROVAL });

describe('ReportSubmitButton', () => {
  beforeEach(() => {
    mockGet(REPORT_URL, { report: buildAcceleratorReport({ id: REPORT_ID, status: 'Not Submitted' }) });
  });

  it('submits the report after the user confirms', async () => {
    const requests = captureRequests('post', `${REPORT_URL}/submit`);
    const { user } = renderButton();

    await waitFor(() => expect(submitButton()).toBeEnabled());
    await user.click(submitButton());
    const dialog = dialogTitled(strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE);
    await user.click(within(dialog).getByRole('button', { name: strings.SUBMIT }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByText(strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE)).not.toBeInTheDocument();
  });

  it('does not submit the report when the user cancels', async () => {
    const requests = captureRequests('post', `${REPORT_URL}/submit`);
    const { user } = renderButton();

    await waitFor(() => expect(submitButton()).toBeEnabled());
    await user.click(submitButton());
    const dialog = dialogTitled(strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE);
    await user.click(within(dialog).getByRole('button', { name: strings.CANCEL }));

    expect(screen.queryByText(strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE)).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it.each(['Submitted', 'Approved', 'Not Needed'] as const)(
    'cannot be submitted when the report is %s',
    async (status) => {
      mockGet(REPORT_URL, { report: buildAcceleratorReport({ id: REPORT_ID, status }) });
      renderButton();

      await waitFor(() => expect(screen.getByRole('status', { name: 'Loaded status' })).toHaveTextContent(status));
      expect(submitButton()).toBeDisabled();
    }
  );

  it('can be resubmitted when the report needs an update', async () => {
    mockGet(REPORT_URL, { report: buildAcceleratorReport({ id: REPORT_ID, status: 'Needs Update' }) });
    renderButton();

    await waitFor(() => expect(submitButton()).toBeEnabled());
  });

  it('shows an error when submitting fails', async () => {
    mockError('post', `${REPORT_URL}/submit`);
    const { store, user } = renderButton();

    await waitFor(() => expect(submitButton()).toBeEnabled());
    await user.click(submitButton());
    const dialog = dialogTitled(strings.SUBMIT_ACCELERATOR_REPORT_MESSAGE);
    await user.click(within(dialog).getByRole('button', { name: strings.SUBMIT }));

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
  });
});

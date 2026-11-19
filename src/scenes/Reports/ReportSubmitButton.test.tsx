import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { buildAcceleratorReport, captureRequests, dialogTitled, mockGet, renderWithProviders } from 'src/test-utils';

import ReportSubmitButton from './ReportSubmitButton';

const REPORT_ID = 3;
const REPORT_URL = `/api/v1/accelerator/reports/${REPORT_ID}`;

const renderButton = () => renderWithProviders(<ReportSubmitButton reportId={REPORT_ID} />);

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
});

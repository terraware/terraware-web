import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildAcceleratorAdmin,
  buildAcceleratorReport,
  buildUser,
  captureRequests,
  dialogTitled,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import ReportReviewButtons from './ReportReviewButtons';

const REPORT_ID = 3;
const REPORT_URL = `/api/v1/accelerator/reports/${REPORT_ID}`;

const renderButtons = (user = buildAcceleratorAdmin()) =>
  renderWithProviders(<ReportReviewButtons reportId={REPORT_ID} />, { currentUser: { user } });

const approveButton = () => screen.getByRole('button', { name: strings.APPROVE });
const requestUpdateButton = () => screen.getByRole('button', { name: strings.REQUEST_UPDATE_ACTION });

describe('ReportReviewButtons', () => {
  beforeEach(() => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({ highlights: 'Great quarter', id: REPORT_ID, status: 'Submitted' }),
    });
  });

  it('approves the report after the user confirms', async () => {
    const requests = captureRequests('post', `${REPORT_URL}/review`);
    const { user } = renderButtons();

    await waitFor(() => expect(approveButton()).toBeEnabled());
    await user.click(approveButton());
    const dialog = dialogTitled(strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_REPORT);
    await user.click(within(dialog).getByRole('button', { name: strings.APPROVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({ review: { highlights: 'Great quarter', status: 'Approved' } });
    await waitFor(() =>
      expect(screen.queryByText(strings.YOU_ARE_ABOUT_TO_APPROVE_THIS_REPORT)).not.toBeInTheDocument()
    );
  });

  it('requires feedback before requesting an update', async () => {
    const requests = captureRequests('post', `${REPORT_URL}/review`);
    const { user } = renderButtons();

    await waitFor(() => expect(requestUpdateButton()).toBeEnabled());
    await user.click(requestUpdateButton());
    const dialog = dialogTitled(strings.REQUEST_UPDATE_REASON);
    await user.click(within(dialog).getByRole('button', { name: strings.REQUEST_UPDATE }));

    expect(within(dialog).getByText(strings.REQUIRED_FIELD)).toBeVisible();
    expect(requests).toHaveLength(0);

    await user.type(within(dialog).getByRole('textbox'), 'Please add photos');
    await user.click(within(dialog).getByRole('button', { name: strings.REQUEST_UPDATE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      review: { feedback: 'Please add photos', status: 'Needs Update' },
    });
    await waitFor(() => expect(screen.queryByText(strings.REQUEST_UPDATE_REASON)).not.toBeInTheDocument());
  });

  it('is hidden from users who cannot update submission status', () => {
    renderButtons(buildUser());

    expect(screen.queryByRole('button', { name: strings.APPROVE })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.REQUEST_UPDATE_ACTION })).not.toBeInTheDocument();
  });
});

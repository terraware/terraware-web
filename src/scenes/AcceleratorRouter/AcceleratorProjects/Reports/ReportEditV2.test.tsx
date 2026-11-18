import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { screen, waitFor, within } from '@testing-library/react';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import {
  buildAcceleratorAdmin,
  buildAcceleratorReport,
  buildReportIndicator,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import ReportEditV2 from './ReportEditV2';

const PROJECT_ID = 2;
const REPORT_ID = 3;
const REPORT_URL = `/api/v1/accelerator/reports/${REPORT_ID}`;
const EDIT_PATH = `${APP_PATHS.ACCELERATOR_PROJECT_REPORTS}/:reportId/edit`;

const Location = () => {
  const location = useLocation();
  return <output aria-label='Location'>{`${location.pathname}${location.search}`}</output>;
};

const renderEdit = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path={EDIT_PATH} element={<ReportEditV2 />} />
        <Route path='*' element={null} />
      </Routes>
      <Location />
    </>,
    {
      currentUser: { user: buildAcceleratorAdmin() },
      route: EDIT_PATH.replace(':projectId', `${PROJECT_ID}`).replace(':reportId', `${REPORT_ID}`),
    }
  );

const textfield = (container: HTMLElement, label: string) =>
  within(within(container).getByText(label).parentElement!).getByRole('textbox');

describe('ReportEditV2', () => {
  it('saves the report review and indicator entries, then returns to the project reports', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({
        id: REPORT_ID,
        highlights: 'Old highlights',
        projectId: PROJECT_ID,
        projectIndicators: [buildReportIndicator({ id: 11, name: 'Hectares under restoration' })],
        status: 'Submitted',
      }),
    });
    const reviews = captureRequests('post', `${REPORT_URL}/review`);
    const indicatorReviews = captureRequests('post', `${REPORT_URL}/indicators/review`);

    const { store, user } = renderEdit();

    const highlights = await screen.findByDisplayValue('Old highlights');
    await user.clear(highlights);
    await user.type(highlights, 'New highlights');

    const row = screen.getByText('Hectares under restoration').closest<HTMLElement>('[data-scroll-anchor]')!;
    await user.click(within(row).getByRole('button'));
    await user.type(textfield(row, strings.NOTES_TO_FUNDER), 'Ahead of schedule');

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(reviews).toHaveLength(1));
    await waitFor(() => expect(indicatorReviews).toHaveLength(1));
    expect(await reviews[0].json()).toMatchObject({
      review: { highlights: 'New highlights', status: 'Submitted' },
    });
    expect(await indicatorReviews[0].json()).toMatchObject({
      projectIndicators: [{ id: 11, progressNotes: 'Ahead of schedule' }],
    });
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(
        `/accelerator/projects/${PROJECT_ID}?tab=reports&reportId=${REPORT_ID}`
      )
    );
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings.CHANGES_SAVED,
    });
  });

  it('stays in the editor and shows an error when saving the indicator entries fails', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({
        highlights: 'Old highlights',
        id: REPORT_ID,
        projectId: PROJECT_ID,
        status: 'Submitted',
      }),
    });
    const reviews = captureRequests('post', `${REPORT_URL}/review`);
    mockError('post', `${REPORT_URL}/indicators/review`);

    const { store, user } = renderEdit();

    await screen.findByDisplayValue('Old highlights');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(reviews).toHaveLength(1);
    expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(
      `/accelerator/projects/${PROJECT_ID}/reports/${REPORT_ID}/edit`
    );
  });
});

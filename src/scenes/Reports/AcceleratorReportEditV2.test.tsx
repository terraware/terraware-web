import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { screen, waitFor, within } from '@testing-library/react';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import {
  buildAcceleratorReport,
  buildReportIndicator,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import AcceleratorReportEditV2 from './AcceleratorReportEditV2';

const REPORT_ID = 3;
const REPORT_URL = `/api/v1/accelerator/reports/${REPORT_ID}`;

const Location = () => {
  const location = useLocation();
  return <output aria-label='Location'>{location.pathname}</output>;
};

const renderEdit = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route path={APP_PATHS.REPORTS_EDIT} element={<AcceleratorReportEditV2 />} />
        <Route path='*' element={null} />
      </Routes>
      <Location />
    </>,
    { route: APP_PATHS.REPORTS_EDIT.replace(':reportId', `${REPORT_ID}`) }
  );

const expandIndicator = async (user: ReturnType<typeof renderEdit>['user'], name: string) => {
  const row = screen.getByText(name).closest<HTMLElement>('[data-scroll-anchor]')!;
  await user.click(within(row).getByRole('button'));
  return row;
};

const textfield = (container: HTMLElement, label: string) =>
  within(within(container).getByText(label).parentElement!).getByRole('textbox');

describe('AcceleratorReportEditV2', () => {
  it('saves the edited highlights and indicator progress, then returns to the report', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({
        id: REPORT_ID,
        highlights: 'Old highlights',
        projectIndicators: [buildReportIndicator({ id: 11, name: 'Hectares under restoration', value: 10 })],
      }),
    });
    const requests = captureRequests('post', REPORT_URL);

    const { store, user } = renderEdit();

    const highlights = await screen.findByDisplayValue('Old highlights');
    await user.clear(highlights);
    await user.type(highlights, 'New highlights');

    const row = await expandIndicator(user, 'Hectares under restoration');
    const value = within(row).getByRole('spinbutton');
    await user.clear(value);
    await user.type(value, '42');
    await user.type(textfield(row, strings.PROJECTS_COMMENTS), 'Second nursery opened');

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      highlights: 'New highlights',
      projectIndicators: [{ id: 11, projectsComments: 'Second nursery opened', value: 42 }],
    });
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(`/reports/${REPORT_ID}`)
    );
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings.CHANGES_SAVED,
    });
  });

  it('applies indicator edits only to the edited indicator type', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({
        id: REPORT_ID,
        commonIndicators: [buildReportIndicator({ id: 5, name: 'Seedlings planted', refId: '1.1', value: 7 })],
        projectIndicators: [buildReportIndicator({ id: 5, name: 'Community trainings', refId: '1.2', value: 3 })],
      }),
    });
    const requests = captureRequests('post', REPORT_URL);

    const { user } = renderEdit();

    await screen.findByText('Community trainings');
    const row = await expandIndicator(user, 'Community trainings');
    const value = within(row).getByRole('spinbutton');
    await user.clear(value);
    await user.type(value, '9');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      commonIndicators: [{ id: 5, value: 7 }],
      projectIndicators: [{ id: 5, value: 9 }],
    });
  });

  it('does not save a challenge that is missing its mitigation plan', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({
        id: REPORT_ID,
        challenges: [{ challenge: 'Late rains', mitigationPlan: '' }],
      }),
    });
    const requests = captureRequests('post', REPORT_URL);

    const { user } = renderEdit();

    await screen.findByDisplayValue('Late rains');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    expect(await screen.findByText(strings.TEXT_REQUIRED_BOTH_FIELDS)).toBeVisible();
    expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(`/reports/${REPORT_ID}/edit`);
    expect(requests).toHaveLength(0);
  });

  it.each(['Submitted', 'Approved', 'Not Needed'] as const)(
    'leaves the editor when the report is %s',
    async (status) => {
      mockGet(REPORT_URL, { report: buildAcceleratorReport({ id: REPORT_ID, status }) });

      renderEdit();

      await waitFor(() =>
        expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(
          new RegExp(`^/reports/${REPORT_ID}$`)
        )
      );
    }
  );

  it('stays in the editor when the report needs an update', async () => {
    mockGet(REPORT_URL, {
      report: buildAcceleratorReport({ highlights: 'Needs more detail', id: REPORT_ID, status: 'Needs Update' }),
    });

    renderEdit();

    expect(await screen.findByDisplayValue('Needs more detail')).toBeVisible();
    expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(`/reports/${REPORT_ID}/edit`);
  });

  it('keeps the edits and shows an error when saving fails', async () => {
    mockGet(REPORT_URL, { report: buildAcceleratorReport({ highlights: 'Old highlights', id: REPORT_ID }) });
    mockError('post', REPORT_URL);

    const { store, user } = renderEdit();

    const highlights = await screen.findByDisplayValue('Old highlights');
    await user.clear(highlights);
    await user.type(highlights, 'Unsaved highlights');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(screen.getByRole('status', { name: 'Location' })).toHaveTextContent(`/reports/${REPORT_ID}/edit`);
    expect(screen.getByDisplayValue('Unsaved highlights')).toBeVisible();
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();
  });
});

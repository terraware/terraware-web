import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import EditSettings from './EditSettings';

const Location = () => {
  const location = useLocation();
  return (
    <output aria-label='Location'>
      {location.pathname}
      {location.search}
    </output>
  );
};

it.each(['create', 'update', 'error'])('blocks duplicate report settings saves (%s)', async (mode) => {
  mockGet('/build-version.txt');
  const url = '/api/v1/accelerator/projects/7/reports/configs';
  mockGet(url, {
    configs:
      mode === 'update'
        ? [
            {
              reportingStartDate: '2026-01-01',
              reportingEndDate: '2026-12-31',
              logframeUrl: 'https://example.com/logframe',
            },
          ]
        : [],
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: Request[] = [];
  server.use(
    http[mode === 'update' ? 'post' : 'put'](url, async ({ request }) => {
      requests.push(request.clone());
      await pending;
      return HttpResponse.json({ status: mode === 'error' ? 'error' : 'ok' }, { status: mode === 'error' ? 500 : 200 });
    })
  );
  const { user, store } = renderWithProviders(
    <>
      <EditSettings />
      <Location />
    </>,
    {
      route: '/accelerator/projects/7/report-settings',
      path: '/accelerator/projects/:projectId/*',
    }
  );
  const save = screen.getByRole('button', { name: strings.SAVE });
  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await waitFor(() => expect(save).toBeEnabled());
  if (mode === 'update') {
    await screen.findByDisplayValue('https://example.com/logframe');
  }
  await user.click(save);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(save).toBeDisabled();
  expect(cancel).toBeDisabled();
  save.click();
  expect(requests).toHaveLength(1);
  release();
  await waitFor(() => expect(save).toBeEnabled());
  expect(cancel).toBeEnabled();
  if (mode === 'error') {
    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      })
    );
    expect(screen.getByLabelText('Location')).toHaveTextContent('/accelerator/projects/7/report-settings');
  } else {
    await waitFor(() =>
      expect(screen.getByLabelText('Location')).toHaveTextContent(
        '/accelerator/projects/7?tab=reports&reportsSegment=indicators'
      )
    );
  }
  expect(requests).toHaveLength(1);
});

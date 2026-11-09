import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import EventEdit from './EventEdit';

const Location = () => <output aria-label='Location'>{useLocation().pathname}</output>;

it('keeps an unchanged event list editable without sending a save request', async () => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/accelerator/modules/7', { module: { id: 7, name: 'Forestry' } });
  mockGet('/api/v1/accelerator/events', { events: [] });
  const { user } = renderWithProviders(<EventEdit />, {
    route: '/accelerator/modules/7/edit?type=live',
    path: '/accelerator/modules/:moduleId/*',
  });
  const save = screen.getByRole('button', { name: strings.SAVE });
  await user.click(save);
  expect(save).toBeEnabled();
  expect(screen.getByRole('button', { name: strings.CANCEL })).toBeEnabled();
});

it.each([true, false])('blocks event saves until the request finishes (success=%s)', async (success) => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/accelerator/modules/7', { module: { id: 7, name: 'Forestry' } });
  mockGet('/api/v1/accelerator/events', {
    events: [{ id: 42, type: 'Live Session', startTime: '2026-01-01T12:00:00Z' }],
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: Request[] = [];
  server.use(
    http.delete('/api/v1/accelerator/events/42', async ({ request }) => {
      requests.push(request.clone());
      await pending;
      return HttpResponse.json({ status: success ? 'ok' : 'error' }, { status: success ? 200 : 500 });
    })
  );
  const { user, store } = renderWithProviders(
    <>
      <EventEdit />
      <Location />
    </>,
    {
      route: '/accelerator/modules/7/edit?type=live',
      path: '/accelerator/modules/:moduleId/*',
    }
  );
  const row = await screen.findByRole('row', { name: /42/ });
  await user.click(within(row).getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: strings.REMOVE }));
  const save = screen.getByRole('button', { name: strings.SAVE });
  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await user.click(save);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(save).toBeDisabled();
  expect(cancel).toBeDisabled();
  save.click();
  expect(requests).toHaveLength(1);
  release();
  await waitFor(() => expect(save).toBeEnabled());
  expect(cancel).toBeEnabled();
  await waitFor(() =>
    expect(screen.getByLabelText('Location').textContent).toBe(
      success ? '/accelerator/modules/7' : '/accelerator/modules/7/edit'
    )
  );
  if (!success) {
    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.GENERIC_ERROR,
      })
    );
  }
  expect(requests).toHaveLength(1);
});

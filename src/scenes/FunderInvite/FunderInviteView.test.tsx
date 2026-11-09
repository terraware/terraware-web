import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import FunderInviteView from './FunderInviteView';

const Location = () => <output aria-label='Location'>{useLocation().pathname}</output>;

it('keeps an empty invitation editable without sending a request', async () => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/funder/entities/7', { fundingEntity: { id: 7, name: 'Test funder', projects: [] } });
  const { user } = renderWithProviders(<FunderInviteView />, {
    route: '/accelerator/funding-entities/7/invite',
    path: '/accelerator/funding-entities/:fundingEntityId/*',
  });
  const save = screen.getByRole('button', { name: strings.SEND });
  await user.click(save);
  expect(screen.getByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
  expect(save).toBeEnabled();
  expect(screen.getByRole('button', { name: strings.CANCEL })).toBeEnabled();
});

it.each([true, false])('blocks duplicate invitations until the request settles (success=%s)', async (success) => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/funder/entities/7', { fundingEntity: { id: 7, name: 'Test funder', projects: [] } });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: Request[] = [];
  server.use(
    http.post('/api/v1/funder/entities/7/users', async ({ request }) => {
      requests.push(request.clone());
      await pending;
      return HttpResponse.json({ status: success ? 'ok' : 'error' }, { status: success ? 200 : 500 });
    })
  );
  const { user, store } = renderWithProviders(
    <>
      <FunderInviteView />
      <Location />
    </>,
    {
      route: '/accelerator/funding-entities/7/invite',
      path: '/accelerator/funding-entities/:fundingEntityId/*',
    }
  );
  await user.type(document.querySelector('#email input') as HTMLInputElement, 'funder@example.com');
  const save = screen.getByRole('button', { name: strings.SEND });
  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await user.click(save);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(save).toBeDisabled();
  expect(cancel).toBeDisabled();
  save.click();
  expect(requests).toHaveLength(1);
  expect(await requests[0].json()).toEqual({ email: 'funder@example.com' });
  release();
  await waitFor(() => expect(save).toBeEnabled());
  expect(cancel).toBeEnabled();
  await waitFor(() =>
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: success ? 'success' : 'critical',
      msg: success ? strings.FUNDER_ADDED : strings.GENERIC_ERROR,
    })
  );
  await waitFor(() =>
    expect(screen.getByLabelText('Location').textContent).toBe(
      success ? '/accelerator/funding-entities/7' : '/accelerator/funding-entities/7/invite'
    )
  );
  expect(requests).toHaveLength(1);
});

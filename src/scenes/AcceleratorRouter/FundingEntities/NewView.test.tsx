import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, server } from 'src/test-utils';

import NewView from './NewView';

const Location = () => <output aria-label='Location'>{useLocation().pathname}</output>;

it.each([true, false])('blocks duplicate funding entity creation (success=%s)', async (success) => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/funder/projects', { projects: [] });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: Request[] = [];
  server.use(
    http.post('/api/v1/funder/entities', async ({ request }) => {
      requests.push(request.clone());
      await pending;
      return HttpResponse.json(
        { status: success ? 'ok' : 'error', fundingEntity: { id: 42 } },
        { status: success ? 200 : 500 }
      );
    })
  );
  const { user } = renderWithProviders(
    <>
      <NewView />
      <Location />
    </>,
    {
      route: '/accelerator/funding-entities/new',
      path: '/accelerator/funding-entities/*',
    }
  );
  const save = screen.getByRole('button', { name: strings.SAVE });
  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await waitFor(() => expect(save).toBeEnabled());
  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Forest fund');
  await user.click(save);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(save).toBeDisabled();
  expect(cancel).toBeDisabled();
  save.click();
  expect(requests).toHaveLength(1);
  expect(await requests[0].json()).toEqual({ name: 'Forest fund', projects: [] });
  release();
  await waitFor(() => expect(save).toBeEnabled());
  expect(cancel).toBeEnabled();
  await waitFor(() =>
    expect(screen.getByLabelText('Location').textContent).toBe(
      success ? '/accelerator/funding-entities/42' : '/accelerator/funding-entities/new'
    )
  );
  expect(requests).toHaveLength(1);
});

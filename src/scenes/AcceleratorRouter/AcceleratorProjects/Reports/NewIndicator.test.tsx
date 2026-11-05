import React from 'react';
import { useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { mockGet, renderWithProviders, selectDropdownOption, server } from 'src/test-utils';

import NewIndicator from './NewIndicator';

const Location = () => {
  const location = useLocation();
  return (
    <output aria-label='Location'>
      {location.pathname}
      {location.search}
    </output>
  );
};

it('keeps an empty indicator editable without sending a request', async () => {
  mockGet('/build-version.txt');
  const { user } = renderWithProviders(<NewIndicator />);
  const save = screen.getByRole('button', { name: strings.SAVE });
  await user.click(save);
  expect(screen.getAllByText(strings.REQUIRED_FIELD)).toHaveLength(2);
  expect(save).toBeEnabled();
  expect(screen.getByRole('button', { name: strings.CANCEL })).toBeEnabled();
});

it.each(['common', 'project', 'error'])('blocks duplicate indicator saves (%s)', async (kind) => {
  mockGet('/build-version.txt');
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requests: Request[] = [];
  const url =
    kind === 'project'
      ? '/api/v1/accelerator/projects/7/reports/indicators'
      : '/api/v1/accelerator/reports/commonIndicators';
  server.use(
    http.put(url, async ({ request }) => {
      requests.push(request.clone());
      await pending;
      return HttpResponse.json(
        { status: kind === 'error' ? 'error' : 'ok', id: 42 },
        { status: kind === 'error' ? 500 : 200 }
      );
    })
  );
  const { user, store } = renderWithProviders(
    <>
      <NewIndicator />
      <Location />
    </>,
    {
      route: '/accelerator/projects/7/new-indicator',
      path: '/accelerator/projects/:projectId/*',
    }
  );
  if (kind === 'project') {
    await selectDropdownOption(user, 'indicatorKind', strings.PROJECT_SPECIFIC);
  }
  await user.type(document.querySelector('#name input') as HTMLInputElement, 'Forest cover');
  await user.type(document.querySelector('#refId input') as HTMLInputElement, 'BIO-1');
  const save = screen.getByRole('button', { name: strings.SAVE });
  const cancel = screen.getByRole('button', { name: strings.CANCEL });
  await user.click(save);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(save).toBeDisabled();
  expect(cancel).toBeDisabled();
  save.click();
  expect(requests).toHaveLength(1);
  expect(await requests[0].json()).toMatchObject({ indicator: { name: 'Forest cover', refId: 'BIO-1' } });
  release();
  await waitFor(() => expect(save).toBeEnabled());
  expect(cancel).toBeEnabled();
  await waitFor(() =>
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: kind === 'error' ? 'critical' : 'success',
      msg:
        kind === 'error'
          ? strings.GENERIC_ERROR
          : kind === 'project'
            ? strings.PROJECT_INDICATOR_SAVED
            : strings.COMMON_INDICATOR_SAVED,
    })
  );
  expect(screen.getByLabelText('Location')).toHaveTextContent(
    kind === 'error'
      ? '/accelerator/projects/7/new-indicator'
      : '/accelerator/projects/7?tab=reports&reportsSegment=indicators'
  );
  expect(requests).toHaveLength(1);
});

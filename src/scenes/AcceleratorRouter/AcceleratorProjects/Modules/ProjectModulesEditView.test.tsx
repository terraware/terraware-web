import React from 'react';
import { useLocation } from 'react-router';

import { act, screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { buildAcceleratorAdmin, mockGet, renderWithProviders, server } from 'src/test-utils';

import ProjectModulesEditView from './ProjectModulesEditView';

const Location = () => <output aria-label='Location'>{useLocation().pathname}</output>;

it.each([true, false])('waits for every module request before unlocking the form (success=%s)', async (success) => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/projects/7', { project: { id: 7, name: 'Restoration' } });
  mockGet('/api/v1/accelerator/modules', { modules: [] });
  mockGet('/api/v1/accelerator/projects/7/modules', {
    modules: [1, 2].map((id) => ({
      id,
      title: `Module ${id}`,
      name: `Module ${id}`,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      eventDescriptions: {},
      isActive: true,
    })),
  });
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let receivedFastResponse!: () => void;
  const fastResponse = new Promise<void>((resolve) => {
    receivedFastResponse = resolve;
  });
  const onResponse = ({ request }: { request: Request }) => {
    if (request.method === 'DELETE' && request.url.endsWith('/modules/1')) {
      receivedFastResponse();
    }
  };
  server.events.on('response:mocked', onResponse);
  const requests: Request[] = [];
  server.use(
    http.delete('/api/v1/accelerator/projects/7/modules/:moduleId', async ({ request, params }) => {
      requests.push(request.clone());
      if (params.moduleId === '2') {
        await pending;
      }
      return HttpResponse.json(
        { status: success || params.moduleId === '2' ? 'ok' : 'error' },
        { status: success || params.moduleId === '2' ? 200 : 500 }
      );
    })
  );
  try {
    const { user, store } = renderWithProviders(
      <>
        <ProjectModulesEditView />
        <Location />
      </>,
      {
        route: '/accelerator/projects/7/edit-modules',
        path: '/accelerator/projects/:projectId/*',
        currentUser: { user: buildAcceleratorAdmin() },
      }
    );
    for (const id of [1, 2]) {
      await user.click(
        within(await screen.findByRole('row', { name: new RegExp(`Module ${id}`) })).getByRole('checkbox')
      );
    }
    await user.click(screen.getByRole('button', { name: strings.REMOVE }));
    const save = screen.getByRole('button', { name: strings.SAVE });
    const cancel = screen.getByRole('button', { name: strings.CANCEL });
    await user.click(save);
    await waitFor(() => expect(requests).toHaveLength(2));
    await act(async () => {
      await fastResponse;
    });
    expect(save).toBeDisabled();
    expect(cancel).toBeDisabled();
    save.click();
    expect(requests).toHaveLength(2);
    release();
    await waitFor(() => expect(save).toBeEnabled());
    expect(cancel).toBeEnabled();
    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: success ? 'success' : 'critical',
        msg: success ? strings.CHANGES_SAVED : strings.GENERIC_ERROR,
      })
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Location').textContent).toBe(
        success ? '/accelerator/projects/7' : '/accelerator/projects/7/edit-modules'
      )
    );
  } finally {
    release();
    server.events.removeListener('response:mocked', onResponse);
  }
});

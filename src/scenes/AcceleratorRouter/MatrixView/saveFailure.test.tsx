import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { useFeatureEnabled } from 'src/features';
import { buildUser, mockGet, mockPost, renderWithProviders, server } from 'src/test-utils';

import MatrixView from './index';

rs.mock('src/features', () => ({ useFeatureEnabled: rs.fn() }));

it.each([false, true])('keeps a failed Matrix edit open for retry (V2: %s)', async (enabled) => {
  rs.mocked(useFeatureEnabled).mockReturnValue(enabled);
  localStorage.clear();
  localStorage.setItem('matrixView-columnVisibility', JSON.stringify({ v: true }));
  const currentUser = buildUser({ globalRoles: ['Super-Admin'] });
  mockGet('/api/v1/users/me', { user: currentUser });
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/document-producer/variables', {
    variables: [
      {
        id: 2,
        stableId: 'v',
        name: 'Count',
        type: 'Number',
        decimalPlaces: 0,
        internalOnly: false,
        isList: false,
        isRequired: false,
      },
    ],
  });
  const project = {
    id: 1,
    name: 'Project',
    acceleratorDetails_dealName: 'Project',
    country_name: '',
    internalUsers: [],
    variables: [
      {
        id: '2',
        stableId: 'v',
        variableName: 'Count',
        type: 'Number',
        values: [{ variableValueId: '3', 'numberValue(raw)': 1 }],
      },
    ],
  };
  mockPost('/api/v1/search', { results: [project] });
  const requests: unknown[] = [];
  server.use(
    http.post('/api/v1/document-producer/projects/1/values', async ({ request }) => {
      requests.push(await request.json());
      if (requests.length === 1) {
        return HttpResponse.json({ status: 'error' }, { status: 500 });
      }
      project.variables[0].values[0]['numberValue(raw)'] = 5;
      return HttpResponse.json({ status: 'ok' });
    })
  );
  const { user, store } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await screen.findByRole('columnheader', { name: /Count/ });
  const row = await screen.findByRole('row', { name: /^Project(?:\s|$)/ });
  await user.dblClick(within(row).getAllByRole('cell').at(-1)!);
  const input = screen.getByRole('spinbutton');
  await user.clear(input);
  await user.type(input, '5{Enter}');
  await waitFor(() => expect(store.getState().snackbar.snackbars.toast?.priority).toBe('critical'));
  await waitFor(() => expect(input).toBeEnabled());
  expect(input).toHaveValue(5);
  expect(requests).toHaveLength(1);
  await user.type(input, '{Enter}');
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests).toEqual(
    Array(2).fill({
      operations: [{ operation: 'Update', valueId: 3, existingValueId: 3, value: { type: 'Number', numberValue: 5 } }],
      updateStatuses: false,
    })
  );
  await waitFor(() => expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument());
  expect(await screen.findByRole('cell', { name: '5' })).toBeVisible();
});

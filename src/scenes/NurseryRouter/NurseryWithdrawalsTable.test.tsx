import React from 'react';

import { getStrings } from '@terraware/web-components';
import { screen, waitFor } from '@testing-library/react';

import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { buildOrganization, buildUser, captureRequests, mockGet, mockPost, renderWithProviders } from 'src/test-utils';

import NurseryWithdrawalsTable from './NurseryWithdrawalsTable';

it('applies the planting date from the URL to both V2 list and export requests', async () => {
  const date = '2025-02-01';
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: { editableTableV2: true } });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/planting-seasons', { seasons: [] });
  mockPost('/api/v1/search/count', { count: 23 });
  mockPost('/api/v1/search/values', { results: {} });
  const requests = captureRequests('post', '/api/v1/search', { results: [] });
  const { user } = renderWithProviders(<NurseryWithdrawalsTable />, {
    route: `${APP_PATHS.NURSERY_WITHDRAWALS}?plantingDate=${date}`,
    organization: { selectedOrganization: buildOrganization({ id: 1 }) },
  });

  const dateCriteria = {
    operation: 'field',
    field: 'plantingDateRequest_date',
    type: 'Range',
    values: [date, date],
  };
  const expectRequest = async (count: number) => {
    await waitFor(async () => {
      const bodies = await Promise.all(requests.map((request) => request.clone().json()));
      expect(bodies).toContainEqual(
        expect.objectContaining({
          count,
          search: expect.objectContaining({ children: expect.arrayContaining([dateCriteria]) }),
        })
      );
    });
  };

  await expectRequest(100);
  await user.click(screen.getByRole('button', { name: /show.*hide filters/i }));
  const { FILTER, MIN } = getStrings();
  expect(await screen.findByLabelText(`${FILTER}: ${strings.PLANTING_DATE} ${MIN}`)).toHaveValue(date);
  await user.click(screen.getByRole('button', { name: strings.EXPORT }));
  await expectRequest(23);
});

it.each([false, true])('starts a new search on page one from page three (V2: %s)', async (editableTableV2) => {
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: { editableTableV2 } });
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/planting-seasons', { seasons: [] });
  mockPost('/api/v1/search/count', { count: 250 });
  mockPost('/api/v1/search/values', { results: {} });
  const requests = captureRequests('post', '/api/v1/search', { results: [] });
  const { user } = renderWithProviders(<NurseryWithdrawalsTable />, {
    organization: { selectedOrganization: buildOrganization({ id: 1 }) },
  });
  const nextPage = () => screen.getByRole('button', { name: /next page/i });
  const waitForPage = (cursor: string, term?: string) =>
    waitFor(async () => {
      const bodies = await Promise.all(requests.map((request) => request.clone().json()));
      expect(
        bodies.filter((body) => !term || JSON.stringify(body.search).includes(term)).map((body) => body.cursor)
      ).toContain(cursor);
    });

  await waitFor(() => expect(nextPage()).toBeEnabled());
  await user.click(nextPage());
  await waitForPage('100');
  await user.click(nextPage());
  await waitForPage('200');
  await user.click(screen.getByRole('button', { name: /show.*hide search/i }));
  await user.type(screen.getByPlaceholderText(/search/i), 'koa');
  await waitForPage('0', 'koa');
});

afterEach(() => localStorage.clear());

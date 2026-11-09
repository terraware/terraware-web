import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { act, renderHook, waitFor } from '@testing-library/react';

import { makeStore } from 'src/redux/store';
import { captureRequests } from 'src/test-utils';

import { useListInventoryPlanningSeasonsQuery } from './inventoryPlanning';
import { useLazyCountNurseryWithdrawalsQuery, useLazySearchNurseryWithdrawalsQuery } from './nurseries';
import { useLazySearchProjectInternalUserRolesQuery } from './organizationUsers';
import { useLazyCountSeedWithdrawalsQuery, useLazySearchSeedWithdrawalsQuery } from './seedWithdrawals';

const wrapper = ({ children }: PropsWithChildren) => <Provider store={makeStore()}>{children}</Provider>;

describe('raw enum search filters', () => {
  it('matches inventory planning seasons by exact raw status', async () => {
    const requests = captureRequests('post', '/api/v1/search', { results: [] });
    const { result } = renderHook(() => useListInventoryPlanningSeasonsQuery({ organizationId: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(await requests[0].json()).toMatchObject({
      search: {
        children: expect.arrayContaining([
          { operation: 'field', field: 'status(raw)', type: 'Exact', values: ['Active', 'Upcoming', 'Past End Date'] },
        ]),
      },
    });
  });

  it.each([
    ['nursery search', useLazySearchNurseryWithdrawalsQuery, '/api/v1/search', { results: [] }],
    ['nursery count', useLazyCountNurseryWithdrawalsQuery, '/api/v1/search/count', { count: 0 }],
    ['seed search', useLazySearchSeedWithdrawalsQuery, '/api/v1/search', { results: [] }],
    ['seed count', useLazyCountSeedWithdrawalsQuery, '/api/v1/search/count', { count: 0 }],
  ] as const)('%s matches raw purposes and omits empty purpose filters', async (_name, useQuery, url, response) => {
    const requests = captureRequests('post', url, response);
    const { result } = renderHook(() => useQuery(), { wrapper });

    await act(async () => {
      await result.current[0]({ organizationId: 1, purposes: ['Other'] });
    });
    expect(await requests[0].json()).toMatchObject({
      search: {
        children: expect.arrayContaining([
          { operation: 'field', field: 'purpose(raw)', type: 'Exact', values: ['Other'] },
        ]),
      },
    });

    await act(async () => {
      await result.current[0]({ organizationId: 1, purposes: [] });
    });
    const body = await requests[1].json();
    expect(JSON.stringify(body.search)).not.toContain('purpose');
  });

  it('matches project internal users by raw role', async () => {
    const requests = captureRequests('post', '/api/v1/search', { results: [] });
    const { result } = renderHook(() => useLazySearchProjectInternalUserRolesQuery(), { wrapper });

    await act(async () => {
      await result.current[0]({ organizationId: 1, roles: ['Project Lead'] });
    });
    expect(await requests[0].json()).toMatchObject({
      search: {
        children: expect.arrayContaining([
          { operation: 'field', field: 'role(raw)', type: 'Exact', values: ['Project Lead'] },
        ]),
      },
    });
  });
});

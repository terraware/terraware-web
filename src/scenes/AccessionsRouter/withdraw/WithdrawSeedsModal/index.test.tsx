import React from 'react';

import { rs } from '@rstest/core';
import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { buildOrganization, buildUser, mockGet, renderWithProviders, server } from 'src/test-utils';

import WithdrawSeedsModal from './index';

const GET_ACCESSION_URL = '/api/v2/seedbank/accessions/:accessionId';
const ORG_USERS_URL = '/api/v1/organizations/1/users';

describe('WithdrawSeedsModal', () => {
  it('closes and reports an error when the accessions fail to load', async () => {
    mockGet(ORG_USERS_URL, { users: [] });
    server.use(http.get(GET_ACCESSION_URL, () => HttpResponse.json({ status: 'error' }, { status: 500 })));

    const onClose = rs.fn();
    const { store } = renderWithProviders(
      <WithdrawSeedsModal open onClose={onClose} accessionIds={[1]} user={buildUser()} />,
      { organization: { selectedOrganization: buildOrganization() } }
    );

    // The failed load does not leave an empty, unclosable dialog: the modal closes itself and
    // surfaces the error so the parent (which owns `open`) can reset.
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' });
  });
});

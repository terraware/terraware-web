import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import strings from 'src/strings';
import { buildAccession, buildOrganization, buildUser, mockGet, renderWithProviders, server } from 'src/test-utils';

import WithdrawSeedsModal from './index';

const GET_ACCESSION_URL = '/api/v2/seedbank/accessions/:accessionId';
const ORG_USERS_URL = '/api/v1/organizations/1/users';

describe('WithdrawSeedsModal', () => {
  it('waits for the selected accession before offering withdrawal', async () => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const requests: Request[] = [];
    server.use(
      http.get(GET_ACCESSION_URL, async ({ request }) => {
        requests.push(request);
        await pending;
        return HttpResponse.json({ status: 'ok', accession: buildAccession({ id: 42, accessionNumber: 'ACC-042' }) });
      })
    );
    mockGet(ORG_USERS_URL, { users: [] });
    renderWithProviders(<WithdrawSeedsModal open onClose={() => undefined} accessionIds={[42]} user={buildUser()} />, {
      organization: { selectedOrganization: buildOrganization() },
    });
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByRole('button', { name: strings.NEXT })).not.toBeInTheDocument();
    release();
    expect(await screen.findByText('ACC-042')).toBeVisible();
    expect(screen.getByRole('button', { name: strings.NEXT })).toBeVisible();
    expect(requests[0].url).toContain('/accessions/42');
  });

  it('does not offer withdrawal for an empty selection', async () => {
    const onClose = rs.fn();
    renderWithProviders(<WithdrawSeedsModal open onClose={onClose} accessionIds={[]} user={buildUser()} />);
    expect(screen.getByRole('progressbar')).toBeVisible();
    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.NEXT })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

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

import React from 'react';

import { screen, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildAccession,
  buildOrganization,
  buildSeedBank,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';
import { Accession } from 'src/types/Accession';
import { Organization } from 'src/types/Organization';

import Accession2View from './Accession2View';

const renderView = (accession: Accession = buildAccession(), role: Organization['role'] = 'Owner') => {
  mockGet('/api/v2/seedbank/accessions/42', { accession });
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/organizations/:organizationId/users', { users: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockPost('/api/v1/events/list', { events: [] });
  mockPost('/api/v1/search', { results: [] });
  return renderWithProviders(<Accession2View />, {
    route: '/accessions/42',
    path: '/accessions/:accessionId',
    organization: { selectedOrganization: buildOrganization({ role, facilities: [buildSeedBank()] }) },
  });
};

// Overview cards have no region role or labelled edit buttons; scope by their visible title.
const card = (title: string) => {
  const box = screen.getByText(title).parentElement?.parentElement;
  if (!box) {
    throw new Error(`No overview card titled ${title}`);
  }
  return within(box);
};

describe('Accession2View quantity and status permissions', () => {
  beforeEach(() => sessionStorage.clear());

  it('hides quantity and status editing from contributors', async () => {
    renderView(buildAccession(), 'Contributor');
    await screen.findByText('24-1-1-001');
    expect(card(strings.STATUS).queryByRole('button')).not.toBeInTheDocument();
    expect(card(strings.QUANTITY).queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not offer quantity editing for used-up accessions', async () => {
    renderView(buildAccession({ state: 'Used Up', remainingQuantity: { quantity: 0, units: 'Seeds' } }));
    await screen.findByText('24-1-1-001');
    expect(card(strings.QUANTITY).queryByRole('button')).not.toBeInTheDocument();
    expect(card(strings.STATUS).getByRole('button')).toBeEnabled();
  });

  it('does not offer status editing before check-in', async () => {
    renderView(buildAccession({ state: 'Awaiting Check-In' }));
    await screen.findByText('24-1-1-001');
    expect(card(strings.STATUS).queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.CHECK_IN })).toBeVisible();
  });

  it('opens quantity editing from the quantity overview card', async () => {
    const { user } = renderView();
    await screen.findByText('24-1-1-001');
    await user.click(card(strings.QUANTITY).getByRole('button'));
    expect(await screen.findByRole('dialog', { name: strings.EDIT_QUANTITY })).toBeVisible();
    expect(screen.getByDisplayValue('100')).toBeVisible();
  });

  it('opens status editing from the status overview card', async () => {
    const { user } = renderView();
    await screen.findByText('24-1-1-001');
    await user.click(card(strings.STATUS).getByRole('button'));
    expect(await screen.findByRole('dialog', { name: strings.EDIT_STATUS })).toBeVisible();
  });

  it('offers the reminder while drying and opens its form', async () => {
    const { user } = renderView(buildAccession({ state: 'Drying' }));
    await screen.findByText('24-1-1-001');
    await user.click(card(strings.END_DRYING_REMINDER).getByRole('button'));
    expect(await screen.findByRole('dialog', { name: strings.END_DRYING_REMINDER })).toBeVisible();
  });

  it('does not offer a drying reminder while in storage', async () => {
    renderView();
    await screen.findByText('24-1-1-001');
    expect(screen.queryByText(strings.END_DRYING_REMINDER)).not.toBeInTheDocument();
  });

  it('hides drying reminder editing from contributors', async () => {
    renderView(buildAccession({ state: 'Drying' }), 'Contributor');
    await screen.findByText('24-1-1-001');
    expect(card(strings.END_DRYING_REMINDER).queryByRole('button')).not.toBeInTheDocument();
  });
});

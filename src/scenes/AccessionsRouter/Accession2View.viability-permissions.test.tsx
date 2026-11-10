import React from 'react';

import { screen, within } from '@testing-library/react';

import strings from 'src/strings';
import {
  buildAccession,
  buildOrganization,
  buildViabilityTest,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';
import { Accession } from 'src/types/Accession';
import { Organization } from 'src/types/Organization';

import Accession2View from './Accession2View';

const renderView = (accession: Partial<Accession> = {}, role: Organization['role'] = 'Manager') => {
  mockGet('/api/v2/seedbank/accessions/42', { accession: buildAccession({ estimatedCount: 100, ...accession }) });
  mockGet('/api/v1/species', { species: [] });
  mockGet('/api/v1/organizations/:organizationId/users', { users: [] });
  mockGet('/api/v1/projects', { projects: [] });
  mockPost('/api/v1/events/list', { events: [] });
  mockPost('/api/v1/search', { results: [] });
  return renderWithProviders(<Accession2View />, {
    route: '/accessions/42',
    path: '/accessions/:accessionId',
    organization: { selectedOrganization: buildOrganization({ role }) },
  });
};

describe('Accession2View viability permissions', () => {
  beforeEach(() => sessionStorage.clear());

  it.each(['Manager', 'Owner'] as const)('allows %s members to open Add Test', async (role) => {
    const { user } = renderView({}, role);
    await user.click(await screen.findByRole('tab', { name: strings.VIABILITY_TESTS }));
    await user.click(await screen.findByRole('button', { name: strings.ADD_TEST }));
    expect(await screen.findByRole('dialog', { name: strings.ADD_VIABILITY_TEST })).toBeVisible();
  });

  it.each([
    ['Contributor', {}, 'Contributor'],
    ['used-up accession', { state: 'Used Up' }, 'Manager'],
    ['missing estimated count', { estimatedCount: undefined }, 'Manager'],
  ] as const)('does not offer Add Test for %s', async (_reason, accession, role) => {
    const { user } = renderView(accession, role);
    await user.click(await screen.findByRole('tab', { name: strings.VIABILITY_TESTS }));
    expect(await screen.findByText(strings.VIABILITY_TESTS, { selector: 'p' })).toBeVisible();
    expect(screen.queryByRole('button', { name: strings.ADD_TEST })).not.toBeInTheDocument();
  });

  it('opens the selected test from the viability table with edit and delete actions for a manager', async () => {
    const { user } = renderView({ viabilityTests: [buildViabilityTest({ id: 77 }), buildViabilityTest({ id: 88 })] });
    await user.click(await screen.findByRole('tab', { name: strings.VIABILITY_TESTS }));
    await user.click(await screen.findByText('#88'));
    const dialog = await screen.findByRole('dialog', {
      name: strings.formatString(strings.VIABILITY_TEST_NUMBER, '88').toString(),
    });
    expect(within(dialog).getByRole('button', { name: strings.EDIT })).toBeVisible();
    expect(within(dialog).getByRole('button', { name: strings.DELETE })).toBeVisible();
  });

  it('allows contributors to view a selected test without edit or delete actions', async () => {
    const { user } = renderView({ viabilityTests: [buildViabilityTest({ id: 77 })] }, 'Contributor');
    await user.click(await screen.findByRole('tab', { name: strings.VIABILITY_TESTS }));
    await user.click(await screen.findByText('#77'));
    const dialog = await screen.findByRole('dialog', {
      name: strings.formatString(strings.VIABILITY_TEST_NUMBER, '77').toString(),
    });
    expect(within(dialog).queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: strings.DELETE })).not.toBeInTheDocument();
  });
});

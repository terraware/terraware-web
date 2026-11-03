import React from 'react';

import { screen } from '@testing-library/react';

import OrganizationView from 'src/scenes/OrganizationRouter/OrganizationView';
import strings from 'src/strings';
import { buildOrganization, mockGet, mockPost, renderWithProviders } from 'src/test-utils';
import { OrganizationRole } from 'src/types/Organization';

const ORGANIZATION_ID = 1;

const renderView = (role: OrganizationRole) => {
  mockGet('/api/v1/projects', { projects: [] });
  mockGet(`/api/v1/organizations/${ORGANIZATION_ID}/users`, { users: [] });
  mockPost('/api/v1/search', { results: [] });

  return renderWithProviders(<OrganizationView />, {
    organization: { selectedOrganization: buildOrganization({ id: ORGANIZATION_ID, role }) },
  });
};

describe('OrganizationView', () => {
  it.each<OrganizationRole>(['Admin', 'Owner', 'Terraformation Contact'])(
    'lets an organization %s edit the organization',
    async (role) => {
      renderView(role);

      expect(await screen.findByRole('button', { name: strings.EDIT_ORGANIZATION })).toBeInTheDocument();
    }
  );

  it.each<OrganizationRole>(['Manager', 'Contributor'])(
    'does not let an organization %s edit the organization',
    async (role) => {
      renderView(role);

      expect(await screen.findByText('Test Organization')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: strings.EDIT_ORGANIZATION })).not.toBeInTheDocument();
    }
  );

  it('opens the edit modal when an admin clicks Edit Organization', async () => {
    const { user } = renderView('Admin');

    expect(screen.queryByRole('button', { name: strings.SAVE })).not.toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: strings.EDIT_ORGANIZATION }));

    expect(await screen.findByRole('button', { name: strings.SAVE })).toBeInTheDocument();
  });
});

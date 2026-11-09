import React from 'react';
import { useLocation } from 'react-router';

import { screen } from '@testing-library/react';

import EmptyState from 'src/scenes/SeedlingsDashboard/EmptyState';
import strings from 'src/strings';
import { buildFacility, buildOrganization, renderWithProviders } from 'src/test-utils';

const LocationProbe = () => {
  const { pathname } = useLocation();
  return <div data-testid='location'>{pathname}</div>;
};

describe('Seedlings Dashboard empty state', () => {
  it.each(['Admin', 'Contributor'] as const)('sends a %s with a nursery to Add Inventory', async (role) => {
    const { user } = renderWithProviders(
      <>
        <EmptyState />
        <LocationProbe />
      </>,
      {
        organization: { selectedOrganization: buildOrganization({ role, facilities: [buildFacility()] }) },
      }
    );

    expect(screen.queryByRole('button', { name: strings.SET_UP_NURSERY })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.ADD_INVENTORY }));
    expect(screen.getByTestId('location')).toHaveTextContent('/inventory/new');
  });

  it.each(['Owner', 'Admin'] as const)('sends an %s without a nursery to nursery setup', async (role) => {
    const { user } = renderWithProviders(
      <>
        <EmptyState />
        <LocationProbe />
      </>,
      {
        organization: { selectedOrganization: buildOrganization({ role, facilities: [] }) },
      }
    );

    await user.click(screen.getByRole('button', { name: strings.SET_UP_NURSERY }));
    expect(screen.getByTestId('location')).toHaveTextContent('/nurseries/new');
  });

  it.each(['Manager', 'Contributor'] as const)('does not give a %s without a nursery access to setup', async (role) => {
    const { user } = renderWithProviders(
      <>
        <EmptyState />
        <LocationProbe />
      </>,
      {
        organization: { selectedOrganization: buildOrganization({ role, facilities: [] }) },
      }
    );

    expect(screen.queryByRole('button', { name: strings.SET_UP_NURSERY })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.ADD_INVENTORY }));
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/inventory$/);
  });
});

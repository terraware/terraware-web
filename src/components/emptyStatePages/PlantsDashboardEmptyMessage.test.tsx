import React from 'react';
import { useLocation } from 'react-router';

import { screen } from '@testing-library/react';

import PlantsDashboardEmptyMessage from 'src/components/emptyStatePages/PlantsDashboardEmptyMessage';
import strings from 'src/strings';
import { buildAcceleratorAdmin, buildOrganization, renderWithProviders } from 'src/test-utils';


/** Renders the current location so a test can assert on where a click navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{`${location.pathname}${location.search}`}</div>;
};

describe('PlantsDashboardEmptyMessage', () => {
  it('prompts an organization admin to add a planting site', () => {
    renderWithProviders(<PlantsDashboardEmptyMessage />, {
      organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) },
    });

    expect(screen.getByText(strings.DASHBOARD_NO_PLANTING_SITES_TITLE_ADMIN)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.ADD_A_PLANTING_SITE })).toBeInTheDocument();
  });

  it('tells a contributor to ask someone else, with no call to action', () => {
    renderWithProviders(<PlantsDashboardEmptyMessage />, {
      organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
    });

    expect(screen.getByText(strings.DASHBOARD_NO_PLANTING_SITES_TITLE_NON_ADMIN)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.ADD_A_PLANTING_SITE })).not.toBeInTheDocument();
  });

  it('lets an accelerator admin add a site even when their organization role would not', () => {
    renderWithProviders(<PlantsDashboardEmptyMessage />, {
      currentUser: { user: buildAcceleratorAdmin() },
      organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
    });

    expect(screen.getByRole('button', { name: strings.ADD_A_PLANTING_SITE })).toBeInTheDocument();
  });

  it('sends the admin to the planting site creation flow', async () => {
    const { user } = renderWithProviders(
      <>
        <PlantsDashboardEmptyMessage />
        <LocationProbe />
      </>,
      { organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) } }
    );

    await user.click(screen.getByRole('button', { name: strings.ADD_A_PLANTING_SITE }));

    expect(screen.getByTestId('location')).toHaveTextContent('/planting-sites?new=true');
  });
});

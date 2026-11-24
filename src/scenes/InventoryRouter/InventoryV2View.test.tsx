import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, renderWithProviders } from 'src/test-utils';

import InventoryV2View from './InventoryV2View';

// Each tab body fetches its own inventory data; this view's job is only to offer the three tabs.
rstest.mock('./InventoryListBySpecies', () => ({ default: () => <div>by species body</div> }));
rstest.mock('./InventoryListByNursery', () => ({ default: () => <div>by nursery body</div> }));
rstest.mock('./InventoryListByBatch', () => ({ default: () => <div>by batch body</div> }));

/** Renders the current location so a test can assert on where a click navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderView = (
  props: { hasNurseries: boolean; hasSpecies: boolean; speciesLoading?: boolean },
  role: 'Owner' | 'Admin' | 'Contributor' = 'Admin'
) =>
  renderWithProviders(
    <>
      <InventoryV2View {...props} />
      <LocationProbe />
    </>,
    { organization: { selectedOrganization: buildOrganization({ role }) } }
  );

const addInventoryButton = () => screen.queryByRole('button', { name: strings.ADD_INVENTORY });

beforeEach(() => {
  sessionStorage.clear();
});

describe('InventoryV2View', () => {
  it('offers the three inventory views to an onboarded organization', () => {
    renderView({ hasNurseries: true, hasSpecies: true });

    expect(screen.getByText(strings.INVENTORY)).toBeInTheDocument();
    expect(addInventoryButton()).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: strings.BY_SPECIES })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: strings.BY_NURSERY })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: strings.BY_BATCH })).toBeInTheDocument();
  });

  it('sends Add Inventory to the batch creation flow', async () => {
    const { user } = renderView({ hasNurseries: true, hasSpecies: true });

    await user.click(screen.getByRole('button', { name: strings.ADD_INVENTORY }));

    expect(screen.getByTestId('location')).toHaveTextContent('/inventory/new');
  });

  it.each([
    ['no nurseries', { hasNurseries: false, hasSpecies: true }, () => strings.ADD_NURSERIES],
    ['no species', { hasNurseries: true, hasSpecies: false }, () => strings.CREATE_SPECIES_LIST],
  ])('tells an admin what is still missing when there are %s', (_label, props, missingStep) => {
    renderView(props);

    expect(screen.getByText(strings.ONBOARDING_ADMIN_TITLE)).toBeInTheDocument();
    expect(screen.getByText(missingStep())).toBeInTheDocument();
    expect(addInventoryButton()).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: strings.BY_SPECIES })).not.toBeInTheDocument();
  });

  it('points a contributor at an admin instead of at the setup steps', () => {
    renderView({ hasNurseries: false, hasSpecies: false }, 'Contributor');

    expect(screen.getByText(strings.REACH_OUT_TO_ADMIN_TITLE)).toBeInTheDocument();
    expect(screen.getByText(strings.NO_NURSERIES_NON_ADMIN_MSG)).toBeInTheDocument();
    expect(screen.queryByText(strings.ONBOARDING_ADMIN_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.GO_TO_NURSERIES })).not.toBeInTheDocument();
    expect(addInventoryButton()).not.toBeInTheDocument();
  });

  it('waits for species to load before showing the inventory or the onboarding message', () => {
    renderView({ hasNurseries: false, hasSpecies: false, speciesLoading: true });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(strings.INVENTORY)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.ONBOARDING_ADMIN_TITLE)).not.toBeInTheDocument();
  });
});

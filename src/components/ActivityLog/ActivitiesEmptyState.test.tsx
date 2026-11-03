import React from 'react';
import { useLocation } from 'react-router';

import { screen } from '@testing-library/react';

import ActivitiesEmptyState from 'src/components/ActivityLog/ActivitiesEmptyState';
import strings from 'src/strings';
import { buildFunderUser, buildOrganization, buildUser, renderWithProviders } from 'src/test-utils';

const PROJECT_ID = 7;

/** Renders the current pathname so a test can assert on where a click navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderEmptyState = (options: Parameters<typeof renderWithProviders>[1]) =>
  renderWithProviders(
    <>
      <ActivitiesEmptyState projectId={PROJECT_ID} />
      <LocationProbe />
    </>,
    options
  );

// Matched by text rather than role so a hidden link can't slip back in as a different element.
const addActivityLink = () => screen.queryByText(strings.ADD_YOUR_FIRST_ACTIVITY);

describe('ActivitiesEmptyState', () => {
  describe('on the participant activity log', () => {
    it('sends an organization admin to the participant activity form, not the Console one', async () => {
      const { user } = renderEmptyState({
        route: '/activity-log',
        organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) },
      });

      await user.click(screen.getByRole('link', { name: strings.ADD_YOUR_FIRST_ACTIVITY }));

      expect(screen.getByTestId('location')).toHaveTextContent(`/activity-log/${PROJECT_ID}/new`);
      expect(screen.getByTestId('location')).not.toHaveTextContent('/accelerator');
    });

    it('tells a manager the project has no activities without offering to add one', () => {
      renderEmptyState({
        route: '/activity-log',
        organization: { selectedOrganization: buildOrganization({ role: 'Manager' }) },
      });

      expect(screen.getByText(strings.THIS_PROJECT_HAS_NO_ACTIVITIES)).toBeInTheDocument();
      expect(addActivityLink()).not.toBeInTheDocument();
    });
  });

  describe('in the Accelerator Console', () => {
    it('sends a TF Expert to the Console activity form even without an admin organization role', async () => {
      const { user } = renderEmptyState({
        route: '/accelerator/activity-log',
        currentUser: { user: buildUser({ globalRoles: ['TF Expert'] }) },
        organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
      });

      const link = screen.getByRole('link', { name: strings.ADD_YOUR_FIRST_ACTIVITY });
      expect(link).toHaveAttribute(
        'href',
        `/accelerator/activity-log/${PROJECT_ID}/new?source=${encodeURIComponent('/accelerator/activity-log')}`
      );

      await user.click(link);

      expect(screen.getByTestId('location')).toHaveTextContent(`/accelerator/activity-log/${PROJECT_ID}/new`);
    });

    it('does not let a read-only user add an activity, even if they own the selected organization', () => {
      renderEmptyState({
        route: '/accelerator/activity-log',
        currentUser: { user: buildUser({ globalRoles: ['Read Only'] }) },
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(screen.getByText(strings.THIS_PROJECT_HAS_NO_ACTIVITIES)).toBeInTheDocument();
      expect(addActivityLink()).not.toBeInTheDocument();
    });
  });

  describe('in the funder portal', () => {
    it('does not offer to add an activity, even when the selected organization would allow it', () => {
      renderEmptyState({
        route: '/funder/home',
        currentUser: { user: buildFunderUser() },
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(screen.getByText(strings.THIS_PROJECT_HAS_NO_ACTIVITIES)).toBeInTheDocument();
      expect(addActivityLink()).not.toBeInTheDocument();
    });
  });
});

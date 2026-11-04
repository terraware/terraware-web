import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import ActivityDetailView from 'src/components/ActivityLog/ActivityDetailView';
import { TypedActivity } from 'src/components/ActivityLog/types';
import strings from 'src/strings';
import { buildOrganization, buildUser, mockGet, mockPost, renderWithProviders } from 'src/test-utils';
import { AdminActivityPayload } from 'src/types/Activity';

const PROJECT_ID = 7;
/** The organization the route's project belongs to, which is NOT what authorizes the edit. */
const ROUTE_PROJECT_ORG_ID = 1;
/** The organization that owns the observation. */
const OBSERVATION_ORG_ID = 42;
const OBSERVATION_ID = 99;
const PLANTING_SITE_ID = 55;

const PROJECT_URL = '/api/v1/projects/:projectId';
const OBSERVATION_RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';
const SEARCH_URL = '/api/v1/search';

const buildAdminActivity = (overrides: Partial<AdminActivityPayload> = {}): TypedActivity => ({
  type: 'admin',
  payload: {
    createdBy: 1,
    createdTime: '2025-01-01T00:00:00Z',
    date: '2025-01-15',
    description: 'Quarterly monitoring visit',
    id: 11,
    isHighlight: false,
    media: [],
    modifiedBy: 1,
    modifiedTime: '2025-01-01T00:00:00Z',
    status: 'Verified',
    type: 'Monitoring',
    ...overrides,
  },
});

const observationActivity = buildAdminActivity({
  observation: { isAdHoc: false, observationId: OBSERVATION_ID, observationType: 'Monitoring' },
});

const plainActivity = buildAdminActivity();

const mockObservationResults = () => {
  mockGet(OBSERVATION_RESULTS_URL, {
    observation: {
      observationId: OBSERVATION_ID,
      plantingDensity: 120,
      plantingSiteId: PLANTING_SITE_ID,
      pending: false,
      species: [],
      survivalRate: 80,
    },
  });
};

/**
 * Search visibility limits planting sites to organizations the user belongs to, so a non-member
 * gets an empty result set rather than another organization's ID.
 */
const mockObservationOrgSearch = (organizationId?: number) =>
  mockPost(SEARCH_URL, {
    results: organizationId === undefined ? [] : [{ plantingSite_organization_id: `${organizationId}` }],
  });

/** The route's project always resolves to an org the user is in, so it can't be what grants access. */
const mockRouteProject = () =>
  mockGet(PROJECT_URL, { project: { id: PROJECT_ID, name: 'Test Project', organizationId: ROUTE_PROJECT_ORG_ID } });

const renderDetailView = (activity: TypedActivity, options: Parameters<typeof renderWithProviders>[1]) =>
  renderWithProviders(
    <ActivityDetailView
      activity={activity}
      onClickMediaItem={() => () => undefined}
      projectId={PROJECT_ID}
      setHoverFileCallback={() => () => undefined}
    />,
    { route: '/accelerator/activity-log', ...options }
  );

const asTfExpertIn = (...orgIds: number[]) => ({
  currentUser: { user: buildUser({ globalRoles: ['TF Expert' as const] }) },
  organization: {
    selectedOrganization: buildOrganization({ id: orgIds[0], role: 'Contributor' }),
    organizations: orgIds.map((id) => buildOrganization({ id, role: 'Contributor' })),
  },
});

const editButton = () => screen.getByRole('button', { name: strings.EDIT_ACTIVITY });

describe('ActivityDetailView', () => {
  describe('editing an observation activity in the Accelerator Console', () => {
    it('does not let a TF Expert edit an observation owned by an organization they are not in', async () => {
      // Editing goes through the observation endpoints, which the server refuses for a non-member,
      // so the button has to stay disabled even though TF Experts may edit activities generally.
      mockRouteProject();
      mockObservationResults();
      mockObservationOrgSearch(OBSERVATION_ORG_ID);

      renderDetailView(observationActivity, asTfExpertIn(ROUTE_PROJECT_ORG_ID));

      await waitFor(() => expect(editButton()).toBeDisabled());
    });

    it('lets a TF Expert who is a member of the observation organization edit it', async () => {
      mockRouteProject();
      mockObservationResults();
      mockObservationOrgSearch(OBSERVATION_ORG_ID);

      renderDetailView(observationActivity, asTfExpertIn(OBSERVATION_ORG_ID));

      await waitFor(() => expect(editButton()).toBeEnabled());
    });

    it('lets a super admin edit an observation owned by an organization they are not in', async () => {
      mockRouteProject();
      mockObservationResults();
      mockObservationOrgSearch(OBSERVATION_ORG_ID);

      renderDetailView(observationActivity, {
        currentUser: { user: buildUser({ globalRoles: ['Super-Admin'] }) },
        organization: {
          selectedOrganization: buildOrganization({ id: ROUTE_PROJECT_ORG_ID }),
          organizations: [buildOrganization({ id: ROUTE_PROJECT_ORG_ID })],
        },
      });

      await waitFor(() => expect(editButton()).toBeEnabled());
    });

    it('still lets a TF Expert edit an activity that is not tied to an observation', async () => {
      mockRouteProject();

      renderDetailView(plainActivity, asTfExpertIn(ROUTE_PROJECT_ORG_ID));

      await waitFor(() => expect(editButton()).toBeEnabled());
    });
  });
});

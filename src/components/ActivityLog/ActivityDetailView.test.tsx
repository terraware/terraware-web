import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import ActivityDetailView from 'src/components/ActivityLog/ActivityDetailView';
import { TypedActivity } from 'src/components/ActivityLog/types';
import strings from 'src/strings';
import { buildOrganization, buildUser, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';
import { AdminActivityPayload } from 'src/types/Activity';

const PROJECT_ID = 7;
/** The organization the route's project belongs to, which is NOT what authorizes the edit. */
const ROUTE_PROJECT_ORG_ID = 1;
/** The organization that owns the observation, reached through its planting site. */
const OBSERVATION_ORG_ID = 42;
const OBSERVATION_ID = 99;
const PLANTING_SITE_ID = 55;

const PROJECT_URL = '/api/v1/projects/:projectId';
const OBSERVATION_RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';
const PLANTING_SITE_URL = '/api/v1/tracking/sites/:plantingSiteId';

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
      const siteRequests = captureRequests('get', PLANTING_SITE_URL, {
        site: { id: PLANTING_SITE_ID, name: 'Site', organizationId: OBSERVATION_ORG_ID, adHocPlots: [] },
      });

      renderDetailView(observationActivity, asTfExpertIn(ROUTE_PROJECT_ORG_ID));

      await waitFor(() => expect(siteRequests).toHaveLength(1));
      await waitFor(() => expect(editButton()).toBeDisabled());
    });

    it('lets a TF Expert who is a member of the observation organization edit it', async () => {
      mockRouteProject();
      mockObservationResults();
      mockGet(PLANTING_SITE_URL, {
        site: { id: PLANTING_SITE_ID, name: 'Site', organizationId: OBSERVATION_ORG_ID, adHocPlots: [] },
      });

      renderDetailView(observationActivity, asTfExpertIn(OBSERVATION_ORG_ID));

      await waitFor(() => expect(editButton()).toBeEnabled());
    });

    it('lets a super admin edit an observation owned by an organization they are not in', async () => {
      mockRouteProject();
      mockObservationResults();
      mockGet(PLANTING_SITE_URL, {
        site: { id: PLANTING_SITE_ID, name: 'Site', organizationId: OBSERVATION_ORG_ID, adHocPlots: [] },
      });

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

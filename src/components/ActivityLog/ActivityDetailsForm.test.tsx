import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { delay, http } from 'msw';

import ActivityDetailsForm from 'src/components/ActivityLog/ActivityDetailsForm';
import strings from 'src/strings';
import {
  buildOrganization,
  buildUser,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';

const ACTIVITY_ID = 11;
const PROJECT_ID = 7;
/** The organization the route's project belongs to, which is NOT what authorizes the edit. */
const ROUTE_PROJECT_ORG_ID = 1;
/** The organization that owns the observation, reached through its planting site. */
const OBSERVATION_ORG_ID = 42;
const OBSERVATION_ID = 99;
const PLANTING_SITE_ID = 55;

const ADMIN_ACTIVITY_URL = '/api/v1/accelerator/activities/admin/:activityId';
const OBSERVATION_RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';
const PLANTING_SITE_URL = '/api/v1/tracking/sites/:plantingSiteId';

const EDIT_ROUTE = `/accelerator/activity-log/${PROJECT_ID}/${ACTIVITY_ID}/edit`;

/** Endpoints the form reaches for incidentally, none of which carry the authorization answer. */
const mockSupportingEndpoints = () => {
  mockGet('/api/v1/projects/:projectId', {
    project: { id: PROJECT_ID, name: 'Test Project', organizationId: ROUTE_PROJECT_ORG_ID },
  });
  mockGet('/api/v1/projects', { projects: [] });
  mockGet('/api/v1/accelerator/projects', { details: [] });
  mockGet('/api/v1/tracking/sites', { sites: [] });
  mockGet('/api/v1/tracking/mapbox/token', { token: 'test-token' });
};

const mockActivity = ({ withObservation }: { withObservation: boolean }) => {
  mockGet(ADMIN_ACTIVITY_URL, {
    activity: {
      createdBy: 1,
      createdTime: '2025-01-01T00:00:00Z',
      date: '2025-01-15',
      description: 'Quarterly monitoring visit',
      id: ACTIVITY_ID,
      isHighlight: false,
      media: [],
      modifiedBy: 1,
      modifiedTime: '2025-01-01T00:00:00Z',
      status: 'Verified',
      type: 'Monitoring',
      ...(withObservation
        ? { observation: { isAdHoc: false, observationId: OBSERVATION_ID, observationType: 'Monitoring' } }
        : {}),
    },
  });
};

const mockObservationResults = () => {
  mockGet(OBSERVATION_RESULTS_URL, {
    observation: {
      observationId: OBSERVATION_ID,
      plantingSiteId: PLANTING_SITE_ID,
      pending: false,
      species: [],
    },
  });
};

const plantingSiteBody = (organizationId: number) => ({
  site: { id: PLANTING_SITE_ID, name: 'Site', organizationId, adHocPlots: [] },
});

const renderEditForm = (orgIds: number[]) =>
  renderWithProviders(<ActivityDetailsForm activityId={ACTIVITY_ID} projectId={PROJECT_ID} />, {
    route: EDIT_ROUTE,
    path: '/accelerator/activity-log/:projectId/:activityId/edit',
    currentUser: { user: buildUser({ globalRoles: ['TF Expert'] }) },
    organization: {
      selectedOrganization: buildOrganization({ id: orgIds[0], role: 'Contributor' }),
      organizations: orgIds.map((id) => buildOrganization({ id, role: 'Contributor' })),
    },
  });

const saveButton = () => screen.queryByRole('button', { name: strings.SAVE });

const toastMessage = (store: ReturnType<typeof renderEditForm>['store']) =>
  store.getState().snackbar.snackbars.toast?.msg;

describe('ActivityDetailsForm', () => {
  describe('editing an observation activity in the Accelerator Console', () => {
    beforeEach(() => {
      mockSupportingEndpoints();
    });

    it('does not render the form for a TF Expert outside the observation organization', async () => {
      mockActivity({ withObservation: true });
      mockObservationResults();
      mockGet(PLANTING_SITE_URL, plantingSiteBody(OBSERVATION_ORG_ID));

      // The route's project belongs to an org the user is in, so only the observation's own
      // organization can be what withholds the form.
      const { store } = renderEditForm([ROUTE_PROJECT_ORG_ID]);

      await waitFor(() => expect(toastMessage(store)).toBe(strings.EDIT_OBSERVATION_ACTIVITY_NOT_ALLOWED));
      expect(saveButton()).not.toBeInTheDocument();
    });

    it('renders the form for a TF Expert who is a member of the observation organization', async () => {
      mockActivity({ withObservation: true });
      mockObservationResults();
      mockGet(PLANTING_SITE_URL, plantingSiteBody(OBSERVATION_ORG_ID));

      const { store } = renderEditForm([OBSERVATION_ORG_ID]);

      await waitFor(() => expect(saveButton()).toBeInTheDocument());
      expect(toastMessage(store)).toBeUndefined();
    });

    it('fails closed when the planting site lookup is denied', async () => {
      mockActivity({ withObservation: true });
      mockObservationResults();
      mockError('get', PLANTING_SITE_URL, 403);

      // Membership in the observation's org can't be established, so the form must stay closed
      // rather than fall open on a missing answer.
      const { store } = renderEditForm([OBSERVATION_ORG_ID]);

      await waitFor(() => expect(toastMessage(store)).toBe(strings.EDIT_OBSERVATION_ACTIVITY_NOT_ALLOWED));
      expect(saveButton()).not.toBeInTheDocument();
    });

    it('fails closed while the owning organization is still unknown', async () => {
      mockActivity({ withObservation: true });
      const observationRequests = captureRequests('get', OBSERVATION_RESULTS_URL, {
        observation: { observationId: OBSERVATION_ID, plantingSiteId: PLANTING_SITE_ID, pending: false, species: [] },
      });
      // A lookup that hangs rather than failing never answers, so nothing ever authorizes the edit.
      const siteRequests: Request[] = [];
      server.use(
        http.get(PLANTING_SITE_URL, async ({ request }) => {
          siteRequests.push(request.clone());
          await delay('infinite');
        })
      );

      renderEditForm([OBSERVATION_ORG_ID]);

      await waitFor(() => expect(observationRequests).toHaveLength(1));
      await waitFor(() => expect(siteRequests).toHaveLength(1));
      expect(saveButton()).not.toBeInTheDocument();
    });

    it('renders the form for an activity that is not tied to an observation', async () => {
      mockActivity({ withObservation: false });

      const { store } = renderEditForm([ROUTE_PROJECT_ORG_ID]);

      await waitFor(() => expect(saveButton()).toBeInTheDocument());
      expect(toastMessage(store)).toBeUndefined();
    });
  });
});

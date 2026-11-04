import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import ActivityDetailView from 'src/components/ActivityLog/ActivityDetailView';
import { TypedActivity } from 'src/components/ActivityLog/types';
import { ProjectPayload } from 'src/queries/generated/projects';
import strings from 'src/strings';
import { buildOrganization, buildUser, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';
import { AdminActivityPayload } from 'src/types/Activity';

const PROJECT_ID = 7;
const PROJECT_ORG_ID = 42;
const OBSERVATION_ID = 99;

const PROJECT_URL = '/api/v1/projects/:projectId';
const OBSERVATION_RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';

const project: ProjectPayload = {
  id: PROJECT_ID,
  name: 'Test Project',
  organizationId: PROJECT_ORG_ID,
};

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

/** Serves the observation results the stats panel reads, which any observation activity requests. */
const mockObservationResults = () => {
  mockGet(OBSERVATION_RESULTS_URL, {
    observation: {
      observationId: OBSERVATION_ID,
      plantingDensity: 120,
      pending: false,
      species: [],
      survivalRate: 80,
    },
  });
};

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

const editButton = () => screen.getByRole('button', { name: strings.EDIT_ACTIVITY });

describe('ActivityDetailView', () => {
  describe('editing an observation activity in the Accelerator Console', () => {
    it('does not let a TF Expert edit an observation belonging to an organization they are not in', async () => {
      // Editing goes through the observation endpoints, which the server refuses for a non-member,
      // so the button has to stay disabled even though TF Experts may edit activities generally.
      const projectRequests = captureRequests('get', PROJECT_URL, { project });
      mockObservationResults();

      renderDetailView(observationActivity, {
        currentUser: { user: buildUser({ globalRoles: ['TF Expert'] }) },
        organization: {
          selectedOrganization: buildOrganization({ id: 1 }),
          organizations: [buildOrganization({ id: 1 })],
        },
      });

      // The gate reads the project's organization, so wait for the project to arrive before
      // asserting; the membership test below shows the button does flip once it has.
      await waitFor(() => expect(projectRequests).toHaveLength(1));
      await waitFor(() => expect(editButton()).toBeDisabled());
    });

    it('lets a TF Expert who is a member of the observation organization edit it', async () => {
      mockGet(PROJECT_URL, { project });
      mockObservationResults();

      renderDetailView(observationActivity, {
        currentUser: { user: buildUser({ globalRoles: ['TF Expert'] }) },
        organization: {
          selectedOrganization: buildOrganization({ id: PROJECT_ORG_ID, role: 'Contributor' }),
          organizations: [buildOrganization({ id: PROJECT_ORG_ID, role: 'Contributor' })],
        },
      });

      await waitFor(() => expect(editButton()).toBeEnabled());
    });

    it('lets a super admin edit an observation belonging to an organization they are not in', async () => {
      mockGet(PROJECT_URL, { project });
      mockObservationResults();

      renderDetailView(observationActivity, {
        currentUser: { user: buildUser({ globalRoles: ['Super-Admin'] }) },
        organization: {
          selectedOrganization: buildOrganization({ id: 1 }),
          organizations: [buildOrganization({ id: 1 })],
        },
      });

      await waitFor(() => expect(editButton()).toBeEnabled());
    });

    it('still lets a TF Expert edit an activity that is not tied to an observation', async () => {
      renderDetailView(plainActivity, {
        currentUser: { user: buildUser({ globalRoles: ['TF Expert'] }) },
        organization: {
          selectedOrganization: buildOrganization({ id: 1 }),
          organizations: [buildOrganization({ id: 1 })],
        },
      });

      await waitFor(() => expect(editButton()).toBeEnabled());
    });
  });
});

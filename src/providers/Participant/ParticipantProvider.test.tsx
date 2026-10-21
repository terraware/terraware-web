import React, { type ReactNode, useMemo } from 'react';

import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import type { ProvidedOrganizationData } from 'src/providers/DataTypes';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import ParticipantProvider from 'src/providers/Participant/ParticipantProvider';
import { OrganizationContext } from 'src/providers/contexts';
import type { ProjectPayload } from 'src/queries/generated/projects';
import { buildOrganization, mockGet, renderWithProviders, server } from 'src/test-utils';
import type { Organization } from 'src/types/Organization';

const acceleratorProject: ProjectPayload = {
  id: 10,
  name: 'Accelerator Project',
  organizationId: 1,
  phase: 'Phase 1 - Feasibility Study',
};

const plainProject: ProjectPayload = { id: 11, name: 'Plain Project', organizationId: 1 };

const otherOrgProject: ProjectPayload = { id: 20, name: 'Other Org Project', organizationId: 2 };

const mockProjectsByOrganization = (projectsByOrganization: Record<string, ProjectPayload[]>) => {
  server.use(
    http.get('/api/v1/projects', ({ request }) => {
      const organizationId = new URL(request.url).searchParams.get('organizationId') ?? '';
      return HttpResponse.json({ status: 'ok', projects: projectsByOrganization[organizationId] ?? [] });
    })
  );
};

const mockProjectIdsWithModules = (moduleProjectIdsByOrganization: Record<string, number[]>) => {
  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { search?: { values?: string[] } };
      const organizationId = body.search?.values?.[0] ?? '';
      const results = (moduleProjectIdsByOrganization[organizationId] ?? []).map((id) => ({
        id: `${id}`,
        projectModules: [{ module_id: '5' }],
      }));
      return HttpResponse.json({ status: 'ok', results });
    })
  );
};

const ParticipantProbe = () => {
  const { orgHasParticipants, orgHasModules, allAcceleratorProjects } = useParticipantData();

  return (
    <ul>
      <li>{`orgHasParticipants: ${String(orgHasParticipants)}`}</li>
      <li>{`orgHasModules: ${String(orgHasModules)}`}</li>
      <li>{`acceleratorProjects: ${allAcceleratorProjects.map((project) => project.name).join(', ') || 'none'}`}</li>
    </ul>
  );
};

const OrganizationHarness = ({ organization, children }: { organization: Organization; children: ReactNode }) => {
  const value = useMemo<ProvidedOrganizationData>(
    () => ({
      bootstrapped: true,
      selectedOrganization: organization,
      organizations: [organization],
      orgPreferences: {},
      setSelectedOrganization: () => undefined,
      redirectAndNotify: () => undefined,
      reloadOrganizations: () => Promise.resolve(),
      isFetchingOrganizations: false,
    }),
    [organization]
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

const tree = (organization: Organization) => (
  <OrganizationHarness organization={organization}>
    <ParticipantProvider>
      <ParticipantProbe />
    </ParticipantProvider>
  </OrganizationHarness>
);

describe('ParticipantProvider', () => {
  beforeEach(() => {
    mockGet('/api/v1/accelerator/projects/:projectId/modules', { modules: [] });
  });

  it('keeps the participant flags known when the organization is refetched without changing', async () => {
    mockProjectsByOrganization({ '1': [acceleratorProject, plainProject] });
    mockProjectIdsWithModules({ '1': [acceleratorProject.id] });

    const { rerender } = renderWithProviders(tree(buildOrganization({ id: 1 })));

    expect(await screen.findByText('orgHasParticipants: true')).toBeInTheDocument();
    expect(await screen.findByText('orgHasModules: true')).toBeInTheDocument();

    rerender(tree(buildOrganization({ id: 1 })));

    expect(screen.getByText('orgHasParticipants: true')).toBeInTheDocument();
    expect(screen.getByText('orgHasModules: true')).toBeInTheDocument();
    expect(screen.getByText('acceleratorProjects: Accelerator Project')).toBeInTheDocument();
  });

  it('recomputes the participant flags when a different organization is selected', async () => {
    mockProjectsByOrganization({ '1': [acceleratorProject], '2': [otherOrgProject] });
    mockProjectIdsWithModules({ '1': [acceleratorProject.id] });

    const { rerender } = renderWithProviders(tree(buildOrganization({ id: 1 })));

    expect(await screen.findByText('orgHasParticipants: true')).toBeInTheDocument();

    rerender(tree(buildOrganization({ id: 2, name: 'Other Organization' })));

    expect(await screen.findByText('orgHasParticipants: false')).toBeInTheDocument();
    expect(await screen.findByText('orgHasModules: false')).toBeInTheDocument();
    expect(screen.getByText('acceleratorProjects: none')).toBeInTheDocument();
  });

  it('reports no participants when none of the projects is in an accelerator phase', async () => {
    mockProjectsByOrganization({ '1': [plainProject] });
    mockProjectIdsWithModules({});

    renderWithProviders(tree(buildOrganization({ id: 1 })));

    expect(await screen.findByText('orgHasParticipants: false')).toBeInTheDocument();
    expect(screen.getByText('acceleratorProjects: none')).toBeInTheDocument();
  });
});

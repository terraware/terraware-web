import React from 'react';

import { rstest } from '@rstest/core';
import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { ALL_PLANTING_SITES, type PlantingSiteId } from 'src/hooks/useStickyPlantingSiteId';
import PlantsDashboardHeader from 'src/scenes/PlantsDashboardRouter/components/PlantsDashboardHeader';
import { buildOrganization, buildPlantingSite, mockGet, renderWithProviders, server } from 'src/test-utils';

const ORGANIZATION_ID = 7;
const STORED_SITE_ID = 3;
const sites = [
  buildPlantingSite({ id: 1, name: 'Alpha', organizationId: ORGANIZATION_ID }),
  buildPlantingSite({ id: 2, name: 'Bravo', organizationId: ORGANIZATION_ID }),
];

const mockHeaderRequests = () => {
  const siteListRequests: Request[] = [];
  server.use(
    http.get('/api/v1/tracking/sites', ({ request }) => {
      siteListRequests.push(request);
      return HttpResponse.json({ status: 'ok', sites });
    }),
    http.post('/api/v1/search/values', () => HttpResponse.json({ results: { project_id: { values: [] } } })),
    http.get('/build-version.txt', () => HttpResponse.text(''))
  );
  mockGet('/api/v1/projects', { projects: [] });
  mockGet(`/api/v1/tracking/sites/${STORED_SITE_ID}`, {
    site: buildPlantingSite({ id: STORED_SITE_ID, latestObservationId: undefined }),
  });
  return siteListRequests;
};

type HeaderProps = { isRestoringPlantingSite: boolean; onSelectPlantingSite: (id: PlantingSiteId) => void };

const Header = ({ isRestoringPlantingSite, onSelectPlantingSite }: HeaderProps) => (
  <PlantsDashboardHeader
    isRestoringPlantingSite={isRestoringPlantingSite}
    selectedPlantingSiteId={STORED_SITE_ID}
    onSelectPlantingSite={onSelectPlantingSite}
    projectId={ALL_PLANTING_SITES}
    onSelectProject={() => undefined}
    organizationId={ORGANIZATION_ID}
  >
    <div />
  </PlantsDashboardHeader>
);

describe('PlantsDashboardHeader', () => {
  it('holds off falling back to the first site until the stored site has been restored', async () => {
    const siteListRequests = mockHeaderRequests();
    const onSelectPlantingSite = rstest.fn();

    const { rerender } = renderWithProviders(
      <Header isRestoringPlantingSite onSelectPlantingSite={onSelectPlantingSite} />,
      { organization: { selectedOrganization: buildOrganization({ id: ORGANIZATION_ID }) } }
    );

    await waitFor(() => expect(siteListRequests).toHaveLength(1));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(onSelectPlantingSite).not.toHaveBeenCalled();

    rerender(<Header isRestoringPlantingSite={false} onSelectPlantingSite={onSelectPlantingSite} />);

    await waitFor(() => expect(onSelectPlantingSite).toHaveBeenCalledWith(1));
  });
});

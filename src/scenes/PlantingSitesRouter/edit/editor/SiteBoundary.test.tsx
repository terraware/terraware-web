import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { FeatureCollection, Polygon } from 'geojson';

import type { EditableMapProps } from 'src/components/Map/EditableMapV2';
import type { FeatureName } from 'src/features';
import SiteBoundary from 'src/scenes/PlantingSitesRouter/edit/editor/SiteBoundary';
import strings from 'src/strings';
import { buildDraftPlantingSite, mockPost, renderWithProviders } from 'src/test-utils';

const flags = rstest.hoisted(() => ({ boundaryFileUpload: false }));

rstest.mock('src/features', () => ({
  __esModule: true,
  default: (name: FeatureName) => name === 'Boundary File Upload' && flags.boundaryFileUpload,
}));

// Mapbox needs a real GL context, so stand in for the map and record the boundary handed to it.
const mapBoundaries = rstest.hoisted(() => [] as (FeatureCollection | undefined)[]);

rstest.mock('src/components/Map/EditableMapV2', () => ({
  __esModule: true,
  default: ({ editableBoundary }: EditableMapProps) => {
    mapBoundaries.push(editableBoundary);
    return <div>map</div>;
  },
}));

const SITE_ID = 7;
const PARSE_URL = `/api/v1/tracking/draftSites/${SITE_ID}/boundaryFile`;

// ~2.2km on a side: large enough to clear the minimum polygon size, small enough to stay under
// the 20,000 ha bounding box limit, so neither error path interferes.
const GEOMETRY: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [0, 0.02],
      [0.02, 0.02],
      [0.02, 0],
      [0, 0],
    ],
  ],
};

const site = buildDraftPlantingSite({ id: SITE_ID });

const renderSiteBoundary = () =>
  renderWithProviders(<SiteBoundary site={site} />, {
    // the step's tutorial dialog opens on mount otherwise, and covers the map
    currentUser: { userPreferences: { 'dont-show-site-boundary-instructions': true } },
  });

// each chooser tile's accessible name is its label followed by its description, so match on the
// label the tile leads with rather than the whole run-on string
const methodTile = (label: string) => screen.getByRole('button', { name: (name: string) => name.startsWith(label) });

// submit a file from the already open upload modal
const submitUploadModal = async (user: ReturnType<typeof renderSiteBoundary>['user'], filename: string) => {
  // FileChooser hides its input and drives it from the Choose File button, so there is no
  // accessible handle to query by.
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(input, new File(['{}'], filename, { type: 'application/json' }));
  await user.click(screen.getByRole('button', { name: strings.UPLOAD }));
};

const uploadBoundaryFile = async (user: ReturnType<typeof renderSiteBoundary>['user'], filename: string) => {
  await user.click(methodTile(strings.UPLOAD_SPATIAL_FILES));
  await submitUploadModal(user, filename);
};

describe('SiteBoundary', () => {
  beforeEach(() => {
    flags.boundaryFileUpload = false;
    mapBoundaries.length = 0;
  });

  it('keeps the drawing instructions and shows no method chooser when file upload is off', () => {
    renderSiteBoundary();

    expect(screen.getByText(strings.SITE_BOUNDARY_DESCRIPTION_0)).toBeInTheDocument();
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
  });

  it('offers a choice of upload or drawing when file upload is on and the site has no boundary', () => {
    flags.boundaryFileUpload = true;

    renderSiteBoundary();

    expect(screen.getByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByText(strings.SITE_BOUNDARY_MAX_BOUNDING_BOX)).toBeInTheDocument();
    expect(screen.queryByText(strings.SITE_BOUNDARY_DESCRIPTION_0)).not.toBeInTheDocument();
  });

  it('dismisses the chooser without opening the upload modal when the user chooses to draw', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));

    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('opens the upload modal when the user chooses to upload a spatial file', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.UPLOAD_SPATIAL_FILES));

    expect(screen.getByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeInTheDocument();
  });

  it('replaces the chooser with the uploaded boundary on the map', async () => {
    flags.boundaryFileUpload = true;
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 1,
    });
    const { user } = renderSiteBoundary();

    await uploadBoundaryFile(user, 'site.geojson');

    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features).toHaveLength(1));
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).not.toBeInTheDocument();
  });
});

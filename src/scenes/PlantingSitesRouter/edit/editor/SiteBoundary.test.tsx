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
  useFeatureEnabled: (name: FeatureName) => name === 'Boundary File Upload' && flags.boundaryFileUpload,
}));

// Mapbox needs a real GL context, so stand in for the map, record the boundary handed to it, and
// expose its undo, redo, and edit controls as plain buttons.
const mapBoundaries = rstest.hoisted(() => [] as (FeatureCollection | undefined)[]);
const mapEdit = rstest.hoisted(() => ({ boundary: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/Map/EditableMapV2', () => ({
  __esModule: true,
  default: ({ editableBoundary, onEditableBoundaryChanged, onRedo, onUndo }: EditableMapProps) => {
    mapBoundaries.push(editableBoundary);
    return (
      <div>
        <button disabled={!onUndo} onClick={() => onUndo?.()}>
          map undo
        </button>
        <button disabled={!onRedo} onClick={() => onRedo?.()}>
          map redo
        </button>
        <button onClick={() => onEditableBoundaryChanged(undefined)}>map clear boundary</button>
        <button onClick={() => onEditableBoundaryChanged(mapEdit.boundary)}>map edit boundary</button>
      </div>
    );
  },
}));

const PARSE_URL = '/api/v1/tracking/draftSites/boundaryFile';

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

// a second, visibly different boundary of the same safe size, for the replace/remove flows
const OTHER_GEOMETRY: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [1, 1],
      [1, 1.02],
      [1.02, 1.02],
      [1.02, 1],
      [1, 1],
    ],
  ],
};

// what the map hands back when the user reshapes the boundary instead of uploading it
const EDITED_BOUNDARY: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', id: 1, properties: {}, geometry: OTHER_GEOMETRY }],
};

const site = buildDraftPlantingSite();

const polygonsCombinedBanner = (numPolygons: number) =>
  strings.formatString(strings.SITE_BOUNDARY_POLYGONS_COMBINED, numPolygons) as string;

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
    mapEdit.boundary = EDITED_BOUNDARY;
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

  it('does not show the drawing banner before a method is chosen', () => {
    flags.boundaryFileUpload = true;

    renderSiteBoundary();

    expect(screen.getByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).not.toBeInTheDocument();
  });

  it('tells the user they are drawing on the map once they choose to draw', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));

    expect(screen.getByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).toBeInTheDocument();
  });

  it('opens the upload modal when a user drawing the boundary chooses to upload a file instead', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));

    expect(screen.getByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeInTheDocument();
  });

  it('returns to drawing, not the method chooser, when the upload modal opened from drawing is cancelled', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).not.toBeInTheDocument());
    expect(screen.getByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).toBeInTheDocument();
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
  });

  it('replaces the drawing banner with the uploaded file summary when a file is uploaded while drawing', async () => {
    flags.boundaryFileUpload = true;
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 1,
    });
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));
    await submitUploadModal(user, 'site.geojson');

    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REPLACE_FILE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REMOVE })).toBeInTheDocument();
    expect(screen.queryByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).not.toBeInTheDocument();
  });

  it('opens the upload modal when the user chooses to upload a spatial file', async () => {
    flags.boundaryFileUpload = true;
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.UPLOAD_SPATIAL_FILES));

    expect(screen.getByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeInTheDocument();
  });

  it('replaces the chooser with a summary of the uploaded file and puts its boundary on the map', async () => {
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

    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(polygonsCombinedBanner(1))).not.toBeInTheDocument();
    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features).toHaveLength(1));
  });

  it('warns that multiple polygons were combined into one boundary', async () => {
    flags.boundaryFileUpload = true;
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 2,
    });
    const { user } = renderSiteBoundary();

    await uploadBoundaryFile(user, 'site.geojson');

    expect(await screen.findByText(polygonsCombinedBanner(2))).toBeInTheDocument();
  });

  it('brings back the chooser when the uploaded file is removed', async () => {
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
    await user.click(await screen.findByRole('button', { name: strings.REMOVE }));

    expect(screen.getByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(/site\.geojson/)).not.toBeInTheDocument();
  });

  it('keeps the new boundary on the map when the uploaded file is replaced', async () => {
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
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    mockPost(PARSE_URL, {
      areaHa: 500,
      filename: 'replacement.geojson',
      format: 'GeoJSON',
      geometry: OTHER_GEOMETRY,
      numPolygons: 1,
    });
    await user.click(screen.getByRole('button', { name: strings.REPLACE_FILE }));
    await submitUploadModal(user, 'replacement.geojson');

    expect(await screen.findByText(/replacement\.geojson/)).toBeInTheDocument();
    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features).toHaveLength(1));
  });

  it('keeps the boundary on the map when a file is removed and a new one uploaded', async () => {
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
    await user.click(await screen.findByRole('button', { name: strings.REMOVE }));

    mockPost(PARSE_URL, {
      areaHa: 500,
      filename: 'replacement.geojson',
      format: 'GeoJSON',
      geometry: OTHER_GEOMETRY,
      numPolygons: 1,
    });
    await uploadBoundaryFile(user, 'replacement.geojson');

    expect(await screen.findByText(/replacement\.geojson/)).toBeInTheDocument();
    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features).toHaveLength(1));
  });

  it('removes the uploaded file summary and brings back the chooser when the upload is undone', async () => {
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
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map undo' }));

    expect(await screen.findByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(/site\.geojson/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.REPLACE_FILE })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.REMOVE })).not.toBeInTheDocument();
  });

  it('restores the uploaded file summary when an undone upload is redone', async () => {
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
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map undo' }));
    expect(await screen.findByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map redo' }));

    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REPLACE_FILE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REMOVE })).toBeInTheDocument();
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
  });

  it('removes the uploaded file summary when the map clears the boundary', async () => {
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
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map clear boundary' }));

    await waitFor(() => expect(screen.queryByText(/site\.geojson/)).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: strings.REPLACE_FILE })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.REMOVE })).not.toBeInTheDocument();
  });

  it('keeps the uploaded file summary when the map edits the boundary without clearing it', async () => {
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
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map edit boundary' }));

    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]).toEqual(EDITED_BOUNDARY));
    expect(screen.getByText(/site\.geojson/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REPLACE_FILE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.REMOVE })).toBeInTheDocument();
  });
});

import React, { useEffect } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import ToastSnackbar from 'src/components/ToastSnackbar';
import { EditorStepperContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorStepper';
import SiteBoundary from 'src/scenes/PlantingSitesRouter/edit/editor/SiteBoundary';
import type { OnValidate } from 'src/scenes/PlantingSitesRouter/edit/editor/types';
import strings from 'src/strings';
import { buildDraftPlantingSite, mockPost, renderWithProviders } from 'src/test-utils';

// Mapbox needs a real GL context, so stand in for the map, record the boundary handed to it on
// every render and on every mount, and expose its controls as plain buttons.
const mapBoundaries = rstest.hoisted(() => [] as (FeatureCollection | undefined)[]);
const mapMounts = rstest.hoisted(() => [] as (FeatureCollection | undefined)[]);
const mapEdit = rstest.hoisted(() => ({ boundary: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/NewMap/EditableMap', () => {
  const MockEditableMap = ({
    drawer,
    editableBoundary,
    onEditableBoundaryChanged,
    onRedo,
    onUndo,
    overlay,
  }: EditableMapProps) => {
    mapBoundaries.push(editableBoundary);
    useEffect(() => {
      mapMounts.push(editableBoundary);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
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
        {drawer}
        {overlay}
      </div>
    );
  };

  return { __esModule: true, default: MockEditableMap };
});

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

// close enough to GEOMETRY that a boundary made of both stays under the bounding box limit
const NEARBY_GEOMETRY: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0.03, 0],
      [0.03, 0.02],
      [0.05, 0.02],
      [0.05, 0],
      [0.03, 0],
    ],
  ],
};

const TWO_POLYGONS: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [GEOMETRY.coordinates, NEARBY_GEOMETRY.coordinates],
};

// what the map hands back when the user reshapes the boundary instead of uploading it
const EDITED_BOUNDARY: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', id: 1, properties: {}, geometry: OTHER_GEOMETRY }],
};

const site = buildDraftPlantingSite();

const lastMountedGeometry = () => mapMounts[mapMounts.length - 1]?.features[0]?.geometry;

const polygonsCombinedMessage = (numPolygons: number) =>
  strings.formatString(strings.SITE_BOUNDARY_POLYGONS_COMBINED, numPolygons) as string;

const stepperContext = {
  busy: false,
  collapsed: false,
  currentStep: 'site_boundary' as const,
  onBack: rstest.fn(),
  onNext: rstest.fn(),
  onToggleCollapsed: rstest.fn(),
  steps: [{ type: 'site_boundary' as const, label: 'Site Boundary' }],
};

const renderSiteBoundary = (siteToRender = site, onValidate?: OnValidate) =>
  renderWithProviders(
    <EditorStepperContext.Provider value={stepperContext}>
      <ToastSnackbar />
      <SiteBoundary onValidate={onValidate} site={siteToRender} />
    </EditorStepperContext.Provider>,
    {
      // the step's tutorial dialog opens on mount otherwise, and covers the map
      currentUser: { userPreferences: { 'dont-show-site-boundary-instructions': true } },
    }
  );

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
    mapBoundaries.length = 0;
    mapMounts.length = 0;
    mapEdit.boundary = EDITED_BOUNDARY;
  });

  it('offers a choice of upload or drawing when the site has no boundary', () => {
    renderSiteBoundary();

    expect(screen.getByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(strings.SITE_BOUNDARY_UPLOAD_DESCRIPTION, { exact: false })).toBeInTheDocument();
  });

  it('dismisses the chooser without opening the upload modal when the user chooses to draw', async () => {
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));

    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).not.toBeInTheDocument();
  });

  it('does not show the drawing banner before a method is chosen', () => {
    renderSiteBoundary();

    expect(screen.getByText(strings.BOUNDARY_METHOD_TITLE)).toBeInTheDocument();
    expect(screen.queryByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).not.toBeInTheDocument();
  });

  it('tells the user they are drawing on the map once they choose to draw', async () => {
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));

    expect(screen.getByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).toBeInTheDocument();
  });

  it('opens the upload modal when a user drawing the boundary chooses to upload a file instead', async () => {
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));

    expect(screen.getByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeInTheDocument();
  });

  it('returns to drawing, not the method chooser, when the upload modal opened from drawing is cancelled', async () => {
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).not.toBeInTheDocument());
    expect(screen.getByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).toBeInTheDocument();
    expect(screen.queryByText(strings.BOUNDARY_METHOD_TITLE)).not.toBeInTheDocument();
  });

  it('replaces the drawing banner with the uploaded file summary when a file is uploaded while drawing', async () => {
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
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.UPLOAD_SPATIAL_FILES));

    expect(screen.getByText(strings.UPLOAD_SITE_BOUNDARY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD })).toBeInTheDocument();
  });

  it('replaces the chooser with a summary of the uploaded file and puts its boundary on the map', async () => {
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
    expect(screen.queryByText(polygonsCombinedMessage(1))).not.toBeInTheDocument();
    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features).toHaveLength(1));
  });

  it('warns that multiple polygons were combined into one boundary', async () => {
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 2,
    });
    const { user } = renderSiteBoundary();

    await uploadBoundaryFile(user, 'site.geojson');

    expect(await screen.findByText(polygonsCombinedMessage(2))).toBeInTheDocument();
    expect(
      screen.queryByText(strings.SITE_BOUNDARY_POLYGONS_COMBINED_DETAILED_SITE_REQUIRED, { exact: false })
    ).not.toBeInTheDocument();
  });

  it('tells a simple site that combining polygons requires a detailed site', async () => {
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 2,
    });
    const { user } = renderSiteBoundary(buildDraftPlantingSite({ siteType: 'Simple' }));

    await uploadBoundaryFile(user, 'site.geojson');

    expect(
      await screen.findByText(
        `${polygonsCombinedMessage(2)} ${strings.SITE_BOUNDARY_POLYGONS_COMBINED_DETAILED_SITE_REQUIRED}`
      )
    ).toBeInTheDocument();
  });

  it('brings back the chooser when the uploaded file is removed', async () => {
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

  it('returns to drawing when undoing an upload that replaced a drawn boundary', async () => {
    mockPost(PARSE_URL, {
      areaHa: 480,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: GEOMETRY,
      numPolygons: 1,
    });
    const { user } = renderSiteBoundary();

    await user.click(methodTile(strings.DRAW_BOUNDARY_WITHIN_MAP));
    await user.click(screen.getByRole('button', { name: 'map edit boundary' }));
    await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]).toEqual(EDITED_BOUNDARY));
    await user.click(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD }));
    await submitUploadModal(user, 'site.geojson');
    expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'map undo' }));

    expect(await screen.findByText(strings.SITE_BOUNDARY_DRAWING_ON_MAP)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.UPLOAD_A_FILE_INSTEAD })).toBeInTheDocument();
    expect(screen.queryByText(/site\.geojson/)).not.toBeInTheDocument();
    expect(mapBoundaries[mapBoundaries.length - 1]).toEqual(EDITED_BOUNDARY);
  });

  it('restores the uploaded file summary when an undone upload is redone', async () => {
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

  it('puts each polygon of an uploaded multipolygon on the map as its own feature', async () => {
    mockPost(PARSE_URL, {
      areaHa: 960,
      filename: 'site.geojson',
      format: 'GeoJSON',
      geometry: TWO_POLYGONS,
      numPolygons: 2,
    });
    const { user } = renderSiteBoundary();

    await uploadBoundaryFile(user, 'site.geojson');

    await waitFor(() =>
      expect(mapBoundaries[mapBoundaries.length - 1]?.features.map((feature) => feature.geometry)).toEqual([
        GEOMETRY,
        NEARBY_GEOMETRY,
      ])
    );
    const ids = mapBoundaries[mapBoundaries.length - 1]?.features.map((feature) => feature.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('opens a saved multipolygon boundary with each polygon as its own feature', () => {
    renderSiteBoundary(buildDraftPlantingSite({ boundary: TWO_POLYGONS }));

    expect(mapMounts[0]?.features.map((feature) => feature.geometry)).toEqual([GEOMETRY, NEARBY_GEOMETRY]);
    const ids = mapMounts[0]?.features.map((feature) => feature.id);
    expect(new Set(ids).size).toBe(2);
  });

  it('drops a polygon deleted on the map from the validated site boundary', async () => {
    const onValidate = { allowIncomplete: true, apply: rstest.fn() };
    const { user } = renderSiteBoundary(buildDraftPlantingSite({ boundary: TWO_POLYGONS }), onValidate);
    const remaining = mapMounts[0]!.features[1];
    mapEdit.boundary = { type: 'FeatureCollection', features: [remaining] };

    await user.click(screen.getByRole('button', { name: 'map edit boundary' }));

    await waitFor(() =>
      expect(onValidate.apply).toHaveBeenLastCalledWith(
        false,
        expect.objectContaining({
          boundary: { type: 'MultiPolygon', coordinates: [NEARBY_GEOMETRY.coordinates] },
        })
      )
    );
  });

  describe('refitting the map to the uploaded file', () => {
    const uploadThenReplace = async (user: ReturnType<typeof renderSiteBoundary>['user']) => {
      mockPost(PARSE_URL, {
        areaHa: 480,
        filename: 'site.geojson',
        format: 'GeoJSON',
        geometry: GEOMETRY,
        numPolygons: 1,
      });
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
      await waitFor(() => expect(lastMountedGeometry()).toEqual(OTHER_GEOMETRY));
    };

    it('refits the map to the earlier file when undo goes back past a replacement', async () => {
      const { user } = renderSiteBoundary();

      await uploadThenReplace(user);
      const mountsBeforeUndo = mapMounts.length;

      await user.click(screen.getByRole('button', { name: 'map undo' }));

      expect(await screen.findByText(/site\.geojson/)).toBeInTheDocument();
      await waitFor(() => expect(mapMounts.length).toBeGreaterThan(mountsBeforeUndo));
      expect(lastMountedGeometry()).toEqual(GEOMETRY);
    });

    it('refits the map to the replacement file when the undone replacement is redone', async () => {
      const { user } = renderSiteBoundary();

      await uploadThenReplace(user);
      await user.click(screen.getByRole('button', { name: 'map undo' }));
      await waitFor(() => expect(lastMountedGeometry()).toEqual(GEOMETRY));
      const mountsBeforeRedo = mapMounts.length;

      await user.click(screen.getByRole('button', { name: 'map redo' }));

      expect(await screen.findByText(/replacement\.geojson/)).toBeInTheDocument();
      await waitFor(() => expect(mapMounts.length).toBeGreaterThan(mountsBeforeRedo));
      expect(lastMountedGeometry()).toEqual(OTHER_GEOMETRY);
    });

    it('does not refit the map when the user edits the uploaded boundary on the map', async () => {
      mockPost(PARSE_URL, {
        areaHa: 480,
        filename: 'site.geojson',
        format: 'GeoJSON',
        geometry: GEOMETRY,
        numPolygons: 1,
      });
      const { user } = renderSiteBoundary();

      await uploadBoundaryFile(user, 'site.geojson');
      await waitFor(() => expect(lastMountedGeometry()).toEqual(GEOMETRY));
      const mountsBeforeEdit = mapMounts.length;

      await user.click(screen.getByRole('button', { name: 'map edit boundary' }));

      await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]).toEqual(EDITED_BOUNDARY));
      expect(mapMounts).toHaveLength(mountsBeforeEdit);
    });

    it('does not refit the map when undoing an edit made to the same uploaded file', async () => {
      mockPost(PARSE_URL, {
        areaHa: 480,
        filename: 'site.geojson',
        format: 'GeoJSON',
        geometry: GEOMETRY,
        numPolygons: 1,
      });
      const { user } = renderSiteBoundary();

      await uploadBoundaryFile(user, 'site.geojson');
      await waitFor(() => expect(lastMountedGeometry()).toEqual(GEOMETRY));
      await user.click(screen.getByRole('button', { name: 'map edit boundary' }));
      await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]).toEqual(EDITED_BOUNDARY));
      const mountsBeforeUndo = mapMounts.length;

      await user.click(screen.getByRole('button', { name: 'map undo' }));

      await waitFor(() => expect(mapBoundaries[mapBoundaries.length - 1]?.features[0]?.geometry).toEqual(GEOMETRY));
      expect(screen.getByText(/site\.geojson/)).toBeInTheDocument();
      expect(mapMounts).toHaveLength(mountsBeforeUndo);
    });
  });
});

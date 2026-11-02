import React, { useEffect, useState } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { Feature, FeatureCollection, Position } from 'geojson';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import { EditorMode, EditorModeContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorModeContext';
import { EditorStepperContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorStepper';
import Strata from 'src/scenes/PlantingSitesRouter/edit/editor/Strata';
import type { OnValidate } from 'src/scenes/PlantingSitesRouter/edit/editor/types';
import { defaultStratumPayload } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import { buildDraftPlantingSite, renderWithProviders } from 'src/test-utils';
import type { PopupInfo } from 'src/types/Map';
import type { MinimalStratum } from 'src/types/Tracking';

// Mapbox needs a real GL context, so stand in for the map with buttons that open a stratum's
// popup, delete a stratum, and draw the cutting polygon. Popups open and close the way EditableMap's
// do: from overridePopupInfo or a click, closed through the onClose handed to the renderer.
const mapEdit = rstest.hoisted(() => ({ cut: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/NewMap/EditableMap', () => {
  const MockEditableMap = ({
    drawer,
    featureSelectorOnClick,
    onDeleteFeature,
    onEditableBoundaryChanged,
    overridePopupInfo,
    popupRenderer,
    readOnlyBoundary,
  }: EditableMapProps) => {
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
    useEffect(() => {
      if (overridePopupInfo) {
        setTimeout(() => setPopupInfo(overridePopupInfo), 0);
      }
    }, [overridePopupInfo]);
    const strata = readOnlyBoundary?.find((boundary) => boundary.id === 'stratum')?.data.features ?? [];
    const open = (feature: Feature) => {
      const selected = featureSelectorOnClick?.([{ boundaryId: 'stratum', feature }]);
      if (selected) {
        setPopupInfo({
          id: selected.feature.properties?.id ?? selected.feature.id,
          lat: 0,
          lng: 0,
          properties: selected.feature.properties,
          sourceId: selected.boundaryId,
        });
      }
    };
    return (
      <div>
        {strata.map((feature) => (
          <React.Fragment key={feature.id}>
            <button onClick={() => open(feature)}>{`map open ${feature.properties?.name}`}</button>
            <button onClick={() => onDeleteFeature?.('stratum', feature.id!)}>
              {`map delete ${feature.properties?.name}`}
            </button>
          </React.Fragment>
        ))}
        <button onClick={() => onEditableBoundaryChanged(mapEdit.cut)}>map cut</button>
        {popupInfo && (
          <React.Fragment key={popupInfo.id}>
            {popupRenderer?.render(popupInfo.properties, () => setPopupInfo(null))}
          </React.Fragment>
        )}
        {drawer}
      </div>
    );
  };

  return { __esModule: true, default: MockEditableMap };
});

const square = (west: number, south: number, east: number, north: number): Position[][] => [
  [
    [west, south],
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ],
];

// two ~1.1km strata side by side, filling the site boundary
const site = buildDraftPlantingSite({
  boundary: { type: 'MultiPolygon', coordinates: [square(0, 0, 0.02, 0.01)] },
  siteEditStep: 'stratum_boundaries',
  strata: [
    defaultStratumPayload({
      boundary: { type: 'MultiPolygon', coordinates: [square(0, 0, 0.01, 0.01)] },
      id: 10,
      initialPlantingDensity: 1500,
      name: 'West',
    }),
    defaultStratumPayload({
      boundary: { type: 'MultiPolygon', coordinates: [square(0.01, 0, 0.02, 0.01)] },
      id: 11,
      initialPlantingDensity: 1500,
      name: 'East',
    }),
  ],
});

// covers the eastern half of the site, which is all West once East has been merged into it
const EAST_HALF_CUT: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'cut',
      properties: {},
      geometry: { type: 'Polygon', coordinates: square(0.01, -0.001, 0.03, 0.011) },
    },
  ],
};

const stepperContext = {
  busy: false,
  collapsed: false,
  currentStep: 'stratum_boundaries' as const,
  onToggleCollapsed: rstest.fn(),
  steps: [{ type: 'stratum_boundaries' as const, label: 'Strata' }],
};

const renderStrata = (mode: EditorMode, onValidate?: OnValidate, editedSite = site) =>
  renderWithProviders(
    <EditorModeContext.Provider value={mode}>
      <EditorStepperContext.Provider value={stepperContext}>
        <Strata onValidate={onValidate} site={editedSite} />
      </EditorStepperContext.Provider>
    </EditorModeContext.Provider>,
    {
      // the step's tutorial dialog opens on mount otherwise, and covers the map
      currentUser: { userPreferences: { 'dont-show-site-stratum-boundaries-instructions': true } },
    }
  );

// Textfield's label points at a wrapper rather than the input, so the popup's name field is found as
// its only text input
const nameField = () => screen.queryByRole('textbox');

type User = ReturnType<typeof renderStrata>['user'];

// deleting East frees the eastern half of the site, so the cut makes one new stratum there
const cutNewStratum = async (user: User) => {
  await user.click(screen.getByRole('button', { name: 'map delete East' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'map delete East' })).not.toBeInTheDocument());
  await user.click(screen.getByRole('button', { name: 'map cut' }));
};

const stratumNames = (onValidate: { apply: ReturnType<typeof rstest.fn> }): string[] =>
  (onValidate.apply.mock.lastCall?.[1]?.strata ?? []).map((stratum: { name: string }) => stratum.name);

describe('Strata', () => {
  beforeEach(() => {
    mapEdit.cut = EAST_HALF_CUT;
  });

  it('lets a draft set the initial planting density of a stratum', async () => {
    const { user } = renderStrata('draft');

    await user.click(screen.getByRole('button', { name: 'map open West' }));

    expect(screen.getByText(strings.NAME)).toBeInTheDocument();
    expect(screen.getByText(strings.INITIAL_PLANTING_DENSITY)).toBeInTheDocument();
  });

  it('hides initial planting density in edit mode', async () => {
    const { user } = renderStrata('edit');

    await user.click(screen.getByRole('button', { name: 'map open West' }));

    expect(screen.getByText(strings.NAME)).toBeInTheDocument();
    expect(screen.queryByText(strings.INITIAL_PLANTING_DENSITY)).not.toBeInTheDocument();
  });

  it('new stratum after delete gets a negative key', async () => {
    const onValidate = { allowIncomplete: false, apply: rstest.fn() };
    const { user } = renderStrata('edit', onValidate);

    await user.click(screen.getByRole('button', { name: 'map delete East' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'map delete East' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'map cut' }));

    await waitFor(() => expect(onValidate.apply.mock.lastCall?.[1]?.strata).toHaveLength(2));
    const [hasErrors, data] = onValidate.apply.mock.lastCall!;
    expect(hasErrors).toBe(false);
    const ids: number[] = data.strata.map((stratum: { id: number }) => stratum.id);
    expect(ids).not.toContain(11);
    expect(ids).toContain(10);
    expect(ids.filter((id) => id < 0)).toHaveLength(1);
  });

  it('gives a new stratum and a reconciled stratum different substratum keys', async () => {
    // West's only substratum covers its western edge, so moving West's identity east leaves it with none
    const [west, east] = site.strata!;
    const partialSite = {
      ...site,
      strata: [
        {
          ...west,
          substrata: [
            {
              ...west.substrata[0],
              boundary: { type: 'MultiPolygon' as const, coordinates: [square(0, 0, 0.004, 0.01)] },
              id: 20,
            },
          ],
        },
        { ...east, substrata: [{ ...east.substrata[0], id: 21 }] },
      ],
    };
    mapEdit.cut = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'cut',
          properties: {},
          geometry: { type: 'Polygon', coordinates: square(0.005, -0.001, 0.03, 0.011) },
        },
      ],
    };
    const onValidate = { allowIncomplete: false, apply: rstest.fn() };
    const { user } = renderStrata('edit', onValidate, partialSite);

    await cutNewStratum(user);

    await waitFor(() => expect(onValidate.apply.mock.lastCall?.[1]?.strata).toHaveLength(2));
    const substratumIds: number[] = onValidate.apply.mock
      .lastCall![1].strata.flatMap((stratum: MinimalStratum) => stratum.substrata)
      .map((substratum: { id: number }) => substratum.id);
    expect(substratumIds).toHaveLength(2);
    expect(new Set(substratumIds).size).toBe(2);
  });

  it.each(['draft', 'edit'] as const)(
    "saving a new stratum's name closes its popup and renames it (%s)",
    async (mode) => {
      const onValidate = { allowIncomplete: false, apply: rstest.fn() };
      const { user } = renderStrata(mode, onValidate);

      await cutNewStratum(user);
      const field = await screen.findByRole('textbox');
      await user.clear(field);
      await user.type(field, 'North');
      await user.click(screen.getByRole('button', { name: strings.SAVE }));

      await waitFor(() => expect(nameField()).not.toBeInTheDocument());
      await waitFor(() => expect(stratumNames(onValidate)).toContain('North'));
    }
  );

  it.each(['draft', 'edit'] as const)(
    "reopening a new stratum's popup after cancel lets it keep its name (%s)",
    async (mode) => {
      const { user } = renderStrata(mode);

      await cutNewStratum(user);
      const newName = ((await screen.findByRole('textbox')) as HTMLInputElement).value;
      await user.click(screen.getByRole('button', { name: strings.CANCEL }));
      await waitFor(() => expect(nameField()).not.toBeInTheDocument());

      await user.click(screen.getByRole('button', { name: `map open ${newName}` }));
      expect(nameField()).toHaveValue(newName);
      await user.click(screen.getByRole('button', { name: strings.SAVE }));

      expect(screen.queryByText(strings.STRATUM_NAME_IN_USE)).not.toBeInTheDocument();
      await waitFor(() => expect(nameField()).not.toBeInTheDocument());
    }
  );
});

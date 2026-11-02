import React, { useEffect, useState } from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { FeatureCollection, MultiPolygon, Position } from 'geojson';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import { EditorMode, EditorModeContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorModeContext';
import { EditorStepperContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorStepper';
import Substrata from 'src/scenes/PlantingSitesRouter/edit/editor/Substrata';
import type { OnValidate } from 'src/scenes/PlantingSitesRouter/edit/editor/types';
import strings from 'src/strings';
import { buildDraftPlantingSite, renderWithProviders } from 'src/test-utils';
import type { PopupInfo } from 'src/types/Map';
import type { MinimalStratum } from 'src/types/Tracking';

// Mapbox needs a real GL context, so stand in for the map with a button that draws the cutting
// polygon. Popups open and close the way EditableMap's do: from overridePopupInfo, closed through
// the onClose handed to the renderer.
const mapEdit = rstest.hoisted(() => ({ cut: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/NewMap/EditableMap', () => {
  const MockEditableMap = ({
    drawer,
    onEditableBoundaryChanged,
    overridePopupInfo,
    popupRenderer,
  }: EditableMapProps) => {
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
    useEffect(() => {
      if (overridePopupInfo) {
        setTimeout(() => setPopupInfo(overridePopupInfo), 0);
      }
    }, [overridePopupInfo]);
    return (
      <div>
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

const siteBoundary: MultiPolygon = { type: 'MultiPolygon', coordinates: [square(0, 0, 0.02, 0.01)] };

// one ~2.2km stratum holding a single substratum that fills it
const stratum: MinimalStratum = {
  boundary: siteBoundary,
  id: 10,
  initialPlantingDensity: 1500,
  name: 'Main',
  substrata: [{ boundary: siteBoundary, fullName: 'Main-A', id: 20, name: 'A', plantingCompleted: false }],
};

const site = buildDraftPlantingSite({
  boundary: siteBoundary,
  siteEditStep: 'substratum_boundaries',
  strata: [stratum],
});

// covers the eastern half of the stratum
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
  currentStep: 'substratum_boundaries' as const,
  onToggleCollapsed: rstest.fn(),
  steps: [{ type: 'substratum_boundaries' as const, label: 'Substrata' }],
};

const renderSubstrata = (mode: EditorMode, onValidate?: OnValidate) =>
  renderWithProviders(
    <EditorModeContext.Provider value={mode}>
      <EditorStepperContext.Provider value={stepperContext}>
        <Substrata onValidate={onValidate} site={site} />
      </EditorStepperContext.Provider>
    </EditorModeContext.Provider>
  );

// Textfield's label points at a wrapper rather than the input, so the popup's name field is found as
// its only text input
const nameField = () => screen.queryByRole('textbox');

describe('Substrata', () => {
  beforeEach(() => {
    mapEdit.cut = EAST_HALF_CUT;
  });

  it.each(['draft', 'edit'] as const)("saving a new substratum's name closes its popup (%s)", async (mode) => {
    const onValidate = { allowIncomplete: false, apply: rstest.fn() };
    const { user } = renderSubstrata(mode, onValidate);

    await user.click(screen.getByRole('button', { name: 'map cut' }));
    const field = await screen.findByRole('textbox');
    await user.clear(field);
    await user.type(field, 'North');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(nameField()).not.toBeInTheDocument());
    await waitFor(() => {
      const substrata = onValidate.apply.mock.lastCall?.[1]?.strata?.[0]?.substrata ?? [];
      expect(substrata.map((substratum: { name: string }) => substratum.name)).toContain('North');
    });
  });
});

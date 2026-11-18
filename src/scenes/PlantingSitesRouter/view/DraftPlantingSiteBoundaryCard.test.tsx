import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import type { MapLayer } from 'src/components/NewMap/types';
import DraftPlantingSiteBoundaryCard from 'src/scenes/PlantingSitesRouter/view/DraftPlantingSiteBoundaryCard';
import strings from 'src/strings';
import {
  RenderWithProvidersOptions,
  buildDraftPlantingSite,
  buildStratum,
  buildSubstratum,
  captureRequests,
  renderWithProviders,
} from 'src/test-utils';
import { DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { MultiPolygon } from 'src/types/Tracking';

// Mapbox GL needs a real canvas, so stand in for the map and name what it was asked to draw. This
// is mocked one level below `DraftPlantingSiteBoundaryMap` so that the component deciding which
// layers the site, its strata and its exclusion areas become is still the real one.
rstest.mock('src/components/NewMap', () => {
  const MockMap = ({ mapLayers }: { mapLayers?: MapLayer[] }) => (
    <div>{`map layers: ${(mapLayers ?? []).map((layer) => `${layer.layerId}(${layer.features.length})`).join(', ') || 'none'}`}</div>
  );

  return { __esModule: true, default: MockMap };
});

const MAPBOX_TOKEN_URL = '/api/v1/tracking/mapbox/token';

/** A square 0.1° on a side at the equator, which `@turf/area` makes 12,364.3 ha. */
const BOUNDARY: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 0.1],
        [0.1, 0.1],
        [0.1, 0],
        [0, 0],
      ],
    ],
  ],
};
const BOUNDARY_AREA = '12,364.3 ha';

/** Two holes punched out of the boundary, 247.3 ha between them. */
const EXCLUSION: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0.01, 0.01],
        [0.01, 0.02],
        [0.02, 0.02],
        [0.02, 0.01],
        [0.01, 0.01],
      ],
    ],
    [
      [
        [0.04, 0.04],
        [0.04, 0.05],
        [0.05, 0.05],
        [0.05, 0.04],
        [0.04, 0.04],
      ],
    ],
  ],
};
const EXCLUSION_AREA = '247.3 ha';

/**
 * `Textfield` in display mode points its `<label for>` at an id no element carries, so the label
 * and the value it describes are not associated for a query to follow. Pair them up by walking the
 * field the label sits in instead.
 */
const detailValue = (label: string): string | undefined => {
  const field = Array.from(document.querySelectorAll('.textfield')).find(
    (box) => box.querySelector('.textfield-label')?.firstChild?.textContent === label
  );
  if (!field) {
    throw new Error(`No detail field labelled "${label}"`);
  }
  return field.querySelector('.textfield-value--display')?.textContent ?? undefined;
};

/** The requests the map made for a Mapbox token, which it needs before it can render. */
let tokenRequests: Request[];

const renderCard = async (overrides: Partial<DraftPlantingSite> = {}, options: RenderWithProvidersOptions = {}) => {
  const rendered = renderWithProviders(
    <DraftPlantingSiteBoundaryCard plantingSite={buildDraftPlantingSite(overrides)} />,
    options
  );

  // A drawn boundary puts a map on the page, and the map asks for a token on mount. Wait for that
  // to land so the render it triggers happens while the test is still running.
  if (overrides.boundary) {
    await waitFor(() => expect(tokenRequests).toHaveLength(1));
  }

  return rendered;
};

describe('DraftPlantingSiteBoundaryCard', () => {
  beforeEach(() => {
    tokenRequests = captureRequests('get', MAPBOX_TOKEN_URL, { token: 'test-token' });
  });

  it('invites the user to add a boundary when the draft has none', async () => {
    await renderCard({ boundary: undefined });

    expect(screen.getByText(strings.NO_SITE_BOUNDARY_YET)).toBeInTheDocument();
    expect(screen.getByText(strings.NO_SITE_BOUNDARY_YET_DESCRIPTION)).toBeInTheDocument();
    expect(screen.queryByText(/map layers/)).not.toBeInTheDocument();
  });

  it('draws the boundary and reports the area it covers', async () => {
    await renderCard({ boundary: BOUNDARY, siteType: 'Simple' });

    expect(screen.getByText('map layers: site(1)')).toBeInTheDocument();
    expect(detailValue(strings.TOTAL_AREA)).toBe(BOUNDARY_AREA);
    expect(screen.queryByText(strings.NO_SITE_BOUNDARY_YET)).not.toBeInTheDocument();
  });

  it('formats the area for the active locale', async () => {
    await renderCard({ boundary: BOUNDARY }, { localization: { activeLocale: 'fr', selectedLocale: 'fr' } });

    // The group separator French uses here is a narrow no-break space, which a literal would hide.
    expect(detailValue(strings.TOTAL_AREA)).toMatch(/^12.364,3 ha$/);
  });

  it('counts the exclusion areas and draws them over the boundary', async () => {
    await renderCard({ boundary: BOUNDARY, exclusion: EXCLUSION, siteType: 'Simple' });

    expect(detailValue(strings.EXCLUSION_AREAS)).toBe(`2 · ${EXCLUSION_AREA}`);
    expect(screen.getByText('map layers: site(1), exclusions(1)')).toBeInTheDocument();
  });

  it('leaves the exclusion areas empty for a draft that has none', async () => {
    await renderCard({ boundary: BOUNDARY, siteType: 'Simple' });

    expect(detailValue(strings.EXCLUSION_AREAS)).toBe('—');
  });

  it('counts the strata and substrata of a detailed site, and draws them', async () => {
    await renderCard({
      boundary: BOUNDARY,
      siteType: 'Detailed',
      strata: [
        buildStratum({ id: 1, substrata: [buildSubstratum({ id: 1 }), buildSubstratum({ id: 2 })] }),
        buildStratum({ id: 2, substrata: [buildSubstratum({ id: 3 })] }),
      ],
    });

    expect(detailValue(strings.STRATA)).toBe('2');
    expect(detailValue(strings.SUBSTRATA)).toBe('3');
    expect(screen.getByText('map layers: site(1), strata(2), substrata(3)')).toBeInTheDocument();
  });

  it('does not report strata for a simple site, which has none', async () => {
    await renderCard({ boundary: BOUNDARY, siteType: 'Simple', strata: undefined });

    expect(() => detailValue(strings.STRATA)).toThrow();
    expect(() => detailValue(strings.SUBSTRATA)).toThrow();
  });

  it.each([
    ['site_boundary', () => strings.SITE_BOUNDARY],
    ['exclusion_areas', () => strings.EXCLUSION_AREAS],
    ['stratum_boundaries', () => strings.STRATUM_BOUNDARIES],
    ['substratum_boundaries', () => strings.SUBSTRATUM_BOUNDARIES],
  ])('says which step of the setup a draft stopped at %s still has to go through', async (siteEditStep, label) => {
    await renderCard({ boundary: BOUNDARY, siteEditStep: siteEditStep as SiteEditStep, siteType: 'Simple' });

    expect(detailValue(strings.SETUP_REMAINING)).toBe(label());
  });
});

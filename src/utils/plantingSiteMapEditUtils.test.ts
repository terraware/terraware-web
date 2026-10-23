import { buildPlantingSite, buildStratum, buildSubstratum } from 'src/test-utils/fixtures/plantingSite';
import { EditorPlantingSite } from 'src/types/PlantingSite';
import { MinimalStratum, MinimalSubstratum, MultiPolygon } from 'src/types/Tracking';

import { getEditedCompletedSubstrata, toEditorSite, toPlantingSiteMapEdit } from './plantingSiteMapEditUtils';

const square = (x: number): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [x, 0],
        [x, 1],
        [x + 1, 1],
        [x + 1, 0],
        [x, 0],
      ],
    ],
  ],
});

const substratum = (id: number, name: string): MinimalSubstratum => ({
  boundary: square(id),
  fullName: name,
  id,
  name,
  plantingCompleted: false,
});

const stratum = (id: number, name: string, substrata: MinimalSubstratum[]): MinimalStratum => ({
  boundary: square(id),
  id,
  initialPlantingDensity: 1500,
  name,
  substrata,
});

const loaded = buildPlantingSite({
  id: 5,
  strata: [
    buildStratum({
      id: 10,
      name: 'Stratum 10',
      substrata: [buildSubstratum({ id: 100, name: 'A' }), buildSubstratum({ id: 101, name: 'B' })],
    }),
  ],
});

const editorSite = (strata: MinimalStratum[], overrides: Partial<EditorPlantingSite> = {}): EditorPlantingSite => ({
  ...toEditorSite(loaded),
  strata,
  ...overrides,
});

describe('toEditorSite', () => {
  it('copies the site details and map as a detailed site', () => {
    const site = buildPlantingSite({
      description: 'description',
      exclusion: square(7),
      projectId: 3,
      timeZone: 'America/Los_Angeles',
    });

    const result = toEditorSite(site);

    expect(result).toMatchObject({
      boundary: site.boundary,
      description: 'description',
      exclusion: square(7),
      id: site.id,
      name: site.name,
      organizationId: site.organizationId,
      projectId: 3,
      siteType: 'Detailed',
      timeZone: 'America/Los_Angeles',
    });
  });

  it('keeps the server ids, names and boundaries of strata and substrata', () => {
    const result = toEditorSite(loaded);

    expect(result.strata).toHaveLength(1);
    expect(result.strata?.[0]).toMatchObject({ boundary: loaded.strata![0].boundary, id: 10, name: 'Stratum 10' });
    expect(result.strata?.[0].substrata.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 100, name: 'A' },
      { id: 101, name: 'B' },
    ]);
  });
});

describe('toPlantingSiteMapEdit', () => {
  it('sends only the ids of strata and substrata loaded from the server', () => {
    const site = editorSite([
      stratum(10, 'Stratum 10', [substratum(100, 'A'), substratum(-1, 'C')]),
      stratum(-2, 'Stratum New', [substratum(-2, 'A')]),
    ]);

    const result = toPlantingSiteMapEdit(site, loaded);

    expect(result.strata).toEqual([
      {
        id: 10,
        name: 'Stratum 10',
        substrata: [
          { boundary: square(100), id: 100, name: 'A' },
          { boundary: square(-1), name: 'C' },
        ],
      },
      { name: 'Stratum New', substrata: [{ boundary: square(-2), name: 'A' }] },
    ]);
    expect(result.strata[1]).not.toHaveProperty('id');
    expect(result.strata[0].substrata[1]).not.toHaveProperty('id');
  });

  it('does not send a stratum key that only matches a loaded substratum id', () => {
    const site = editorSite([stratum(100, 'Stratum 100', [substratum(101, 'B')])]);

    const result = toPlantingSiteMapEdit(site, loaded);

    expect(result.strata[0]).not.toHaveProperty('id');
    expect(result.strata[0].substrata[0].id).toBe(101);
  });

  it('passes the boundary and exclusion through', () => {
    const site = editorSite([stratum(10, 'Stratum 10', [substratum(100, 'A')])], {
      boundary: square(20),
      exclusion: square(21),
    });

    const result = toPlantingSiteMapEdit(site, loaded);

    expect(result.boundary).toEqual(square(20));
    expect(result.exclusion).toEqual(square(21));
  });

  it('only includes substrata to mark incomplete when given', () => {
    const site = editorSite([stratum(10, 'Stratum 10', [substratum(100, 'A')])]);

    expect(toPlantingSiteMapEdit(site, loaded)).not.toHaveProperty('substratumIdsToMarkIncomplete');
    expect(toPlantingSiteMapEdit(site, loaded, [100]).substratumIdsToMarkIncomplete).toEqual([100]);
  });
});

describe('getEditedCompletedSubstrata', () => {
  const completedSite = buildPlantingSite({
    strata: [
      buildStratum({
        id: 10,
        name: 'Stratum 10',
        substrata: [
          buildSubstratum({ boundary: square(100), id: 100, name: 'A', plantingCompleted: true }),
          buildSubstratum({ boundary: square(101), id: 101, name: 'B', plantingCompleted: true }),
          buildSubstratum({ boundary: square(102), id: 102, name: 'C', plantingCompleted: false }),
          buildSubstratum({ boundary: square(103), id: 103, name: 'D', plantingCompleted: true }),
        ],
      }),
    ],
  });

  it('returns completed substrata whose boundaries changed', () => {
    const site: EditorPlantingSite = {
      ...toEditorSite(completedSite),
      strata: [
        stratum(10, 'Renamed', [
          { ...substratum(100, 'A'), boundary: square(200) },
          { ...substratum(101, 'B'), boundary: square(101) },
          { ...substratum(102, 'C'), boundary: square(202) },
          { ...substratum(-1, 'E'), boundary: square(103) },
        ]),
      ],
    };

    expect(getEditedCompletedSubstrata(site, completedSite)).toEqual([
      { id: 100, stratumName: 'Renamed', substratumName: 'A' },
    ]);
  });

  it('returns nothing when the map is unchanged', () => {
    expect(getEditedCompletedSubstrata(toEditorSite(completedSite), completedSite)).toEqual([]);
  });
});

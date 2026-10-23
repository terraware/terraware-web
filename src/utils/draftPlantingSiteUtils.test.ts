import { DraftStratumPayload } from 'src/queries/generated/draftPlantingSites';
import { DraftPlantingSite, DraftPlantingSitePayload } from 'src/types/PlantingSite';
import { MinimalStratum, MultiPolygon } from 'src/types/Tracking';

import { fromDraft, toDraft } from './draftPlantingSiteUtils';

const boundary: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [5, 5],
        [10, 5],
        [10, 10],
        [5, 10],
        [5, 5],
      ],
    ],
  ],
};

const exclusion: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [5, 50],
        [10, 50],
        [10, 100],
        [5, 100],
        [5, 50],
      ],
    ],
  ],
};

const stratum1: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 50],
        [100, 50],
        [100, 100],
        [50, 100],
        [50, 50],
      ],
    ],
  ],
};

const stratum2: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 50],
        [100, 50],
        [100, 100],
        [50, 100],
        [50, 50],
      ],
    ],
  ],
};

const substratum11: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 50],
        [100, 50],
        [100, 75],
        [50, 75],
        [50, 50],
      ],
    ],
  ],
};

const substratum12: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 75],
        [100, 75],
        [100, 100],
        [50, 100],
        [50, 75],
      ],
    ],
  ],
};

const substratum21: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 50],
        [100, 50],
        [100, 75],
        [50, 75],
        [50, 50],
      ],
    ],
  ],
};

const substratum22: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [50, 75],
        [100, 75],
        [100, 100],
        [50, 100],
        [50, 75],
      ],
    ],
  ],
};

const strata: MinimalStratum[] = [
  {
    boundary: stratum1,
    id: 1,
    name: 'stratum1',
    substrata: [
      {
        boundary: substratum11,
        fullName: 'substratum11',
        id: 1,
        name: 'substratum11',
        plantingCompleted: false,
      },
      {
        boundary: substratum12,
        fullName: 'substratum12',
        id: 2,
        name: 'substratum12',
        plantingCompleted: false,
      },
    ],
    initialPlantingDensity: 1500,
  },
  {
    boundary: stratum2,
    id: 2,
    name: 'stratum2',
    substrata: [
      {
        boundary: substratum21,
        fullName: 'substratum21',
        id: 1,
        name: 'substratum21',
        plantingCompleted: false,
      },
      {
        boundary: substratum22,
        fullName: 'substratum22',
        id: 2,
        name: 'substratum22',
        plantingCompleted: false,
      },
    ],
    initialPlantingDensity: 2500,
  },
];

const strataPayload: DraftStratumPayload[] = strata.map((stratum) => ({
  boundary: stratum.boundary,
  id: stratum.id,
  initialPlantingDensity: stratum.initialPlantingDensity,
  name: stratum.name,
  substrata: stratum.substrata.map((substratum) => ({
    boundary: substratum.boundary,
    id: substratum.id,
    name: substratum.name,
  })),
}));

const strataPayloadWithoutIds: DraftStratumPayload[] = strata.map((stratum) => ({
  boundary: stratum.boundary,
  initialPlantingDensity: stratum.initialPlantingDensity,
  name: stratum.name,
  substrata: stratum.substrata.map((substratum) => ({ boundary: substratum.boundary, name: substratum.name })),
}));

describe('fromDraft', () => {
  test('should convert a draft with no polygons to payload', () => {
    const draft: DraftPlantingSite = {
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      siteEditStep: 'site_boundary',
      siteType: 'Simple',
    };

    expect(fromDraft(draft)).toStrictEqual({
      boundary: undefined,
      boundarySource: undefined,
      description: undefined,
      exclusion: undefined,
      name: 'draft site',
      organizationId: 3,
      projectId: undefined,
      siteEditStep: 'site_boundary',
      siteType: 'Simple',
      strata: undefined,
      timeZone: undefined,
    });
  });

  test('should convert a draft with polygons to payload', () => {
    const draft: DraftPlantingSite = {
      boundary,
      boundarySource: 'uploaded',
      exclusion,
      createdBy: 5,
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'Detailed',
      timeZone: 'America/Puerto_Rico',
    };

    expect(fromDraft(draft)).toStrictEqual({
      boundary,
      boundarySource: 'uploaded',
      description: 'lorem ipsum...',
      exclusion,
      name: 'draft site',
      organizationId: 3,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'Detailed',
      strata: strataPayloadWithoutIds,
      timeZone: 'America/Puerto_Rico',
    });
  });

  test('should omit strata for a simple site', () => {
    const draft: DraftPlantingSite = {
      boundary,
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      siteEditStep: 'exclusion_areas',
      siteType: 'Simple',
    };

    expect(fromDraft(draft).strata).toBeUndefined();
  });
});

describe('toDraft', () => {
  test('should convert a payload with no polygons to draft', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      siteEditStep: 'site_boundary',
      siteType: 'Simple',
      strata: [],
    };

    expect(toDraft(payload)).toStrictEqual({
      boundary: undefined,
      exclusion: undefined,
      createdBy: 5,
      description: undefined,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata: undefined,
      projectId: undefined,
      siteEditStep: 'site_boundary',
      siteType: 'Simple',
      timeZone: undefined,
    });
  });

  test('should convert a payload with polygons to draft', () => {
    const payload: DraftPlantingSitePayload = {
      boundary,
      boundarySource: 'drawn',
      createdBy: 5,
      description: 'lorem ipsum...',
      exclusion,
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'Detailed',
      strata: strataPayload,
      timeZone: 'America/Puerto_Rico',
    };

    expect(toDraft(payload)).toStrictEqual({
      boundary,
      boundarySource: 'drawn',
      exclusion,
      createdBy: 5,
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'Detailed',
      timeZone: 'America/Puerto_Rico',
    });
  });

  test('should default to the site boundary step when the payload has no edit step', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      siteType: 'Detailed',
      strata: [],
    };

    expect(toDraft(payload).siteEditStep).toStrictEqual('site_boundary');
  });
});

import { MultiPolygon, MinimalStratum } from 'src/types/Tracking';
import { DraftPlantingSite, DraftPlantingSitePayload } from 'src/types/PlantingSite';
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

// Gen 1 persisted zones: modern strata with the original key names, so the migrated
// result is expected to equal the `strata` fixture above.
const legacyPlantingZones = strata.map(({ initialPlantingDensity, substrata, ...stratum }) => ({
  ...stratum,
  plantingSubzones: substrata,
  targetPlantingDensity: initialPlantingDensity,
}));

// Gen 2 persisted strata: modern substrata, but density under the original key name.
const legacyTargetDensityStrata = strata.map(({ initialPlantingDensity, ...stratum }) => ({
  ...stratum,
  targetPlantingDensity: initialPlantingDensity,
}));

describe('fromDraft', () => {
  test('should convert a draft with no polygons to payload', () => {
    const draft: DraftPlantingSite = {
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      siteEditStep: 'details',
      siteType: 'simple',
    };

    expect(fromDraft(draft)).toStrictEqual({
      createdBy: 5,
      description: undefined,
      data: {
        boundary: undefined,
        exclusion: undefined,
        strata: undefined,
        siteEditStep: 'details',
        siteType: 'simple',
      },
      id: 1,
      name: 'draft site',
      numStrata: undefined,
      numSubstrata: undefined,
      organizationId: 3,
      projectId: undefined,
      timeZone: undefined,
    });
  });

  test('should convert a draft with polygons to payload', () => {
    const draft: DraftPlantingSite = {
      boundary,
      exclusion,
      createdBy: 5,
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'detailed',
      timeZone: 'America/Puerto_Rico',
    };

    expect(fromDraft(draft)).toStrictEqual({
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        strata,
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
      projectId: 6,
      timeZone: 'America/Puerto_Rico',
    });
  });
});

describe('toDraft', () => {
  test('should convert a payload with no polygons to draft', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary: undefined,
        exclusion: undefined,
        strata: undefined,
        siteEditStep: 'details',
        siteType: 'simple',
      },
      id: 1,
      name: 'draft site',
      numStrata: undefined,
      numSubstrata: undefined,
      organizationId: 3,
      projectId: undefined,
      timeZone: undefined,
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
      siteEditStep: 'details',
      siteType: 'simple',
      timeZone: undefined,
    });
  });

  test('should convert a payload with polygons to draft', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        strata,
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numStrata: 4,
      numSubstrata: 2,
      organizationId: 3,
      projectId: 6,
      timeZone: 'America/Puerto_Rico',
    };

    expect(toDraft(payload)).toStrictEqual({
      boundary,
      exclusion,
      createdBy: 5,
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'detailed',
      timeZone: 'America/Puerto_Rico',
    });
  });

  test('should convert a legacy payload with planting zones to a draft with strata', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        plantingZones: legacyPlantingZones,
        plantingSeasons: [{ endDate: '2024-03-01', startDate: '2024-01-01' }],
        siteEditStep: 'subzone_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
      projectId: 6,
      timeZone: 'America/Puerto_Rico',
    };

    expect(toDraft(payload)).toStrictEqual({
      boundary,
      exclusion,
      createdBy: 5,
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      organizationId: 3,
      strata,
      projectId: 6,
      siteEditStep: 'substratum_boundaries',
      siteType: 'detailed',
      timeZone: 'America/Puerto_Rico',
    });
  });

  test('should convert a legacy zone boundaries edit step to stratum boundaries', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        plantingZones: legacyPlantingZones,
        siteEditStep: 'zone_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      organizationId: 3,
    };

    expect(toDraft(payload).siteEditStep).toStrictEqual('stratum_boundaries');
  });

  test('should convert a legacy subzone boundaries edit step to substratum boundaries', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        plantingZones: legacyPlantingZones,
        siteEditStep: 'subzone_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      organizationId: 3,
    };

    expect(toDraft(payload).siteEditStep).toStrictEqual('substratum_boundaries');
  });

  test('should convert legacy target planting density to initial planting density', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        strata: legacyTargetDensityStrata,
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
    };

    expect(toDraft(payload).strata).toStrictEqual(strata);
  });

  test('should keep initial planting density on a payload that already uses modern keys', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        strata,
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
    };

    expect(toDraft(payload).strata).toStrictEqual(strata);
    expect(toDraft(payload).strata?.map((stratum) => stratum.initialPlantingDensity)).toStrictEqual([1500, 2500]);
  });

  test('should leave strata undefined when the payload has neither strata nor planting zones', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        siteEditStep: 'site_boundary',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      organizationId: 3,
    };

    expect(toDraft(payload).strata).toStrictEqual(undefined);
  });

  test('should pass through an edit step that is not a legacy edit step', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        siteEditStep: 'details',
        siteType: 'simple',
      },
      id: 1,
      name: 'draft site',
      organizationId: 3,
    };

    expect(toDraft(payload).siteEditStep).toStrictEqual('details');
  });

  // `MinimalStratum.initialPlantingDensity` is a required number, so a blob saved without any
  // density has to be defaulted rather than passed through as undefined.
  test('should default initial planting density to 1500 when the persisted stratum has no density', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        strata: [
          {
            boundary: stratum1,
            id: 1,
            name: 'stratum with no density',
            substrata: [
              {
                boundary: substratum11,
                fullName: 'substratum11',
                id: 1,
                name: 'substratum11',
                plantingCompleted: false,
              },
            ],
          },
        ],
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      numStrata: 1,
      numSubstrata: 1,
      organizationId: 3,
    };

    expect(toDraft(payload).strata).toStrictEqual([
      {
        boundary: stratum1,
        id: 1,
        initialPlantingDensity: 1500,
        name: 'stratum with no density',
        substrata: [
          {
            boundary: substratum11,
            fullName: 'substratum11',
            id: 1,
            name: 'substratum11',
            plantingCompleted: false,
          },
        ],
      },
    ]);
  });

  test('should default substrata to an empty array when the persisted stratum has neither substrata nor planting subzones', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        strata: [
          {
            boundary: stratum1,
            id: 1,
            initialPlantingDensity: 2500,
            name: 'stratum with no substrata',
          },
        ],
        siteEditStep: 'stratum_boundaries',
        siteType: 'detailed',
      },
      id: 1,
      name: 'draft site',
      numStrata: 1,
      organizationId: 3,
    };

    expect(toDraft(payload).strata?.[0].substrata).toStrictEqual([]);
  });
});

describe('toDraft and fromDraft round trip', () => {
  test('should persist a legacy payload back with modern keys only', () => {
    const payload: DraftPlantingSitePayload = {
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        plantingZones: legacyPlantingZones,
        plantingSeasons: [{ endDate: '2024-03-01', startDate: '2024-01-01' }],
        siteEditStep: 'subzone_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
      projectId: 6,
      timeZone: 'America/Puerto_Rico',
    };

    const roundTripped = fromDraft(toDraft(payload));

    expect(roundTripped).toStrictEqual({
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        strata,
        siteEditStep: 'substratum_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numStrata: 2,
      numSubstrata: 4,
      organizationId: 3,
      projectId: 6,
      timeZone: 'America/Puerto_Rico',
    });
    expect(roundTripped.data.plantingZones).toStrictEqual(undefined);
  });
});

import { MultiPolygon, PlantingSeason, MinimalPlantingZone } from 'src/types/Tracking';
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

const zone1: MultiPolygon = {
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

const zone2: MultiPolygon = {
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

const subzone11: MultiPolygon = {
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

const subzone12: MultiPolygon = {
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

const subzone21: MultiPolygon = {
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

const subzone22: MultiPolygon = {
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

const plantingSeasons: PlantingSeason[] = [{ id: 1, startDate: '2024-01-01', endDate: '2024-02-01' }];

const plantingZones: MinimalPlantingZone[] = [
  {
    boundary: zone1,
    id: 1,
    name: 'zone1',
    plantingSubzones: [
      {
        boundary: subzone11,
        fullName: 'subzone11',
        id: 1,
        name: 'subzone11',
        plantingCompleted: false,
      },
      {
        boundary: subzone12,
        fullName: 'subzone12',
        id: 2,
        name: 'subzone12',
        plantingCompleted: false,
      },
    ],
    targetPlantingDensity: 1500,
  },
  {
    boundary: zone2,
    id: 2,
    name: 'zone2',
    plantingSubzones: [
      {
        boundary: subzone21,
        fullName: 'subzone21',
        id: 1,
        name: 'subzone21',
        plantingCompleted: false,
      },
      {
        boundary: subzone22,
        fullName: 'subzone22',
        id: 2,
        name: 'subzone22',
        plantingCompleted: false,
      },
    ],
    targetPlantingDensity: 2500,
  },
];

describe('fromDraft', () => {
  test('should convert a draft with no polygons to payload', () => {
    const draft: DraftPlantingSite = {
      createdBy: 5,
      id: 1,
      name: 'draft site',
      organizationId: 3,
      plantingSeasons: [],
      siteEditStep: 'details',
      siteType: 'simple',
    };

    expect(fromDraft(draft)).toStrictEqual({
      createdBy: 5,
      description: undefined,
      data: {
        boundary: undefined,
        exclusion: undefined,
        plantingSeasons: [],
        plantingZones: undefined,
        siteEditStep: 'details',
        siteType: 'simple',
      },
      id: 1,
      name: 'draft site',
      numPlantingSubzones: undefined,
      numPlantingZones: undefined,
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
      plantingSeasons,
      plantingZones,
      projectId: 6,
      siteEditStep: 'subzone_boundaries',
      siteType: 'detailed',
      timeZone: 'America/Puerto_Rico',
    };

    expect(fromDraft(draft)).toStrictEqual({
      createdBy: 5,
      data: {
        boundary,
        exclusion,
        plantingSeasons,
        plantingZones,
        siteEditStep: 'subzone_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numPlantingSubzones: 4,
      numPlantingZones: 2,
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
        plantingSeasons: [],
        plantingZones: undefined,
        siteEditStep: 'details',
        siteType: 'simple',
      },
      id: 1,
      name: 'draft site',
      numPlantingSubzones: undefined,
      numPlantingZones: undefined,
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
      plantingSeasons: [],
      plantingZones: undefined,
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
        plantingSeasons,
        plantingZones,
        siteEditStep: 'subzone_boundaries',
        siteType: 'detailed',
      },
      description: 'lorem ipsum...',
      id: 1,
      name: 'draft site',
      numPlantingSubzones: 2,
      numPlantingZones: 4,
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
      plantingSeasons,
      plantingZones,
      projectId: 6,
      siteEditStep: 'subzone_boundaries',
      siteType: 'detailed',
      timeZone: 'America/Puerto_Rico',
    });
  });
});

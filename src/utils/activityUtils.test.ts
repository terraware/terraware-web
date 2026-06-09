import {
  getObsPhotoTypeLabel,
  isCaptionReadOnly,
  isCornerPhoto,
  isObservationActivity,
  isObservationMedia,
  isUndeletableObservationPhoto,
} from './activityUtils';

describe('isObservationActivity', () => {
  test('returns true when observationId is present', () => {
    expect(isObservationActivity({ observation: { observationId: 1 } })).toBe(true);
  });

  test('returns false when observation is absent', () => {
    expect(isObservationActivity({})).toBe(false);
  });

  test('returns false when observationId is undefined', () => {
    expect(isObservationActivity({ observation: { observationId: undefined } })).toBe(false);
  });
});

describe('isObservationMedia', () => {
  test('returns true when observation field is present', () => {
    expect(isObservationMedia({ observation: { monitoringPlotNumber: 1, type: 'Plot' } })).toBe(true);
  });

  test('returns false when observation field is absent', () => {
    expect(isObservationMedia({})).toBe(false);
  });

  test('returns false when observation is undefined', () => {
    expect(isObservationMedia({ observation: undefined })).toBe(false);
  });
});

describe('isCornerPhoto', () => {
  test('returns true when position is set', () => {
    expect(isCornerPhoto({ observation: { monitoringPlotNumber: 1, type: 'Plot', position: 'SouthwestCorner' } })).toBe(
      true
    );
  });

  test('returns false when position is absent', () => {
    expect(isCornerPhoto({ observation: { monitoringPlotNumber: 1, type: 'Plot' } })).toBe(false);
  });

  test('returns false when observation is absent', () => {
    expect(isCornerPhoto({})).toBe(false);
  });
});

describe('isUndeletableObservationPhoto', () => {
  test('returns true for corner photos', () => {
    expect(
      isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Plot', position: 'NortheastCorner' } })
    ).toBe(true);
  });

  test('returns true for quadrat photos', () => {
    expect(isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Quadrat' } })).toBe(true);
  });

  test('returns true for soil photos', () => {
    expect(isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Soil' } })).toBe(true);
  });

  test('returns false for plot photos without a corner position', () => {
    expect(isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Plot' } })).toBe(false);
  });

  test('returns false when observation is absent', () => {
    expect(isUndeletableObservationPhoto({})).toBe(false);
  });
});

describe('isCaptionReadOnly', () => {
  test('returns true for corner photos', () => {
    expect(
      isCaptionReadOnly({ observation: { monitoringPlotNumber: 1, type: 'Plot', position: 'NorthwestCorner' } })
    ).toBe(true);
  });

  test('returns true for quadrat photos', () => {
    expect(isCaptionReadOnly({ observation: { monitoringPlotNumber: 1, type: 'Quadrat' } })).toBe(true);
  });

  test('returns false for soil photos', () => {
    expect(isCaptionReadOnly({ observation: { monitoringPlotNumber: 1, type: 'Soil' } })).toBe(false);
  });

  test('returns false for plot photos without a corner position', () => {
    expect(isCaptionReadOnly({ observation: { monitoringPlotNumber: 1, type: 'Plot' } })).toBe(false);
  });

  test('returns false when observation is absent', () => {
    expect(isCaptionReadOnly({})).toBe(false);
  });
});

describe('getObsPhotoTypeLabel', () => {
  const strings = {
    NORTHEAST_CORNER: 'Northeast corner',
    NORTHWEST_CORNER: 'Northwest corner',
    SOUTHEAST_CORNER: 'Southeast corner',
    SOUTHWEST_CORNER: 'Southwest corner',
    PHOTO_NORTHEAST_QUADRAT: 'Northeast Quadrat',
    PHOTO_NORTHWEST_QUADRAT: 'Northwest Quadrat',
    PHOTO_SOUTHEAST_QUADRAT: 'Southeast Quadrat',
    PHOTO_SOUTHWEST_QUADRAT: 'Southwest Quadrat',
    SOIL: 'Soil',
  } as Parameters<typeof getObsPhotoTypeLabel>[1];

  test('returns undefined when observation is absent', () => {
    expect(getObsPhotoTypeLabel({}, strings)).toBeUndefined();
  });

  test('returns undefined for a deletable plot photo (no position)', () => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 3, type: 'Plot' } }, strings)).toBeUndefined();
  });

  test.each([
    ['NortheastCorner', '5 Northeast corner'],
    ['NorthwestCorner', '5 Northwest corner'],
    ['SoutheastCorner', '5 Southeast corner'],
    ['SouthwestCorner', '5 Southwest corner'],
  ] as const)('returns plot prefix + corner label for position %s', (position, expected) => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 5, type: 'Plot', position } }, strings)
    ).toBe(expected);
  });

  test.each([
    ['NortheastCorner', '2 Northeast Quadrat'],
    ['NorthwestCorner', '2 Northwest Quadrat'],
    ['SoutheastCorner', '2 Southeast Quadrat'],
    ['SouthwestCorner', '2 Southwest Quadrat'],
  ] as const)('returns plot prefix + quadrat label for quadrat position %s', (position, expected) => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 2, type: 'Quadrat', position } }, strings)
    ).toBe(expected);
  });

  test('returns undefined for quadrat photo without a position', () => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 2, type: 'Quadrat' } }, strings)
    ).toBeUndefined();
  });

  test('returns plot prefix + Soil for soil photos', () => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 7, type: 'Soil' } }, strings)).toBe('7 Soil');
  });
});

import {
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

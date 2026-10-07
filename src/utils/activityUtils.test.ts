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

  // an explanation photo carries the corner it was taken from, so it reads as a corner photo --
  // which is what makes it undeletable and gives it the corner "cannot be deleted" message
  test('returns true for explanation photos', () => {
    expect(
      isCornerPhoto({ observation: { monitoringPlotNumber: 1, type: 'Explanation', position: 'SouthwestCorner' } })
    ).toBe(true);
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
      isUndeletableObservationPhoto({
        observation: { monitoringPlotNumber: 1, type: 'Plot', position: 'NortheastCorner' },
      })
    ).toBe(true);
  });

  test('returns true for quadrat photos', () => {
    expect(isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Quadrat' } })).toBe(true);
  });

  test('returns true for soil photos', () => {
    expect(isUndeletableObservationPhoto({ observation: { monitoringPlotNumber: 1, type: 'Soil' } })).toBe(true);
  });

  test('returns true for explanation photos', () => {
    expect(
      isUndeletableObservationPhoto({
        observation: { monitoringPlotNumber: 1, type: 'Explanation', position: 'SouthwestCorner' },
      })
    ).toBe(true);
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

  // the caption of an explanation photo is the user's explanation, so it stays editable even
  // though the photo carries a corner position
  test('returns false for explanation photos', () => {
    expect(
      isCaptionReadOnly({ observation: { monitoringPlotNumber: 1, type: 'Explanation', position: 'SouthwestCorner' } })
    ).toBe(false);
  });

  test('returns false when observation is absent', () => {
    expect(isCaptionReadOnly({})).toBe(false);
  });
});

describe('getObsPhotoTypeLabel', () => {
  const strings = {
    NE_CORNER: 'NE corner',
    NW_CORNER: 'NW corner',
    SE_CORNER: 'SE corner',
    SW_CORNER: 'SW corner',
    OBSERVATION_EXPLANATION_PHOTO_LABEL: '{0}: >20m location',
    PHOTO_NE_QUADRAT: 'NE Quadrat',
    PHOTO_NW_QUADRAT: 'NW Quadrat',
    PHOTO_SE_QUADRAT: 'SE Quadrat',
    PHOTO_SW_QUADRAT: 'SW Quadrat',
    SOIL: 'Soil',
    formatString: (template: string, ...args: unknown[]) =>
      template.replace(/\{(\d+)\}/g, (_match, index: string) => String(args[Number(index)])),
  } as unknown as Parameters<typeof getObsPhotoTypeLabel>[1];

  test('returns undefined when observation is absent', () => {
    expect(getObsPhotoTypeLabel({}, strings)).toBeUndefined();
  });

  test('returns undefined for a deletable plot photo (no position)', () => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 3, type: 'Plot' } }, strings)).toBeUndefined();
  });

  test.each([
    ['NortheastCorner', 'NE corner'],
    ['NorthwestCorner', 'NW corner'],
    ['SoutheastCorner', 'SE corner'],
    ['SouthwestCorner', 'SW corner'],
  ] as const)('returns corner label for position %s', (position, expected) => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 5, type: 'Plot', position } }, strings)).toBe(
      expected
    );
  });

  test.each([
    ['NortheastCorner', 'NE Quadrat'],
    ['NorthwestCorner', 'NW Quadrat'],
    ['SoutheastCorner', 'SE Quadrat'],
    ['SouthwestCorner', 'SW Quadrat'],
  ] as const)('returns quadrat label for quadrat position %s', (position, expected) => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 2, type: 'Quadrat', position } }, strings)).toBe(
      expected
    );
  });

  test('returns undefined for quadrat photo without a position', () => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 2, type: 'Quadrat' } }, strings)
    ).toBeUndefined();
  });

  test('returns Soil for soil photos', () => {
    expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 7, type: 'Soil' } }, strings)).toBe('Soil');
  });

  test.each([
    ['NortheastCorner', 'NE corner: >20m location'],
    ['NorthwestCorner', 'NW corner: >20m location'],
    ['SoutheastCorner', 'SE corner: >20m location'],
    ['SouthwestCorner', 'SW corner: >20m location'],
  ] as const)('returns the >20m location label for explanation photo position %s', (position, expected) => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 9, type: 'Explanation', position } }, strings)
    ).toBe(expected);
  });

  describe('with showPlotNumber', () => {
    test('returns plot prefix + corner label for plot photos', () => {
      expect(
        getObsPhotoTypeLabel(
          { observation: { monitoringPlotNumber: 5, type: 'Plot', position: 'NortheastCorner' } },
          strings,
          true
        )
      ).toBe('5 NE corner');
    });

    test('returns plot prefix + quadrat label for quadrat photos', () => {
      expect(
        getObsPhotoTypeLabel(
          { observation: { monitoringPlotNumber: 2, type: 'Quadrat', position: 'SouthwestCorner' } },
          strings,
          true
        )
      ).toBe('2 SW Quadrat');
    });

    test('returns plot prefix + Soil for soil photos', () => {
      expect(getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 7, type: 'Soil' } }, strings, true)).toBe(
        '7 Soil'
      );
    });

    test('returns plot prefix in the >20m location label for explanation photos', () => {
      expect(
        getObsPhotoTypeLabel(
          { observation: { monitoringPlotNumber: 9, type: 'Explanation', position: 'NorthwestCorner' } },
          strings,
          true
        )
      ).toBe('9 NW corner: >20m location');
    });
  });

  test('returns undefined for an explanation photo without a position', () => {
    expect(
      getObsPhotoTypeLabel({ observation: { monitoringPlotNumber: 9, type: 'Explanation' } }, strings)
    ).toBeUndefined();
  });
});

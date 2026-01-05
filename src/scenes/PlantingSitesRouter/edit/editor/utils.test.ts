/**
 * @jest-environment node
 */
import { Feature } from 'geojson';
import { GeometryFeature } from 'src/types/Map';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import {
  alphabetName,
  cutOverlappingBoundaries,
  getLatestFeature,
  substratumNameGenerator,
  stratumNameGenerator,
} from './utils';
import {
  cutOnNoOverlapFeature,
  cutOnOverlapFeature,
  feature1,
  feature2,
  featureCollection1,
  featureCollection2,
  featureCollection3,
} from 'src/components/Map/testdata';

const createDraftSiteWith = (): DraftPlantingSite => {
  return {
    createdBy: 0,
    id: 1,
    name: 'test',
    organizationId: 2,
    plantingSeasons: [],
    siteEditStep: 'details',
    siteType: 'simple',
  };
};

describe('substratumNameGenerator', () => {
  const prefix = 'substratum';

  test('should return \'A\' when there are no used names', () => {
    const usedNames = new Set<string>();
    expect(substratumNameGenerator(usedNames, prefix)).toBe(`${prefix} A`);
  });

  test('should return the next unused name', () => {
    const usedNames = new Set<string>([`${prefix} A`, `${prefix} B`, `${prefix} C`, `${prefix} D`]);
    expect(substratumNameGenerator(usedNames, prefix)).toBe(`${prefix} E`);
  });

  test('should return the next incremented characters sequence in the name', () => {
    const asciiA = 'A'.charCodeAt(0);
    // A to Z, simpler to map from ascii to char here
    const usedNames = new Set<string>(
      Array
        .from({ length: 26 }, (_, index) => asciiA + index)
        .map((ascii) => String.fromCharCode(ascii))
        .map((name) => `${prefix} ${name}`),
    );
    expect(substratumNameGenerator(usedNames, prefix)).toBe(`${prefix} AA`);
  });

  test('should be able to handle names with many character positions', () => {
    const usedNames = new Set<string>();
    // 5000 is 'GJH'
    for (let i = 1; i <= 5000; i++) {
      usedNames.add(`${prefix} ${alphabetName(i)}`);
    }
    expect(substratumNameGenerator(usedNames, prefix)).toBe(`${prefix} GJI`);
  });
});


describe('stratumNameGenerator', () => {
  const prefix = 'stratum';

  test('should return \'01\' when there are no used names', () => {
    const usedNames = new Set<string>();
    expect(stratumNameGenerator(usedNames, prefix)).toBe(`${prefix} 01`);
  });

  test('should return the next unused name', () => {
    const usedNames = new Set<string>([`${prefix} 01`, `${prefix} 02`, `${prefix} 03`, `${prefix} 04`]);
    expect(stratumNameGenerator(usedNames, prefix)).toBe(`${prefix} 05`);
  });

  test('should return with no padding in double digits', () => {
    const usedNames = new Set<string>(
      Array.from({ length: 9 }, (_, index) => `${prefix} 0${index + 1}`),
    );
    expect(stratumNameGenerator(usedNames, prefix)).toBe(`${prefix} 10`);
  });

  test('should be able to handle names with many positions', () => {
    const usedNames = new Set<string>();
    // 5000 is 'GJH'
    for (let i = 1; i <= 5000; i++) {
      const num = `${i}`.padStart(2, '0');
      usedNames.add(`${prefix} ${num}`);
    }
    expect(stratumNameGenerator(usedNames, prefix)).toBe(`${prefix} 5001`);
  });
});

describe('getLatestFeature', () => {
  test('should return undefined with invalid input', () => {
    expect(getLatestFeature()).toBeUndefined();
    expect(getLatestFeature(featureCollection1)).toBeUndefined();
  });

  test('should return the only existing feature', () => {
    expect(getLatestFeature(undefined, featureCollection1)).toEqual(feature1);
    expect(getLatestFeature(featureCollection1, featureCollection1)).toEqual(feature1);
  });

  test('should return the new feature', () => {
    expect(getLatestFeature(featureCollection1, featureCollection2)).toEqual(feature2);
  });
});

describe('cutBoundaries', () => {
  let error = 0;
  let errorAnnotations = 0;
  let errorData: Feature[] = [];
  let success = 0;
  let cutBoundaries = 0;
  let cutData: GeometryFeature[] = [];

  const onSuccess = (data: GeometryFeature[]) => {
    success++;
    cutData = data;
    cutBoundaries += data.length;
  };

  const onError = (data: Feature[]) => {
    error++;
    errorData = data;
    errorAnnotations += data.length;
  };

  beforeEach(() => {
    error = 0;
    errorAnnotations = 0;
    errorData = [];
    success = 0;
    cutBoundaries = 0;
    cutData = [];
  });

  test('should call onError when data is invalid', async () => {
    await cutOverlappingBoundaries({ errorCheckLevel: 'substratum', createDraftSiteWith }, onSuccess, onError);
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onError when cut geometry does not overlap', async () => {
    await cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnNoOverlapFeature,
        errorCheckLevel: 'substratum',
        createDraftSiteWith,
        source: featureCollection2,
      },
      onSuccess,
      onError,
    );
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onSuccess with cut boundaries when cut geometry does overlap', async () => {
    await cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnOverlapFeature,
        errorCheckLevel: 'substratum',
        createDraftSiteWith,
        source: featureCollection2,
      },
      onSuccess,
      onError,
    );
    expect(success).toBe(1);
    expect(cutBoundaries).toBe(3);
    expect(cutData).toEqual([
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [5, 5],
                [7.5, 5],
                [7.5, 10],
                [5, 10],
                [5, 5],
              ],
            ],
          ],
        },
        properties: { hello: 'world' },
        id: 0,
      },
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [12.5, 5],
                [15, 5],
                [15, 10],
                [12.5, 10],
                [12.5, 5],
              ],
            ],
          ],
        },
        properties: { yoyo: 'ma' },
        id: 1,
      },
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [7.5, 5],
                [12.5, 5],
                [12.5, 10],
                [7.5, 10],
                [7.5, 5],
              ],
            ],
          ],
        },
      },
    ]);
    expect(error).toBe(0);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onError with error annotations when generated boundary sizes are too small', async () => {
    await cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnOverlapFeature,
        errorCheckLevel: 'stratum',
        createDraftSiteWith,
        source: featureCollection3,
      },
      onSuccess,
      onError,
    );
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(2);
    expect(errorData).toEqual([
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [7.4999, 1],
                [7.5, 1],
                [7.5, 1.001],
                [7.4999, 1.001],
                [7.4999, 1],
              ],
            ],
          ],
        },
        properties: { errorText: '--', fill: true },
        id: 2,
      },
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [12.5, 1],
                [12.5001, 1],
                [12.5001, 1.001],
                [12.5, 1.001],
                [12.5, 1],
              ],
            ],
          ],
        },
        properties: { errorText: '--', fill: true },
        id: 2,
      },
    ]);
  });
});

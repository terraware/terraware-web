import { Feature } from 'geojson';
import { GeometryFeature } from 'src/types/Map';
import { alphabetName, cutOverlappingBoundaries, getLatestFeature, subzoneNameGenerator } from './utils';
import {
  cutOnNoOverlapFeature,
  cutOnOverlapFeature,
  feature1,
  feature2,
  featureCollection1,
  featureCollection2,
} from 'src/components/Map/testdata';

describe('subzoneNameGenerator', () => {
  test("should return 'A' when there are no used names", () => {
    const usedNames = new Set<string>();
    expect(subzoneNameGenerator(usedNames)).toBe('A');
  });

  test('should return the next unused name', () => {
    const usedNames = new Set<string>(['A', 'B', 'C', 'D']);
    expect(subzoneNameGenerator(usedNames)).toBe('E');
  });

  test('should return the next incremented characters sequence in the name', () => {
    const asciiA = 'A'.charCodeAt(0);
    // A to Z, simpler to map from ascii to char here
    const usedNames = new Set<string>(
      Array.from({ length: 26 }, (_, index) => asciiA + index).map((ascii) => String.fromCharCode(ascii))
    );
    expect(subzoneNameGenerator(usedNames)).toBe('AA');
  });

  test('should be able to handle names with many character positions', () => {
    const asciiA = 'A'.charCodeAt(0);
    const usedNames = new Set<string>();
    // 5000 is 'GJH'
    for (let i = 1; i <= 5000; i++) {
      usedNames.add(alphabetName(i));
    }
    expect(subzoneNameGenerator(usedNames)).toBe('GJI');
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

  test('should call onError when data is invalid', () => {
    cutOverlappingBoundaries({ errorText: '', minimumSideDimension: 1 }, onSuccess, onError);
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onError when cut geometry does not overlap', () => {
    cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnNoOverlapFeature,
        errorText: '',
        minimumSideDimension: 10,
        source: featureCollection2,
      },
      onSuccess,
      onError
    );
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onSuccess with cut boundaries when cut geometry does overlap', () => {
    cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnOverlapFeature,
        errorText: '',
        minimumSideDimension: 10,
        source: featureCollection2,
      },
      onSuccess,
      onError
    );
    expect(success).toBe(1);
    expect(cutBoundaries).toBe(4);
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
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [7.5, 5],
              [10, 5],
              [10, 10],
              [7.5, 10],
              [7.5, 5],
            ],
          ],
        },
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
          type: 'Polygon',
          coordinates: [
            [
              [10, 5],
              [12.5, 5],
              [12.5, 10],
              [10, 10],
              [10, 5],
            ],
          ],
        },
      },
    ]);
    expect(error).toBe(0);
    expect(errorAnnotations).toBe(0);
  });

  test('should call onError with error annotations when generated boundary sizes are too small', () => {
    cutOverlappingBoundaries(
      {
        cutWithFeature: cutOnOverlapFeature,
        errorText: 'too small!!',
        minimumSideDimension: 10000000,
        source: featureCollection2,
      },
      onSuccess,
      onError
    );
    expect(success).toBe(0);
    expect(cutBoundaries).toBe(0);
    expect(error).toBe(1);
    expect(errorAnnotations).toBe(4);
    expect(errorData).toEqual([
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
        properties: { errorText: 'too small!!', fill: true },
        id: 0,
      },
      {
        type: 'Feature',
        properties: { errorText: 'too small!!', fill: true },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [7.5, 5],
              [10, 5],
              [10, 10],
              [7.5, 10],
              [7.5, 5],
            ],
          ],
        },
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
        properties: { errorText: 'too small!!', fill: true },
        id: 1,
      },
      {
        type: 'Feature',
        properties: { errorText: 'too small!!', fill: true },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [10, 5],
              [12.5, 5],
              [12.5, 10],
              [10, 10],
              [10, 5],
            ],
          ],
        },
      },
    ]);
  });
});

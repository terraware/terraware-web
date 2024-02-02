import { FeatureCollection, Geometry } from 'geojson';
import { GeometryFeature } from 'src/types/Map';

export const feature1: GeometryFeature = {
  type: 'Feature',
  geometry: {
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
  },
  properties: { hello: 'world' },
  id: 0,
};

export const feature2: GeometryFeature = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [10, 5],
          [15, 5],
          [15, 10],
          [10, 10],
          [10, 5],
        ],
      ],
    ],
  },
  properties: { yoyo: 'ma' },
  id: 1,
};

export const feature3: GeometryFeature = {
  type: 'Feature',
  geometry: {
    type: 'MultiPolygon',
    coordinates: [
      [
        [
          [15, 5],
          [20, 5],
          [20, 10],
          [15, 10],
          [15, 5],
        ],
      ],
    ],
  },
  properties: { lorem: 'ipsum' },
  id: 2,
};

export const cutOnNoOverlap: Geometry = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [100, 5],
        [150, 5],
        [150, 10],
        [100, 10],
        [100, 5],
      ],
    ],
  ],
};

export const cutWithOverlap: Geometry = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [7.5, 0],
        [12.5, 0],
        [12.5, 100],
        [7.5, 100],
        [7.5, 0],
      ],
    ],
  ],
};

export const featureCollection1: FeatureCollection = { type: 'FeatureCollection', features: [feature1] };
export const featureCollection2: FeatureCollection = { type: 'FeatureCollection', features: [feature1, feature2] };

export const cutOnNoOverlapFeature: GeometryFeature = {
  type: 'Feature',
  geometry: cutOnNoOverlap,
  properties: {},
  id: 0,
};
export const cutOnOverlapFeature: GeometryFeature = {
  type: 'Feature',
  geometry: cutWithOverlap,
  properties: {},
  id: 1,
};

import area from '@turf/area';
import { Feature, MultiPolygon, Position } from 'geojson';

import strings from 'src/strings';
import { GeometryFeature } from 'src/types/Map';
import { MinimalStratum, MinimalSubstratum } from 'src/types/Tracking';

import {
  NegativeIdGenerator,
  keepIdOnLargerPiece,
  reconcileStrata,
  reconcileStratumSubstrata,
  reconcileToBoundary,
} from './reconcileUtils';

const ring = (minX: number, minY: number, maxX: number, maxY: number): Position[] => [
  [minX, minY],
  [maxX, minY],
  [maxX, maxY],
  [minX, maxY],
  [minX, minY],
];

const rect = (minX: number, minY: number, maxX: number, maxY: number): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: [[ring(minX, minY, maxX, maxY)]],
});

const multi = (...polygons: MultiPolygon[]): MultiPolygon => ({
  type: 'MultiPolygon',
  coordinates: polygons.flatMap((polygon) => polygon.coordinates),
});

const sqm = (geometry: MultiPolygon) => area(geometry);

const left = { boundary: rect(0, 0, 0.01, 0.01), id: 1 };
const right = { boundary: rect(0.01, 0, 0.02, 0.01), id: 2 };

const substratum = (id: number, boundary: MultiPolygon): MinimalSubstratum => ({
  boundary,
  fullName: `${id}`,
  id,
  name: `${id}`,
  plantingCompleted: false,
});

const stratum = (id: number, boundary: MultiPolygon, substrata: MinimalSubstratum[]): MinimalStratum => ({
  boundary,
  id,
  initialPlantingDensity: 1500,
  name: `Stratum ${id}`,
  substrata,
});

const feature = (geometry: MultiPolygon, id?: number): GeometryFeature =>
  ({ type: 'Feature', geometry, id, properties: id === undefined ? {} : { id, name: `${id}` } }) as GeometryFeature;

describe('reconcileToBoundary', () => {
  it('clips children to a smaller boundary', () => {
    const result = reconcileToBoundary([left, right], rect(0, 0, 0.015, 0.01));

    expect(result.map(({ id }) => id)).toEqual([1, 2]);
    expect(result[0].boundary).toEqual(left.boundary);
    expect(sqm(result[1].boundary)).toBeCloseTo(sqm(right.boundary) / 2, -1);
  });

  it('drops children with no remaining area', () => {
    const result = reconcileToBoundary([left, right], rect(0, 0, 0.01, 0.01));

    expect(result).toEqual([left]);
  });

  it('adds area to the bordering child', () => {
    const result = reconcileToBoundary([left, right], rect(0, 0, 0.03, 0.01));

    expect(result[0].boundary).toEqual(left.boundary);
    expect(sqm(result[1].boundary)).toBeCloseTo(sqm(right.boundary) * 2, -1);
  });

  it('prefers the child with the longest shared border', () => {
    const extension = rect(0, -0.005, 0.015, 0);
    const result = reconcileToBoundary([left, right], multi(rect(0, -0.005, 0.015, 0.01), rect(0.015, 0, 0.02, 0.01)));

    expect(sqm(result[0].boundary)).toBeCloseTo(sqm(left.boundary) + sqm(extension), -1);
    expect(sqm(result[1].boundary)).toBeCloseTo(sqm(right.boundary), -1);
  });

  it('assigns a detached piece to the nearest child', () => {
    const detached = rect(0.025, 0, 0.03, 0.005);
    const result = reconcileToBoundary([left, right], multi(left.boundary, right.boundary, detached));

    expect(result[0].boundary).toEqual(left.boundary);
    expect(result[1].boundary.coordinates).toHaveLength(2);
    expect(sqm(result[1].boundary)).toBeCloseTo(sqm(right.boundary) + sqm(detached), -1);
  });

  it('produces boundaries without zero-width spikes when a child moves with its boundary', () => {
    const triangle = (offset: number): MultiPolygon => ({
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [-155.63433804, 19.16382232 + offset],
            [-155.63200453, 19.16360697 + offset],
            [-155.63297767, 19.16570482 + offset],
            [-155.63433804, 19.16382232 + offset],
          ],
        ],
      ],
    });

    const [result] = reconcileToBoundary([{ boundary: triangle(0), id: 1 }], triangle(0.00090275158483));

    const isSpikeFree = result.boundary.coordinates.every((polygon) =>
      polygon.every((polygonRing) =>
        polygonRing.slice(0, -1).every((position, index, positions) => {
          const previous = positions[(index - 1 + positions.length) % positions.length];
          const next = positions[(index + 1) % positions.length];
          const cross =
            (position[0] - previous[0]) * (next[1] - previous[1]) -
            (position[1] - previous[1]) * (next[0] - previous[0]);
          return Math.abs(cross) > 1e-14;
        })
      )
    );
    expect(isSpikeFree).toBe(true);
    expect(sqm(result.boundary)).toBeCloseTo(sqm(triangle(0)), -1);
  });

  it('assigns a detached piece to the nearest child when the shapes have many vertices', () => {
    const circle = (centerX: number, radius: number, vertices: number): MultiPolygon => {
      const positions = Array.from({ length: vertices }, (_unused, index): Position => {
        const angle = (2 * Math.PI * index) / vertices;
        return [centerX + radius * Math.cos(angle), 0.005 + radius * Math.sin(angle)];
      });
      return { type: 'MultiPolygon', coordinates: [[[...positions, positions[0]]]] };
    };
    const child = { boundary: circle(0, 0.004, 1500), id: 1 };
    const island = circle(0.02, 0.001, 60);

    const [result] = reconcileToBoundary([child], multi(child.boundary, island));

    expect(sqm(result.boundary)).toBeCloseTo(sqm(child.boundary) + sqm(island), -2);
  });

  it('keeps an unchanged boundary unchanged', () => {
    const result = reconcileToBoundary([left, right], rect(0, 0, 0.02, 0.01));

    expect(result).toEqual([left, right]);
  });
});

describe('reconcileStratumSubstrata', () => {
  it('creates a default substratum when no substratum overlaps the stratum', () => {
    const result = reconcileStratumSubstrata(
      stratum(1, rect(0, 0, 0.01, 0.01), [substratum(10, rect(0.05, 0.05, 0.06, 0.06))]),
      () => -3
    );

    expect(result.substrata).toEqual([
      {
        boundary: rect(0, 0, 0.01, 0.01),
        fullName: `${strings.SUBSTRATUM} A`,
        id: -3,
        name: `${strings.SUBSTRATUM} A`,
        plantingCompleted: false,
      },
    ]);
  });
});

describe('reconcileStrata', () => {
  it('clips strata and their substrata to a smaller site boundary', () => {
    const strata = [
      stratum(1, left.boundary, [substratum(10, rect(0, 0, 0.005, 0.01)), substratum(11, rect(0.005, 0, 0.01, 0.01))]),
      stratum(2, right.boundary, [substratum(20, right.boundary)]),
    ];

    const result = reconcileStrata(
      strata,
      rect(0, 0, 0.004, 0.01),
      () => -1,
      () => -1
    );

    expect(result.map(({ id }) => id)).toEqual([1]);
    expect(result[0].substrata.map(({ id }) => id)).toEqual([10]);
    expect(sqm(result[0].boundary)).toBeCloseTo(sqm(rect(0, 0, 0.004, 0.01)), -1);
    expect(sqm(result[0].substrata[0].boundary)).toBeCloseTo(sqm(rect(0, 0, 0.004, 0.01)), -1);
  });
});

describe('NegativeIdGenerator', () => {
  it('counts down from below every id in use', () => {
    const features = [{ id: 3 }, { id: -2 }] as Feature[];
    const nextId = NegativeIdGenerator(features, [-5]);

    expect(nextId()).toBe(-6);
    expect(nextId()).toBe(-7);
  });

  it('never generates -1, which map features treat as a placeholder id', () => {
    const nextId = NegativeIdGenerator([{ id: 3 }] as Feature[]);

    expect(nextId()).toBe(-2);
    expect(nextId()).toBe(-3);
  });
});

describe('keepIdOnLargerPiece', () => {
  const before = [feature(left.boundary, 1), feature(right.boundary, 2)];

  it('gives the original id to the new piece when it is larger', () => {
    const cut = [feature(rect(0, 0, 0.002, 0.01), 1), feature(right.boundary, 2), feature(rect(0.002, 0, 0.01, 0.01))];

    const result = keepIdOnLargerPiece(before, cut);

    expect(result[0].geometry).toEqual(rect(0.002, 0, 0.01, 0.01));
    expect(result[0].properties).toEqual({ id: 1, name: '1' });
    expect(result[2].geometry).toEqual(rect(0, 0, 0.002, 0.01));
    expect(result[2].id).toBeUndefined();
  });

  it('compares only the part of the new piece taken from the changed feature', () => {
    // the cut covers all of the left feature and a sliver of the right one
    const cut = [feature(rect(0.012, 0, 0.02, 0.01), 2), feature(rect(0, 0, 0.012, 0.01))];

    expect(keepIdOnLargerPiece(before, cut)).toEqual(cut);
  });

  it('leaves the cut alone when the new piece is smaller', () => {
    const cut = [feature(rect(0, 0, 0.008, 0.01), 1), feature(right.boundary, 2), feature(rect(0.008, 0, 0.01, 0.01))];

    expect(keepIdOnLargerPiece(before, cut)).toEqual(cut);
  });

  it('leaves the cut alone when it changed more than one feature', () => {
    const cut = [
      feature(rect(0, 0, 0.002, 0.01), 1),
      feature(rect(0.018, 0, 0.02, 0.01), 2),
      feature(rect(0.002, 0, 0.018, 0.01)),
    ];

    expect(keepIdOnLargerPiece(before, cut)).toEqual(cut);
  });
});

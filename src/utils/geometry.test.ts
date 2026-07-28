import {
  MultiPolygonCoordinates,
  Ring,
  cleanRing,
  dedupeConsecutive,
  ensureClosed,
  ringArea,
  roundCoord,
  simplifyToBudget,
} from './geometry';

// A closed unit square [0,0]->[1,0]->[1,1]->[0,1]->[0,0].
const unitSquare: Ring = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];

// A square offset far away and scaled to a tiny area, used as a "sliver" polygon.
const sliverSquare: Ring = [
  [100, 100],
  [100.001, 100],
  [100.001, 100.001],
  [100, 100.001],
  [100, 100],
];

const totalPoints = (coordinates: MultiPolygonCoordinates): number =>
  coordinates.reduce((sum, polygon) => sum + polygon[0].length, 0);

describe('roundCoord', () => {
  test('rounds both components to 5 decimals', () => {
    expect(roundCoord([0.123456789, 5.987654321])).toEqual([0.12346, 5.98765]);
  });

  test('drops any extra components (e.g. altitude)', () => {
    expect(roundCoord([1.111111, 2.222222, 3.333333])).toEqual([1.11111, 2.22222]);
  });
});

describe('ringArea', () => {
  test('computes the area of a unit square', () => {
    expect(ringArea(unitSquare)).toBe(1);
  });

  test('is orientation-independent (absolute value)', () => {
    const reversed = [...unitSquare].reverse();
    expect(ringArea(reversed)).toBe(1);
  });

  test('is zero for a degenerate ring', () => {
    expect(
      ringArea([
        [0, 0],
        [1, 1],
        [0, 0],
      ])
    ).toBe(0);
  });
});

describe('dedupeConsecutive', () => {
  test('removes consecutive duplicate points but keeps non-adjacent repeats', () => {
    const ring: Ring = [
      [0, 0],
      [0, 0],
      [1, 0],
      [1, 0],
      [0, 0],
    ];
    expect(dedupeConsecutive(ring)).toEqual([
      [0, 0],
      [1, 0],
      [0, 0],
    ]);
  });
});

describe('ensureClosed', () => {
  test('closes an open ring', () => {
    const open: Ring = [
      [0, 0],
      [1, 0],
      [1, 1],
    ];
    expect(ensureClosed(open)).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ]);
  });

  test('leaves an already-closed ring unchanged', () => {
    expect(ensureClosed(unitSquare)).toEqual(unitSquare);
  });

  test('handles an empty ring', () => {
    expect(ensureClosed([])).toEqual([]);
  });
});

describe('cleanRing', () => {
  test('keeps all points when under the budget and closes/rounds them', () => {
    const result = cleanRing(unitSquare, 10);
    expect(result).toEqual(unitSquare);
  });

  test('decimates a dense ring down toward maxPoints', () => {
    // A 100-point ring around a circle.
    const dense: Ring = Array.from({ length: 100 }, (_, i) => {
      const angle = (i / 100) * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    });
    const result = cleanRing(dense, 10);
    expect(result).not.toBeNull();
    // step = ceil(100/10) = 10 -> ~10 sampled points, plus closing point.
    expect(result!.length).toBeLessThanOrEqual(12);
    expect(result!.length).toBeGreaterThanOrEqual(4);
  });

  test('returns null for a ring that collapses to fewer than 4 points', () => {
    const line: Ring = [
      [0, 0],
      [1, 1],
      [0, 0],
    ];
    expect(cleanRing(line, 4)).toBeNull();
  });

  test('returns null when decimation collapses a small ring to a degenerate one', () => {
    const triangle: Ring = [
      [0, 0],
      [1, 0],
      [0.5, 1],
      [0, 0],
    ];
    // maxPoints = 1 -> step = 4 -> single sampled point -> degenerate.
    expect(cleanRing(triangle, 1)).toBeNull();
  });
});

describe('simplifyToBudget', () => {
  test('returns an empty array when there are no valid polygons', () => {
    expect(simplifyToBudget([], 100)).toEqual([]);
  });

  test('keeps a single significant polygon', () => {
    const result = simplifyToBudget([[unitSquare]], 100);
    expect(result).toHaveLength(1);
    expect(ringArea(result[0][0])).toBe(1);
  });

  test('drops sliver polygons below the area threshold', () => {
    const result = simplifyToBudget([[unitSquare], [sliverSquare]], 100);
    // Only the large square survives; the tiny sliver is dropped.
    expect(result).toHaveLength(1);
    expect(ringArea(result[0][0])).toBe(1);
  });

  test('discards holes, keeping only outer rings', () => {
    const hole: Ring = [
      [0.25, 0.25],
      [0.75, 0.25],
      [0.75, 0.75],
      [0.25, 0.75],
      [0.25, 0.25],
    ];
    const result = simplifyToBudget([[unitSquare, hole]], 100);
    expect(result).toHaveLength(1);
    // Each returned polygon has exactly one (outer) ring.
    expect(result[0]).toHaveLength(1);
  });

  test('keeps every significant polygon (preserving extent) rather than dropping them', () => {
    // Ten well-separated, similarly-sized squares.
    const squares: MultiPolygonCoordinates = Array.from({ length: 10 }, (_, i) => [
      [
        [i * 10, 0],
        [i * 10 + 1, 0],
        [i * 10 + 1, 1],
        [i * 10, 1],
        [i * 10, 0],
      ],
    ]);
    const result = simplifyToBudget(squares, 100);
    expect(result).toHaveLength(10);
  });

  test('stays within the point budget for a dense boundary', () => {
    const dense: Ring = Array.from({ length: 500 }, (_, i) => {
      const angle = (i / 500) * 2 * Math.PI;
      return [Math.cos(angle), Math.sin(angle)];
    });
    dense.push(dense[0]);
    const budget = 50;
    const result = simplifyToBudget([[dense]], budget);
    // A single ring is capped at ~budget points (plus a closing point).
    expect(totalPoints(result)).toBeLessThanOrEqual(budget + 2);
  });

  test('drops the smallest polygons when there are more than the budget allows', () => {
    // 40 squares of descending size; budget 20 allows at most floor(20/4) = 5 polygons.
    const squares: MultiPolygonCoordinates = Array.from({ length: 40 }, (_, i) => {
      const size = 40 - i; // strictly decreasing area
      return [
        [
          [i * 100, 0],
          [i * 100 + size, 0],
          [i * 100 + size, size],
          [i * 100, size],
          [i * 100, 0],
        ],
      ];
    });
    const result = simplifyToBudget(squares, 20);
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result.length).toBeGreaterThan(0);
  });
});

import { Position } from 'geojson';

import { withoutVertices } from './directSelectMode';

const outer: Position[] = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
];
const hole: Position[] = [
  [4, 4],
  [6, 4],
  [5, 6],
];
const triangle: Position[] = [
  [20, 0],
  [30, 0],
  [25, 5],
];

describe('withoutVertices', () => {
  it('removes the selected vertices and keeps rings that still have three points', () => {
    expect(withoutVertices([[outer, hole]], [[0, 0, 1]])).toEqual([[outer.filter((_, index) => index !== 1), hole]]);
  });

  it('removes just the hole when its ring drops below three points', () => {
    expect(withoutVertices([[outer, hole]], [[0, 1, 2]])).toEqual([[outer]]);
  });

  it('removes the polygon and its holes when the outer ring drops below three points', () => {
    expect(
      withoutVertices(
        [[outer, hole]],
        [
          [0, 0, 3],
          [0, 0, 2],
        ]
      )
    ).toEqual([]);
  });

  it('removes only the part of a multipolygon whose outer ring drops below three points', () => {
    expect(withoutVertices([[outer, hole], [triangle]], [[1, 0, 2]])).toEqual([[outer, hole]]);
  });

  it('removes vertices from several rings at once', () => {
    expect(
      withoutVertices(
        [[outer, hole], [triangle]],
        [
          [0, 1, 0],
          [1, 0, 0],
          [0, 0, 0],
        ]
      )
    ).toEqual([[outer.slice(1)]]);
  });
});

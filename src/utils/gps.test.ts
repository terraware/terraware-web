import { getParsedCoords } from './gps';

describe('getParsedCoords', () => {
  it('should skip incorrect coordinates', () => {
    expect(getParsedCoords(['fail'])).toEqual([]);
  });

  it('should parse supported input formats of coordinates', () => {
    const geoLocation = { latitude: 40.123, longitude: -74.123 };
    const expected = new Array(6);
    expected.fill(geoLocation);

    expect(
      getParsedCoords([
        '40.123, -74.123',
        '40.123 -74.123',
        '144442800, -266842800',
        '40.123N74.123W',
        'N 40 7.38 W 74 7.38',
        '40.123N 74.123W',
      ])
    ).toEqual(expected);
  });
});

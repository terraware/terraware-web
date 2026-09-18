import { describe, expect, test } from '@rstest/core';

import strings from 'src/strings';
import { AdHocObservationResults } from 'src/types/Observations';

import { makeAdHocObservationsCsv } from './exportAdHocObservations';

type AdHocPlotOverrides = Partial<AdHocObservationResults['adHocPlot']>;

// [longitude, latitude] pairs in the order the exporter reads them: SW, SE, NE, NW.
const boundaryRing = [
  [-122.51, 37.11],
  [-122.42, 37.22],
  [-122.33, 37.33],
  [-122.24, 37.44],
];

const makeAdHocObservation = (
  overrides: Partial<AdHocObservationResults> = {},
  plotOverrides: AdHocPlotOverrides = {}
): AdHocObservationResults =>
  ({
    // 2026-03-05T11:30Z is 2026-03-06 in Auckland, and 2026-03-05 in both UTC and the time zone the
    // test suite runs in, so this pins the formatting to the observation's own time zone.
    completedTime: '2026-03-05T11:30:00Z',
    timeZone: 'Pacific/Auckland',
    plantingSiteName: 'Ridgeline Site',
    ...overrides,
    adHocPlot: {
      monitoringPlotNumber: 42,
      boundary: { type: 'Polygon', coordinates: [boundaryRing] },
      conditions: ['Fungus', 'AnimalDamage'],
      notes: 'Standing water near the north edge',
      totalPlants: 12,
      totalSpecies: 3,
      species: [
        { totalPlants: 9, totalLive: 7, totalDead: 2 },
        { totalPlants: 3, totalLive: 1, totalDead: 2 },
      ],
      ...plotOverrides,
    },
  }) as unknown as AdHocObservationResults;

const splitCsvLine = (line: string): string[] => {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index++;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      cells.push(cell);
      cell = '';
    } else {
      cell += character;
    }
  }

  cells.push(cell);
  return cells;
};

const readCsvRows = async (blob: Blob): Promise<string[][]> => {
  const text = await blob.text();
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.length > 0)
    .map(splitCsvLine);
};

const expectedHeaders = [
  strings.MONITORING_PLOT,
  strings.PLANTING_SITE,
  strings.DATE_OBSERVED,
  strings.SOUTHWEST_CORNER_LATITUDE,
  strings.SOUTHWEST_CORNER_LONGITUDE,
  strings.NORTHWEST_CORNER_LATITUDE,
  strings.NORTHWEST_CORNER_LONGITUDE,
  strings.SOUTHEAST_CORNER_LATITUDE,
  strings.SOUTHEAST_CORNER_LONGITUDE,
  strings.NORTHEAST_CORNER_LATITUDE,
  strings.NORTHEAST_CORNER_LONGITUDE,
  strings.TOTAL_PLANTS_OBSERVED,
  strings.LIVE_PLANTS_OBSERVED,
  strings.DEAD_PLANTS_OBSERVED,
  strings.TOTAL_SPECIES_OBSERVED,
  strings.PLOT_CONDITIONS,
  strings.FIELD_NOTES,
];

describe('makeAdHocObservationsCsv', () => {
  test('starts with the ad-hoc plant monitoring column headers', async () => {
    const rows = await readCsvRows(makeAdHocObservationsCsv([makeAdHocObservation()]));

    expect(rows[0]).toEqual(expectedHeaders);
  });

  test('writes one row per observation with plot details in the header order', async () => {
    const rows = await readCsvRows(makeAdHocObservationsCsv([makeAdHocObservation()]));

    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual([
      '42',
      'Ridgeline Site',
      '2026-03-06',
      '37.11',
      '-122.51',
      '37.44',
      '-122.24',
      '37.22',
      '-122.42',
      '37.33',
      '-122.33',
      '12',
      '8',
      '4',
      '3',
      `${strings.FUNGUS_DISEASE}, ${strings.ANIMAL_DAMAGE}`,
      'Standing water near the north edge',
    ]);
  });

  test('falls back to empty text and zero counts when plot details are missing', async () => {
    const observation = makeAdHocObservation(
      { completedTime: undefined },
      {
        conditions: [],
        notes: undefined,
        totalPlants: undefined,
        totalSpecies: undefined,
        species: [],
      }
    );

    const rows = await readCsvRows(makeAdHocObservationsCsv([observation]));

    const row = Object.fromEntries(expectedHeaders.map((header, index) => [header, rows[1][index]]));
    expect(row[strings.DATE_OBSERVED]).toBe('');
    expect(row[strings.TOTAL_PLANTS_OBSERVED]).toBe('0');
    expect(row[strings.LIVE_PLANTS_OBSERVED]).toBe('0');
    expect(row[strings.DEAD_PLANTS_OBSERVED]).toBe('0');
    expect(row[strings.TOTAL_SPECIES_OBSERVED]).toBe('0');
    expect(row[strings.PLOT_CONDITIONS]).toBe('');
    expect(row[strings.FIELD_NOTES]).toBe('');
  });

  test('counts species without live or dead totals as zero', async () => {
    const observation = makeAdHocObservation({}, {
      species: [{ totalPlants: 5 }] as unknown as AdHocObservationResults['adHocPlot']['species'],
    });

    const rows = await readCsvRows(makeAdHocObservationsCsv([observation]));

    expect(rows[1][expectedHeaders.indexOf(strings.LIVE_PLANTS_OBSERVED)]).toBe('0');
    expect(rows[1][expectedHeaders.indexOf(strings.DEAD_PLANTS_OBSERVED)]).toBe('0');
  });

  test('writes a header-only csv when there are no observations', async () => {
    const rows = await readCsvRows(makeAdHocObservationsCsv([]));

    expect(rows).toEqual([expectedHeaders]);
  });
});

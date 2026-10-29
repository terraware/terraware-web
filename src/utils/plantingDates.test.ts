import { ScheduledDatePayload } from 'src/queries/generated/plantingSeasons';
import { PlantingDateRequestRow } from 'src/queries/search/plantingDateRequests';

import { findScheduledDateForRequest } from './plantingDates';

type Entry = { substratumId: number; speciesId: number; quantity: number };

const DATE = '2026-11-15';

const scheduledDate = (scheduledPlantingDateId: number, entries: Entry[], date = DATE): ScheduledDatePayload => ({
  date,
  scheduledPlantingDateId,
  species: entries.map((entry) => ({ ...entry, allocatedQuantity: 0 })),
});

const request = (entries: Entry[], date = DATE): PlantingDateRequestRow => {
  const substratumIds = [...new Set(entries.map((entry) => entry.substratumId))];
  return {
    date,
    plantingSeasonId: 1,
    plantingSeasonName: 'Season',
    plantingSiteId: 1,
    plantingSiteName: 'Site',
    status: 'Pending',
    speciesNames: [],
    speciesCount: 0,
    requestedPlants: 0,
    withdrawnPlants: 0,
    species: [],
    substrata: substratumIds.map((substratumId) => ({
      substratumId,
      substratumName: `Substratum ${substratumId}`,
      stratumId: 1,
      stratumName: 'Stratum',
      species: entries
        .filter((entry) => entry.substratumId === substratumId)
        .map(({ speciesId, quantity }) => ({
          speciesId,
          quantity,
          scientificName: `Species ${speciesId}`,
          withdrawnQuantity: 0,
        })),
    })),
  };
};

const a: Entry = { substratumId: 10, speciesId: 100, quantity: 5 };
const b: Entry = { substratumId: 20, speciesId: 200, quantity: 7 };

describe('findScheduledDateForRequest', () => {
  test('returns the only scheduled date on the request day even when its species do not match', () => {
    const onlyMatch = scheduledDate(1, [b]);
    const otherDay = scheduledDate(2, [a], '2026-11-16');

    expect(findScheduledDateForRequest([otherDay, onlyMatch], request([a]))).toBe(onlyMatch);
  });

  test('returns undefined when no scheduled date falls on the request day', () => {
    expect(findScheduledDateForRequest([scheduledDate(1, [a], '2026-11-16')], request([a]))).toBeUndefined();
    expect(findScheduledDateForRequest([], request([a]))).toBeUndefined();
  });

  test('picks the same-day scheduled date whose entries match the request regardless of order', () => {
    const wrong = scheduledDate(1, [a]);
    const right = scheduledDate(2, [b, a]);

    expect(findScheduledDateForRequest([wrong, right], request([a, b]))).toBe(right);
  });

  test('returns undefined when several scheduled dates fall on the request day and none match', () => {
    const scheduledDates = [scheduledDate(1, [a]), scheduledDate(2, [b])];

    expect(findScheduledDateForRequest(scheduledDates, request([a, b]))).toBeUndefined();
  });

  test.each([
    ['only in quantity', [{ ...a, quantity: 6 }]],
    ['only in substratum', [{ ...a, substratumId: 20 }]],
    ['by an extra entry', [a, b]],
    ['by a missing entry', []],
    ['by a duplicated entry', [a, a]],
  ])('does not match a same-day scheduled date whose entries differ %s', (_label, candidateEntries) => {
    const candidate = scheduledDate(1, candidateEntries);
    const decoy = scheduledDate(2, [b]);

    expect(findScheduledDateForRequest([candidate, decoy], request([a]))).toBeUndefined();
  });
});

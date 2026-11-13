import { getDateTimeDisplayValue } from './dateFormatter';

const timestamp = Date.parse('2026-11-13T00:30:00Z');

it.each([
  ['en', 'America/Los_Angeles', '2026-11-12 4:30 PM'],
  ['es', 'America/Los_Angeles', '2026-11-12 16:30'],
  ['fr', 'America/Los_Angeles', '2026-11-12 16:30'],
  ['en', 'UTC', '2026-11-13 12:30 AM'],
  ['es', 'UTC', '2026-11-13 0:30'],
  ['fr', 'UTC', '2026-11-13 00:30'],
  ['gx', 'UTC', '2026-11-13 00:30'],
  [null, 'UTC', '2026-11-13 12:30 AM'],
])('formats time using %s and preserves the %s date', (locale, zone, expected) => {
  expect(getDateTimeDisplayValue(timestamp, zone ?? undefined, locale).replace(/\s+/g, ' ')).toBe(expected);
});

import { daysBetween } from './dateUtils';

it.each([
  ['2026-01-05', '2026-01-15', 10],
  ['2026-01-05', '2026-01-06', 1],
  ['2026-01-05', '2026-01-05', 0],
  ['2026-01-15', '2026-01-05', -10],
  ['2026-01-06', '2026-01-05', -1],
])('counts %s to %s as %i days', (fromDate, toDate, expected) => {
  expect(daysBetween(fromDate, toDate)).toBe(expected);
});

it.each([
  ['2026-01-05T00:00:00Z', '2026-01-07T06:00:00Z', 2],
  ['2026-01-05T00:00:00Z', '2026-01-07T18:00:00Z', 3],
  ['2026-01-05T23:00:00Z', '2026-01-06T01:00:00Z', 0],
  ['2026-01-07T18:00:00Z', '2026-01-05T00:00:00Z', -3],
])('rounds the span from %s to %s to %i whole days', (fromDate, toDate, expected) => {
  expect(daysBetween(fromDate, toDate)).toBe(expected);
});

it.each([
  ['not-a-date', '2026-01-15'],
  ['2026-01-05', 'not-a-date'],
  ['01/05/2026', '01/15/2026'],
  ['', ''],
])('returns undefined when %s or %s cannot be parsed', (fromDate, toDate) => {
  expect(daysBetween(fromDate, toDate)).toBeUndefined();
});

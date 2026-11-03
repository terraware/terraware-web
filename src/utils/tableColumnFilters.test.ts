import dayjs from 'dayjs';
import { MRT_ColumnFiltersState } from 'material-react-table';

import normalizePersistedColumnFilters from './tableColumnFilters';

describe('normalizePersistedColumnFilters', () => {
  it('returns an empty list for an empty filter list', () => {
    expect(normalizePersistedColumnFilters([])).toEqual([]);
  });

  it('turns a fully cleared range into empty strings', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'eligibleLand', value: [null, null] }];

    expect(normalizePersistedColumnFilters(filters)).toEqual([{ id: 'eligibleLand', value: ['', ''] }]);
  });

  it('turns a partially cleared range bound into an empty string and keeps the other bound', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'eligibleLand', value: [null, 5] }];

    expect(normalizePersistedColumnFilters(filters)).toEqual([{ id: 'eligibleLand', value: ['', 5] }]);
  });

  it('rebuilds ISO date-time strings in an array as dayjs objects', () => {
    const filters: MRT_ColumnFiltersState = [
      { id: 'createdTime', value: ['2024-01-01T00:00:00.000Z', '2024-06-30T12:34:56.000Z'] },
    ];

    const [filter] = normalizePersistedColumnFilters(filters);
    const [from, to] = filter.value as unknown[];

    expect(dayjs.isDayjs(from)).toBe(true);
    expect(dayjs.isDayjs(to)).toBe(true);
    expect((from as dayjs.Dayjs).toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect((to as dayjs.Dayjs).toISOString()).toBe('2024-06-30T12:34:56.000Z');
  });

  it('rebuilds a date and clears the missing bound in a partially cleared date range', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'createdTime', value: ['2024-01-01T00:00:00.000Z', null] }];

    const [filter] = normalizePersistedColumnFilters(filters);
    const [from, to] = filter.value as unknown[];

    expect(dayjs.isDayjs(from)).toBe(true);
    expect((from as dayjs.Dayjs).toISOString()).toBe('2024-01-01T00:00:00.000Z');
    expect(to).toBe('');
  });

  it('turns a top-level null value into an empty string', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'projectName', value: null }];

    expect(normalizePersistedColumnFilters(filters)).toEqual([{ id: 'projectName', value: '' }]);
  });

  it('leaves values that are already usable unchanged', () => {
    const filters: MRT_ColumnFiltersState = [
      { id: 'projectName', value: 'Kelp' },
      { id: 'country', value: ['Brazil', 'Peru'] },
      { id: 'score', value: 42 },
      { id: 'eligibleLand', value: [1, 5] },
    ];

    expect(normalizePersistedColumnFilters(filters)).toEqual(filters);
  });

  it('keeps a filter object identity when nothing needs repairing', () => {
    const filter = { id: 'projectName', value: 'Kelp' };

    expect(normalizePersistedColumnFilters([filter])[0]).toBe(filter);
  });

  it('wraps a non-array value for a multi-select column into an array', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'country', value: 'Brazil' }];

    expect(normalizePersistedColumnFilters(filters, new Set(['country']))).toEqual([
      { id: 'country', value: ['Brazil'] },
    ]);
  });

  it('turns a null or undefined value for a multi-select column into an empty array', () => {
    const filters: MRT_ColumnFiltersState = [
      { id: 'country', value: null },
      { id: 'region', value: undefined },
    ];

    expect(normalizePersistedColumnFilters(filters, new Set(['country', 'region']))).toEqual([
      { id: 'country', value: [] },
      { id: 'region', value: [] },
    ]);
  });

  it('leaves an array value for a multi-select column as an array', () => {
    const filters: MRT_ColumnFiltersState = [{ id: 'country', value: ['Brazil', 'Peru'] }];

    expect(normalizePersistedColumnFilters(filters, new Set(['country']))).toEqual([
      { id: 'country', value: ['Brazil', 'Peru'] },
    ]);
  });

  it('only wraps values for the listed multi-select columns', () => {
    const filters: MRT_ColumnFiltersState = [
      { id: 'country', value: 'Brazil' },
      { id: 'projectName', value: 'Kelp' },
    ];

    expect(normalizePersistedColumnFilters(filters, new Set(['country']))).toEqual([
      { id: 'country', value: ['Brazil'] },
      { id: 'projectName', value: 'Kelp' },
    ]);
  });

  it('does not mutate the filters it is given', () => {
    const value = [null, null];
    const filters: MRT_ColumnFiltersState = [{ id: 'eligibleLand', value }];

    normalizePersistedColumnFilters(filters);

    expect(value).toEqual([null, null]);
  });
});

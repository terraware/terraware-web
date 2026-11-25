import { exactMultiSelectFilterFn, makeDateRangeFilterFn } from './tableFilters';

type TestRow = { date?: string; other?: string };

// At runtime MRT wraps the row; simulate that here.
const makeRow = (original: TestRow): TestRow => ({ original }) as unknown as TestRow;

const filterFn = makeDateRangeFilterFn<TestRow>('date');

const dayjsLike = (dateStr: string | null) => ({
  format: (f: string) => (f === 'YYYY-MM-DD' && dateStr ? dateStr : ''),
  isValid: () => dateStr !== null,
});

describe('makeDateRangeFilterFn', () => {
  test('returns true when both filter bounds are empty', () => {
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [null, null])).toBe(true);
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [undefined, undefined])).toBe(true);
    expect(filterFn(makeRow({}), 'date', [null, null])).toBe(true);
  });

  test('returns false when row has no date and a bound is set', () => {
    expect(filterFn(makeRow({}), 'date', [dayjsLike('2024-01-01'), null])).toBe(false);
    expect(filterFn(makeRow({ date: undefined }), 'date', [null, dayjsLike('2024-12-31')])).toBe(false);
  });

  test('filters by min date (dayjs objects)', () => {
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [dayjsLike('2024-03-01'), null])).toBe(true);
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [dayjsLike('2024-03-02'), null])).toBe(false);
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [dayjsLike('2024-02-28'), null])).toBe(true);
  });

  test('filters by max date (dayjs objects)', () => {
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [null, dayjsLike('2024-03-01')])).toBe(true);
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [null, dayjsLike('2024-02-28')])).toBe(false);
    expect(filterFn(makeRow({ date: '2024-03-01' }), 'date', [null, dayjsLike('2024-03-02')])).toBe(true);
  });

  test('filters by both bounds (dayjs objects)', () => {
    expect(filterFn(makeRow({ date: '2024-06-15' }), 'date', [dayjsLike('2024-06-01'), dayjsLike('2024-06-30')])).toBe(
      true
    );
    expect(filterFn(makeRow({ date: '2024-05-31' }), 'date', [dayjsLike('2024-06-01'), dayjsLike('2024-06-30')])).toBe(
      false
    );
    expect(filterFn(makeRow({ date: '2024-07-01' }), 'date', [dayjsLike('2024-06-01'), dayjsLike('2024-06-30')])).toBe(
      false
    );
  });

  test('accepts ISO timestamp strings — only the date part is compared', () => {
    expect(
      filterFn(makeRow({ date: '2024-03-15T10:30:00Z' }), 'date', [dayjsLike('2024-03-01'), dayjsLike('2024-03-31')])
    ).toBe(true);
    expect(
      filterFn(makeRow({ date: '2024-04-01T00:00:00Z' }), 'date', [dayjsLike('2024-03-01'), dayjsLike('2024-03-31')])
    ).toBe(false);
  });

  test('accepts plain YYYY-MM-DD strings as filter bounds', () => {
    expect(filterFn(makeRow({ date: '2024-03-15' }), 'date', ['2024-03-01', '2024-03-31'])).toBe(true);
    expect(filterFn(makeRow({ date: '2024-04-01' }), 'date', ['2024-03-01', '2024-03-31'])).toBe(false);
    expect(filterFn({ date: '2024-03-15' }, 'date', ['2024-03-01', '2024-03-31'])).toBe(true);
    expect(filterFn({ date: '2024-04-01' }, 'date', [null, '2024-03-31'])).toBe(false);
  });

  test('invalid dayjs object is treated as no bound', () => {
    const invalidDayjs = { format: () => '', isValid: () => false };
    expect(filterFn(makeRow({ date: '2024-03-15' }), 'date', [invalidDayjs, null])).toBe(true);
    expect(filterFn(makeRow({ date: '2024-03-15' }), 'date', [null, invalidDayjs])).toBe(true);
  });
});

describe('exactMultiSelectFilterFn', () => {
  // At runtime MRT calls the filter with a Row wrapper that exposes getValue.
  const makeSpeciesRow = (speciesName: unknown) =>
    ({ getValue: () => speciesName }) as unknown as { speciesName: unknown };

  test('returns true when no options are selected', () => {
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Acacia'), 'speciesName', [])).toBe(true);
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Acacia'), 'speciesName', undefined as unknown as unknown[])).toBe(
      true
    );
  });

  test('keeps only rows whose value is one of the selected options', () => {
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Acacia koa'), 'speciesName', ['Acacia koa', 'Banana'])).toBe(true);
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Metrosideros'), 'speciesName', ['Acacia koa', 'Banana'])).toBe(
      false
    );
  });

  test('does not match on substrings', () => {
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Acacia koa'), 'speciesName', ['Acacia'])).toBe(false);
    expect(exactMultiSelectFilterFn(makeSpeciesRow('Acacia'), 'speciesName', ['Acacia koa'])).toBe(false);
  });

  test('treats missing values as empty', () => {
    expect(exactMultiSelectFilterFn(makeSpeciesRow(undefined), 'speciesName', ['Acacia'])).toBe(false);
    expect(exactMultiSelectFilterFn(makeSpeciesRow(null), 'speciesName', ['Acacia'])).toBe(false);
  });
});

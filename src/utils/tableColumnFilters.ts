import dayjs from 'dayjs';
import { MRT_ColumnFiltersState } from 'material-react-table';

const isISODateTimeString = (value: unknown) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);

const normalizeEntry = (entry: unknown) => {
  if (isISODateTimeString(entry)) {
    return dayjs(entry as string);
  }
  return entry === null ? '' : entry;
};

/**
 * Repairs column filters read back from localStorage.
 *
 * Date-range filters hold dayjs objects, which serialize to ISO strings and have to be rebuilt.
 * JSON.stringify also turns undefined into null, so a range filter the user cleared back to
 * [undefined, undefined] reloads as [null, null].
 */
const normalizePersistedColumnFilters = (
  filters: MRT_ColumnFiltersState,
  multiSelectColumnIds: Set<string> = new Set()
): MRT_ColumnFiltersState =>
  filters.map((filter) => {
    if (Array.isArray(filter.value)) {
      return { ...filter, value: (filter.value as unknown[]).map(normalizeEntry) };
    }

    if (multiSelectColumnIds.has(filter.id)) {
      return { ...filter, value: filter.value === null || filter.value === undefined ? [] : [filter.value] };
    }

    return filter.value === null ? { ...filter, value: '' } : filter;
  });

export default normalizePersistedColumnFilters;

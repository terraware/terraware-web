/**
 * Returns a date-range filter function for use with EditableTable columns.
 *
 * MRT passes a wrapped row and Dayjs bounds; V2 passes the original record and string bounds.
 *
 * @param field - Key of the row object whose value holds an ISO date string (YYYY-MM-DD prefix).
 */
const makeDateRangeFilterFn =
  <T extends Record<string, unknown>>(field: keyof T) =>
  (row: T, _columnId: string, filterValue: unknown[]): boolean => {
    const toDayStr = (val: unknown): string | null => {
      if (val === null || val === undefined) {
        return null;
      }
      if (typeof val === 'object') {
        const dayjsLike = val as { format?: (f: string) => string; isValid?: () => boolean };
        if (typeof dayjsLike.format === 'function' && typeof dayjsLike.isValid === 'function') {
          return dayjsLike.isValid() ? dayjsLike.format('YYYY-MM-DD') : null;
        }
      }
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        return val.substring(0, 10);
      }
      return null;
    };

    const minStr = toDayStr(filterValue[0]);
    const maxStr = toDayStr(filterValue[1]);
    if (!minStr && !maxStr) {
      return true;
    }

    const original = (row as { original?: T }).original ?? row;
    const dateStr = original[field] as string | undefined;
    if (!dateStr) {
      return false;
    }

    const rowDateStr = dateStr.substring(0, 10);
    if (minStr && rowDateStr < minStr) {
      return false;
    }
    if (maxStr && rowDateStr > maxStr) {
      return false;
    }
    return true;
  };

/**
 * Multi-select column filter that matches the cell value exactly.
 *
 */
const exactMultiSelectFilterFn = <T>(row: T, columnId: string, filterValue: unknown[]): boolean => {
  if (!filterValue || filterValue.length === 0) {
    return true;
  }

  const cellValue = (row as unknown as { getValue: (id: string) => unknown }).getValue(columnId);
  const rowValue = cellValue === null || cellValue === undefined ? '' : String(cellValue);

  return filterValue.some((value) => String(value) === rowValue);
};

export { exactMultiSelectFilterFn, makeDateRangeFilterFn };

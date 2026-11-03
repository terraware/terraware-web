import dayjs from 'dayjs';
import { MRT_RowData, MRT_TableInstance } from 'material-react-table';

import strings from 'src/strings';

import { TableSettings, isBlankFilterValue, isDataColumnId, nonEmptyFilters } from './tableSettings';

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const RANGE_VARIANTS = ['date-range', 'datetime-range', 'range', 'range-slider', 'time-range'];

const getColumn = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>, columnId: string) =>
  table.getAllLeafColumns().find((column) => column.id === columnId);

const getColumnHeader = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>, columnId: string) => {
  const header = getColumn(table, columnId)?.columnDef.header;
  return typeof header === 'string' ? header : columnId;
};

const formatValue = (value: unknown) => {
  if (dayjs.isDayjs(value)) {
    return value.format('YYYY-MM-DD');
  }
  if (typeof value === 'string' && ISO_DATE_TIME.test(value)) {
    return dayjs(value).format('YYYY-MM-DD');
  }
  return String(value);
};

const formatFilterValue = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  columnId: string,
  value: unknown
) => {
  const columnDef = getColumn(table, columnId)?.columnDef;

  if (Array.isArray(value) && RANGE_VARIANTS.includes(columnDef?.filterVariant ?? '')) {
    const [min, max] = value as unknown[];
    if (isBlankFilterValue(max)) {
      return `≥ ${formatValue(min)}`;
    }
    if (isBlankFilterValue(min)) {
      return `≤ ${formatValue(max)}`;
    }
    return `${formatValue(min)} – ${formatValue(max)}`;
  }

  const options = Array.isArray(columnDef?.filterSelectOptions) ? columnDef.filterSelectOptions : [];
  const toLabel = (optionValue: unknown) => {
    const option = options.find((candidate) => typeof candidate === 'object' && candidate.value === optionValue);
    return typeof option === 'object' && option.label ? option.label : formatValue(optionValue);
  };

  return Array.isArray(value)
    ? value
        .filter((item) => !isBlankFilterValue(item))
        .map(toLabel)
        .join(', ')
    : toLabel(value);
};

const formatSort = <TData extends MRT_RowData>(table: MRT_TableInstance<TData>, sorting: TableSettings['sorting']) =>
  sorting.map((sort) => `${getColumnHeader(table, sort.id)} ${sort.desc ? '↓' : '↑'}`).join(', ');

export const getSaveViewSummary = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  settings: TableSettings,
  baseViewLabel?: string
): string[] => {
  const filters = nonEmptyFilters(settings.columnFilters).map(
    (filter) =>
      strings.formatString(
        strings.VIEW_SUMMARY_FILTER,
        getColumnHeader(table, filter.id),
        formatFilterValue(table, filter.id, filter.value)
      ) as string
  );
  const search = settings.globalFilter
    ? [strings.formatString(strings.VIEW_SUMMARY_SEARCH, settings.globalFilter) as string]
    : [];
  const sort = settings.sorting.length
    ? [strings.formatString(strings.VIEW_SUMMARY_SORT, formatSort(table, settings.sorting)) as string]
    : [];
  const columns = [
    ...table.getLeftVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getRightVisibleLeafColumns(),
  ]
    .filter((column) => isDataColumnId(column.id))
    .map((column) => getColumnHeader(table, column.id));

  return [
    ...(baseViewLabel ? [strings.formatString(strings.VIEW_SUMMARY_BASE_VIEW, baseViewLabel) as string] : []),
    ...filters,
    ...search,
    ...sort,
    ...(filters.length || search.length ? [] : [strings.VIEW_SUMMARY_NO_FILTERS]),
    strings.formatString(strings.VIEW_SUMMARY_COLUMNS, columns.join(', ')) as string,
  ];
};

export const getViewSummary = <TData extends MRT_RowData>(
  table: MRT_TableInstance<TData>,
  settings: TableSettings,
  baseViewLabel?: string
) => {
  const filterCount = nonEmptyFilters(settings.columnFilters).length + (settings.globalFilter ? 1 : 0);
  const sortedColumns = settings.sorting.map((sort) => getColumnHeader(table, sort.id).toLocaleLowerCase()).join(', ');

  return [
    ...(baseViewLabel ? [baseViewLabel] : []),
    ...(filterCount === 1 ? [strings.VIEW_SUMMARY_FILTER_COUNT_SINGULAR] : []),
    ...(filterCount > 1 ? [strings.formatString(strings.VIEW_SUMMARY_FILTER_COUNT_PLURAL, filterCount) as string] : []),
    ...(sortedColumns ? [strings.formatString(strings.VIEW_SUMMARY_SORTED_BY, sortedColumns) as string] : []),
    ...(filterCount || sortedColumns ? [] : [strings.VIEW_SUMMARY_NONE]),
  ].join('. ');
};

import { Table as WebComponentsTable, TableRowType } from '@terraware/web-components';
import strings from 'src/strings';
import { LocalizationProps, Props } from '@terraware/web-components/components/table';

function renderPaginationText(from: number, to: number, total: number): string {
  if (total > 0) {
    return strings.formatString(strings.PAGINATION_FOOTER, from, to, total) as string;
  } else {
    return strings.PAGINATION_FOOTER_EMPTY;
  }
}

function renderNumSelectedText(numSelected: number): string {
  return strings.formatString(strings.ROWS_SELECTED, numSelected) as string;
}

interface TableProps<T> extends Omit<Props<T>, keyof LocalizationProps> {
  showPagination?: boolean;
}

export default function Table<T extends TableRowType>(props: TableProps<T>): JSX.Element {
  return WebComponentsTable({
    ...props,
    booleanFalseText: strings.NO,
    booleanTrueText: strings.YES,
    editText: strings.EDIT,
    renderNumSelectedText,
    ...(props.showPagination !== false ? { renderPaginationText } : {}),
  });
}

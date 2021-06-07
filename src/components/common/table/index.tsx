import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';
import { descendingComparator, getComparator, Order, stableSort } from './sort';
import TableCellRenderer from './TableCellRenderer';
import TableHeader from './TableHeader';
import { DetailsRendererProps, RendererProps, TableColumnType } from './types';

const tableStyles = makeStyles((theme) => ({
  hover: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.neutral[100]}!important`,
    },
  },
  table: {
    padding: theme.spacing(0, 3),
    borderCollapse: 'initial',
  },
  container: {
    maxHeight: 850,
  },
  inactiveRow: {
    background: theme.palette.neutral[50],
  },
}));

export interface Props<T> {
  id?: string;
  orderBy: string;
  order?: Order;
  columns: TableColumnType[];
  rows: T[];
  Renderer?: (props: RendererProps<T>) => JSX.Element;
  onSelect?: (value: T) => void;
  DetailsRenderer?: (props: DetailsRendererProps) => JSX.Element;
  sortComparator?: (a: T, b: T, orderBy: keyof T) => 1 | -1 | 0;
  sortHandler?: (order: Order, orderBy: string) => void;
  isInactive?: (row: T) => boolean;
  onReorderEnd?: ({ oldIndex, newIndex }: any) => void;
  isClickable?: (row: T) => boolean;
}

export default function EnhancedTable<T>({
  id,
  columns,
  rows,
  order: _order = 'asc',
  orderBy: _orderBy,
  Renderer = TableCellRenderer,
  onSelect,
  DetailsRenderer,
  sortComparator = descendingComparator,
  sortHandler,
  isInactive,
  onReorderEnd,
  isClickable,
}: Props<T>): JSX.Element {
  const classes = tableStyles();
  const [order, setOrder] = React.useState<Order>(_order);
  const [orderBy, setOrderBy] = React.useState(_orderBy);

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);

    sortHandler && sortHandler(newOrder, property);
  };

  const hasEditColumn = columns.filter((c) => c.type === 'edit').length > 0;

  return (
    <TableContainer className={classes.container} id={id}>
      <Table
        stickyHeader
        aria-labelledby='tableTitle'
        size='medium'
        aria-label='enhanced table'
        className={classes.table}
      >
        <TableHeader
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
          columns={columns}
          onReorderEnd={onReorderEnd}
        />
        <TableBody>
          {stableSort(rows, getComparator(order, orderBy, sortComparator)).map(
            (row, index) => {
              const onClick = onSelect ? () => onSelect(row as T) : undefined;
              return (
                <React.Fragment key={index}>
                  <TableRow
                    id={`row${index + 1}`}
                    classes={{ hover: classes.hover }}
                    hover={
                      Boolean(onSelect) &&
                      (isClickable ? isClickable(row as T) : true) &&
                      !hasEditColumn
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        onClick &&
                        !hasEditColumn &&
                        (isClickable ? isClickable(row as T) : true)
                      ) {
                        onClick();
                      }
                    }}
                    className={
                      isInactive && isInactive(row as T)
                        ? classes.inactiveRow
                        : undefined
                    }
                  >
                    {columns.map((c) => (
                      <Renderer
                        index={index + 1}
                        key={c.key}
                        row={row as T}
                        column={c}
                        value={row[c.key]}
                        onRowClick={onClick}
                      />
                    ))}
                  </TableRow>
                  {DetailsRenderer && (
                    <DetailsRenderer index={index} row={row} />
                  )}
                </React.Fragment>
              );
            }
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function tableSort<T>(
  ignore: boolean,
  array: T[],
  comparator: (a: T, b: T) => number
): T[] {
  if (ignore) {
    return array;
  }
  return stableSort(array, comparator);
}

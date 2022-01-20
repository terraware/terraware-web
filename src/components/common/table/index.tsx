import { Checkbox, TableCell } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect } from 'react';
import EnhancedTableToolbar from './EnhancedTableToolbar';
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
  emptyTableMessage?: string;
  showCheckbox?: boolean;
  showTopBar?: boolean;
  buttonText?: string;
  buttonType?: 'productive' | 'passive' | 'destructive' | undefined;
  onButtonClick?: () => void;
  selectedRows?: T[];
  setSelectedRows?: (selectedRows: T[]) => void;
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
  emptyTableMessage,
  showCheckbox,
  showTopBar,
  buttonText,
  buttonType,
  onButtonClick,
  selectedRows,
  setSelectedRows,
}: Props<T>): JSX.Element {
  const classes = tableStyles();
  const [order, setOrder] = React.useState<Order>(_order);
  const [orderBy, setOrderBy] = React.useState(_orderBy);

  useEffect(() => {
    if (rows.length && setSelectedRows) {
      setSelectedRows([]);
    }
  }, [rows, setSelectedRows]);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    const newOrder = isAsc ? 'desc' : 'asc';
    setOrder(newOrder);
    setOrderBy(property);

    if (sortHandler) {
      sortHandler(newOrder, property);
    }
  };

  const hasEditColumn = columns.filter((c) => c.type === 'edit').length > 0;

  const isSelected = (row: T) => {
    return selectedRows && selectedRows.indexOf(row) !== -1;
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setSelectedRows) {
      if (event.target.checked) {
        setSelectedRows(rows);
        return;
      } else {
        setSelectedRows([]);
      }
    }
  };

  const handleClick = (event: React.MouseEvent<unknown>, row: T) => {
    if (setSelectedRows && selectedRows) {
      const selectedIndex = selectedRows.indexOf(row);
      let newSelected: T[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selectedRows, row);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selectedRows.slice(1));
      } else if (selectedIndex === selectedRows.length - 1) {
        newSelected = newSelected.concat(selectedRows.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selectedRows.slice(0, selectedIndex), selectedRows.slice(selectedIndex + 1));
      }

      setSelectedRows(newSelected);
    }
  };

  return (
    <>
      {showTopBar && buttonText && buttonType && onButtonClick && (
        <EnhancedTableToolbar
          numSelected={selectedRows ? selectedRows.length : 0}
          buttonText={buttonText}
          buttonType={buttonType}
          onButtonClick={onButtonClick}
        />
      )}
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
            numSelected={showCheckbox ? selectedRows?.length : undefined}
            onSelectAllClick={showCheckbox ? handleSelectAllClick : undefined}
            rowCount={showCheckbox ? rows?.length : undefined}
          />
          <TableBody>
            {rows.length < 1 && emptyTableMessage && (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  <p>{emptyTableMessage}</p>
                </TableCell>
              </TableRow>
            )}
            {rows &&
              stableSort(rows, getComparator(order, orderBy, sortComparator)).map((row, index) => {
                const onClick = onSelect ? () => onSelect(row as T) : undefined;
                const isItemSelected = isSelected(row as T);

                return (
                  <React.Fragment key={index}>
                    <TableRow
                      id={`row${index + 1}`}
                      classes={{ hover: classes.hover }}
                      hover={Boolean(onSelect) && (isClickable ? isClickable(row as T) : true) && !hasEditColumn}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onClick && !hasEditColumn && (isClickable ? isClickable(row as T) : true)) {
                          onClick();
                        }
                        if (!onClick && !hasEditColumn && (isClickable ? isClickable(row as T) : true)) {
                          handleClick(e, row as T);
                        }
                      }}
                      className={isInactive && isInactive(row as T) ? classes.inactiveRow : undefined}
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      {showCheckbox && (
                        <TableCell padding='checkbox'>
                          <Checkbox color='primary' checked={isItemSelected} />
                        </TableCell>
                      )}
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
                    {DetailsRenderer && <DetailsRenderer index={index} row={row} />}
                  </React.Fragment>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export function tableSort<T>(ignore: boolean, array: T[], comparator: (a: T, b: T) => number): T[] {
  if (ignore) {
    return array;
  }

  return stableSort(array, comparator);
}

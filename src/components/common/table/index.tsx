import {
  Box,
  Checkbox,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import EnhancedTableToolbar from './EnhancedTableToolbar';
import { descendingComparator, getComparator, Order, stableSort } from './sort';
import TableCellRenderer from './TableCellRenderer';
import TableHeader from './TableHeader';
import { DetailsRendererProps, RendererProps, TableColumnType } from './types';
import { makeStyles } from '@mui/styles';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const tableStyles = makeStyles((theme: Theme) => ({
  hover: {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: `${theme.palette.neutral[100]}!important`,
    },
  },
  table: {
    borderCollapse: 'initial',
  },
  inactiveRow: {
    background: theme.palette.neutral[50],
  },
  tableRow: {
    '&.MuiTableRow-root.Mui-selected': {
      backgroundColor: 'initial',
    },
  },
}));

export interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string | JSX.Element;
}

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
  topBarButtons?: TopBarButton[];
  selectedRows?: T[];
  setSelectedRows?: React.Dispatch<React.SetStateAction<T[]>>;
  showPagination?: boolean;
  controlledOnSelect?: boolean;
  reloadData?: () => void;
}

export type TopBarButton = {
  buttonText: string;
  buttonType: 'productive' | 'passive' | 'destructive' | undefined;
  onButtonClick: () => void;
};

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
  topBarButtons,
  selectedRows,
  setSelectedRows,
  showPagination = true,
  controlledOnSelect,
  reloadData,
}: Props<T>): JSX.Element {
  const classes = tableStyles();
  const [order, setOrder] = React.useState<Order>(_order);
  const [orderBy, setOrderBy] = React.useState(_orderBy);
  const [maxItemsPerPage] = useState(100);
  const [itemsToSkip, setItemsToSkip] = useState(0);
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (setSelectedRows && rows.length >= 0) {
      setSelectedRows((currentlySelectedRows: T[]) => {
        const emptyArray: T[] = [];
        if (rows.length || currentlySelectedRows.length > rows.length) {
          return emptyArray;
        }
        return currentlySelectedRows;
      });
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

  const handleChangePage = (event: unknown, newPage: number) => {
    setItemsToSkip(maxItemsPerPage * (newPage - 1));
  };

  function columnsToHeadCells(columnsR: TableColumnType[]): HeadCell[] {
    return columnsR.map((c) => ({
      id: c.key,
      disablePadding: false,
      label: typeof c.name === 'string' ? c.name.toUpperCase() : c.name,
    }));
  }

  const [headCells, setHeadCells] = React.useState<HeadCell[]>(columnsToHeadCells(columns));
  React.useEffect(() => {
    setHeadCells(columnsToHeadCells(columns));
  }, [columns]);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: { active: any; over: any }) {
    const { active, over } = event;
    console.log(event);
    if (active && over && active.id !== over.id && onReorderEnd) {
      const oldIndex = headCells.findIndex((item) => item.id === active.id);
      const newIndex = headCells.findIndex((item) => item.id === over.id);

      onReorderEnd({ oldIndex, newIndex });
    }
  }

  return (
    <>
      {showTopBar && (
        <EnhancedTableToolbar numSelected={selectedRows ? selectedRows.length : 0} topBarButtons={topBarButtons} />
      )}
      <TableContainer id={id}>
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
                  <TableCell colSpan={columns.length + 1} align='center'>
                    <p>{emptyTableMessage}</p>
                  </TableCell>
                </TableRow>
              )}
              {rows &&
                stableSort(
                  rows.slice(itemsToSkip, itemsToSkip + maxItemsPerPage),
                  getComparator(order, orderBy, sortComparator)
                ).map((row, index) => {
                  const onClick = onSelect && !controlledOnSelect ? () => onSelect(row as T) : undefined;
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
                        className={`${isInactive && isInactive(row as T) ? classes.inactiveRow : undefined} ${
                          classes.tableRow
                        }`}
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
                            onRowClick={onSelect && controlledOnSelect ? () => onSelect(row as T) : onClick}
                            reloadData={reloadData}
                          />
                        ))}
                      </TableRow>
                      {DetailsRenderer && <DetailsRenderer index={index} row={row} />}
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </DndContext>
      </TableContainer>
      {showPagination && (
        <Box display='flex' alignItems='center' justifyContent='flex-end' paddingTop='24px'>
          {itemsToSkip + maxItemsPerPage < rows.length ? (
            <Typography paddingRight='24px' fontSize='14px'>
              {itemsToSkip + 1} to {itemsToSkip + maxItemsPerPage} of {rows.length}
            </Typography>
          ) : (
            <Typography paddingRight='24px'>
              {itemsToSkip + 1} to {rows.length} of {rows.length}
            </Typography>
          )}
          <Pagination
            count={Math.ceil(rows.length / maxItemsPerPage)}
            page={itemsToSkip / maxItemsPerPage + 1}
            shape='rounded'
            onChange={handleChangePage}
            siblingCount={isMobile ? 0 : 1}
            size={'small'}
          />
        </Box>
      )}
    </>
  );
}

export function tableSort<T>(ignore: boolean, array: T[], comparator: (a: T, b: T) => number): T[] {
  if (ignore) {
    return array;
  }

  return stableSort(array, comparator);
}

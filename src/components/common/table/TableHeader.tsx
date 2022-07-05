import { DragIndicator } from '@mui/icons-material';
import { Checkbox, TableCell, TableHead, TableRow, TableSortLabel, Theme } from '@mui/material';
import React from 'react';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { Order } from './sort';
import { TableColumnType } from './types';
import { makeStyles } from '@mui/styles';

const dragIconStyles = makeStyles((theme: Theme) => ({
  root: {
    marginLeft: -20,
    color: theme.palette.common.white,
    '&:hover': {
      color: theme.palette.neutral[600],
    },
  },
}));

const useStyles = makeStyles((theme: Theme) => ({
  headcell: {
    background: theme.palette.common.white,
  },
}));

interface Props {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  order: Order;
  orderBy?: string;
  columns: TableColumnType[];
  onReorderEnd?: ({ oldIndex, newIndex }: any) => void;
  numSelected?: number;
  rowCount?: number;
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface HeadCell {
  disablePadding: boolean;
  id: string;
  label: string | JSX.Element;
}

function columnsToHeadCells(columns: TableColumnType[]): HeadCell[] {
  return columns.map((c) => ({
    id: c.key,
    disablePadding: false,
    label: typeof c.name === 'string' ? c.name.toUpperCase() : c.name,
  }));
}

export default function EnhancedTableHead(props: Props): JSX.Element {
  const classes = useStyles();
  const { order, orderBy, onRequestSort, numSelected, rowCount, onSelectAllClick } = props;
  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  const [headCells, setHeadCells] = React.useState<HeadCell[]>(columnsToHeadCells(props.columns));
  React.useEffect(() => {
    setHeadCells(columnsToHeadCells(props.columns));
  }, [props.columns]);

  return (
    <SortableHead lockAxis='x' axis='x' onSortEnd={props.onReorderEnd} useDragHandle>
      <TableRow id='table-header'>
        {numSelected !== undefined && rowCount !== undefined && rowCount > 0 && onSelectAllClick && (
          <TableCell padding='checkbox'>
            <Checkbox
              color='primary'
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
            />
          </TableCell>
        )}
        {headCells.map((headCell, i) => (
          <SortableCell
            disabled={!props.onReorderEnd}
            index={i}
            key={headCell.id}
            value={
              <TableCell
                id={`table-header-${headCell.id}`}
                key={headCell.id}
                align='left'
                padding={headCell.disablePadding ? 'none' : 'normal'}
                sortDirection={orderBy === headCell.id ? order : false}
                className={classes.headcell}
              >
                {headCell.label && (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={createSortHandler(headCell.id)}
                  >
                    {i > 0 && <DragHandle />}
                    {headCell.label}
                  </TableSortLabel>
                )}
              </TableCell>
            }
          />
        ))}
      </TableRow>
    </SortableHead>
  );
}

const DragHandle = SortableHandle(() => <DragIndicator fontSize='small' classes={dragIconStyles()} />);

const SortableHead = SortableContainer(({ children }: { children: React.ReactNode }) => {
  return <TableHead>{children}</TableHead>;
});

const SortableCell = SortableElement(({ value }: { value: React.ReactNode }) => {
  return <>{value}</>;
});

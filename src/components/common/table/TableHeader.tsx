import { Checkbox, TableCell, TableRow } from '@mui/material';
import React from 'react';
import { Order } from './sort';
import { TableColumnType } from './types';
import { SortableContext } from '@dnd-kit/sortable';
import TableHeaderItem from './TableHeaderItem';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

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
  const { order, orderBy, onRequestSort, numSelected, rowCount, onSelectAllClick } = props;

  const [headCells, setHeadCells] = React.useState<HeadCell[]>(columnsToHeadCells(props.columns));
  React.useEffect(() => {
    setHeadCells(columnsToHeadCells(props.columns));
  }, [props.columns]);

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
    if (active && over && active.id !== over.id && props.onReorderEnd) {
      const oldIndex = headCells.findIndex((item) => item.id === active.id);
      const newIndex = headCells.findIndex((item) => item.id === over.id);

      props.onReorderEnd({ oldIndex, newIndex });
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
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
        <SortableContext items={headCells}>
          {headCells.map((headCell, i) => {
            return (
              <TableHeaderItem
                headCell={headCell}
                order={order}
                orderBy={orderBy}
                onRequestSort={onRequestSort}
                i={i}
              />
            );
          })}
        </SortableContext>
      </TableRow>
    </DndContext>
  );
}

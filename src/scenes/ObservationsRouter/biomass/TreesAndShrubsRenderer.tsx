import React, { type JSX } from 'react';

import { IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function TreesAndShrubsRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index, onRowClick } = props;
  const theme = useTheme();

  const getTreeNumber = () => {
    if (row.treeGrowthForm === 'Trunk') {
      return `${row.treeNumber}_${row.trunkNumber}`;
    }
    return row.treeNumber;
  };

  if (column.key === 'description' && onRowClick) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          value ? (
            <IconButton onClick={() => onRowClick()}>
              <Icon name='note' style={{ fill: theme.palette.TwClrIcn }} size='medium' />
            </IconButton>
          ) : (
            ''
          )
        }
        row={row}
        title={value as string}
      />
    );
  }

  if (column.key === 'treeGrowthForm') {
    const growthForm = row.treeGrowthForm === 'Trunk' ? 'Tree' : row.treeGrowthForm;
    return <CellRenderer index={index} column={column} value={growthForm} row={row} title={value as string} />;
  }

  if (column.key === 'treeNumber') {
    return <CellRenderer index={index} column={column} value={getTreeNumber()} row={row} title={value as string} />;
  }

  return <CellRenderer {...props} />;
}

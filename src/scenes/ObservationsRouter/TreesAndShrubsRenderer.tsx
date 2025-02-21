import React from 'react';

import { IconButton, useTheme } from '@mui/material';
import { Icon } from '@terraware/web-components';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function TreesAndShrubsRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index, onRowClick } = props;
  const theme = useTheme();

  if (column.key === 'description' && onRowClick) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          value ? (
            <IconButton onClick={() => onRowClick()}>
              <Icon name='info' style={{ fill: theme.palette.TwClrIcn }} />
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

  return <CellRenderer {...props} />;
}

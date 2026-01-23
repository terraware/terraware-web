import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function DeliverablesRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'descriptionHtml') {
    const description = typeof value === 'string' ? value : '';

    return (
      <CellRenderer
        index={index}
        column={column}
        value={<Box dangerouslySetInnerHTML={{ __html: description || '' }} />}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

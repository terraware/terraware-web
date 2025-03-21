import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function ReportsTargetsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index, onRowClick } = props;

  if (column.key === 'name' && onRowClick) {
    return (
      <CellRenderer
        column={column}
        value={
          <Link fontSize='16px' onClick={() => onRowClick()}>
            {value as React.ReactNode}
          </Link>
        }
        row={row}
        index={index}
      />
    );
  }

  return <CellRenderer {...props} />;
}

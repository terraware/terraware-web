import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function SpecificMetricsRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value, onRowClick } = props;

  if (column.key === 'name' && onRowClick) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' onClick={() => onRowClick()}>
            {value as React.ReactNode}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function ModulesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value, onRowClick } = props;

  if (column.key === 'name') {
    if (!onRowClick) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={
            <Link fontSize='16px' target='_blank' to={APP_PATHS.ADMIN_MODULE.replace(':moduleId', row.id)}>
              {value as React.ReactNode}
            </Link>
          }
          row={row}
        />
      );
    }
    return <CellRenderer index={index} column={column} value={value} row={row} />;
  }

  if (column.key === 'title') {
    if (onRowClick) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={
            <Link fontSize='16px' target='_blank' onClick={() => onRowClick()}>
              {value as React.ReactNode}
            </Link>
          }
          row={row}
        />
      );
    }
    return <CellRenderer index={index} column={column} value={value} row={row} />;
  }

  return <CellRenderer {...props} />;
}

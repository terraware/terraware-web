import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function ModulesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'name') {
    // if it is not edit mode
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' to={APP_PATHS.ACCELERATOR_MODULE_CONTENT.replace(':moduleId', row.id)}>
            {value as React.ReactNode}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

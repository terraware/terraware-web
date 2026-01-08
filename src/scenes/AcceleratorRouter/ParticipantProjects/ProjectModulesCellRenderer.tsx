import React from 'react';

import { RendererProps, TableRowType } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { APP_PATHS } from 'src/constants';

export default function ProjectModulesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link fontSize='16px' target='_blank' to={APP_PATHS.ACCELERATOR_MODULE_CONTENT.replace(':moduleId', row.id)}>
            {value as React.ReactNode}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function CohortCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={<Link to={APP_PATHS.ACCELERATOR_COHORTS_VIEW.replace(':cohortId', row.id)}>{value as string}</Link>}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

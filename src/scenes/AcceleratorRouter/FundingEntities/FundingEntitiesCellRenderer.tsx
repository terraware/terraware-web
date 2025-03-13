import React from 'react';

import { RendererProps, TableRowType } from '@terraware/web-components';

import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { Project } from 'src/types/Project';

export default function FundingEntitiesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, value, index, row } = props;

  if (column.key === 'projects') {
    const stringList: string[] =
      Array.isArray(value) && value.length ? (value as Project[]).map((project: Project) => project.name) : [];
    return <CellRenderer index={index} row={row} column={column} value={stringList.join(', ')} />;
  }

  return <CellRenderer {...props} />;
}

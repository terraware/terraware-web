import React from 'react';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { ModuleEventProject } from 'src/types/Module';

export default function EventsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'id') {
    const valueToRender = value?.toString() === '-1' ? '' : value;
    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  if (column.key === 'projects') {
    const valueToRender = Array.isArray(value)
      ? value
          .map((proj) => {
            const projectTyped = proj as ModuleEventProject;
            return projectTyped.projectName;
          })
          .join(', ')
      : '';
    return <CellRenderer index={index} column={column} value={valueToRender} row={row} />;
  }

  return <CellRenderer {...props} />;
}

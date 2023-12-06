import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';

export default function ProjectCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  const createProjectLink = () => {
    const projectLocation = {
      pathname: APP_PATHS.PROJECT_VIEW.replace(':projectId', row.id.toString()),
    };
    return <Link to={projectLocation.pathname}>{row.name}</Link>;
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createProjectLink()} row={row} />;
  }

  return <CellRenderer {...props} />;
}

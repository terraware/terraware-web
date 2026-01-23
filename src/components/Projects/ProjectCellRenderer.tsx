import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';

export default function ProjectCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  const createProjectLink = () => {
    const projectLocation = {
      pathname: APP_PATHS.PROJECT_VIEW.replace(':projectId', row.id.toString()),
    };
    return (
      <Link fontSize='16px' to={projectLocation.pathname}>
        {row.name}
      </Link>
    );
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createProjectLink()} row={row} />;
  }

  return <CellRenderer {...props} />;
}

import React from 'react';

import { RendererProps, TableRowType } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { APP_PATHS } from 'src/constants';
import { Project } from 'src/types/Project';

export default function FundingEntitiesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, value, row } = props;

  if (column.key === 'projects') {
    const stringList: string[] =
      Array.isArray(value) && value.length ? (value as Project[]).map((project: Project) => project.name) : [];
    return <CellRenderer {...props} value={stringList.join(', ')} style={{ width: '50%' }} />;
  } else if (column.key === 'name') {
    return (
      <CellRenderer
        {...props}
        value={
          <Link
            fontSize='16px'
            to={APP_PATHS.ACCELERATOR_FUNDING_ENTITIES_VIEW.replace(':fundingEntityId', `${row.id}`)}
          >
            {String(value)}
          </Link>
        }
      />
    );
  }

  return <CellRenderer {...props} />;
}

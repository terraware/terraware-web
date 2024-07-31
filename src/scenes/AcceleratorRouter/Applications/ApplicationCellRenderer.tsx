import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { ApplicationStatus } from 'src/types/Application';

import ApplicationStatusBadge from './ApplicationStatusBadge';

const ApplicationCellRenderer = (props: RendererProps<TableRowType>): JSX.Element => {
  const { column, row, value } = props;

  const createLinkToApplication = () => {
    const to = APP_PATHS.ACCELERATOR_APPLICATION.replace(':applicationId', `${row.id}`);
    return (
      <Link fontSize='16px' to={to}>
        {value as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'internalName') {
    return (
      <CellRenderer
        {...props}
        value={createLinkToApplication()}
        sx={{
          fontSize: '16px',
          '& > p': {
            fontSize: '16px',
          },
        }}
        title={value as string}
      />
    );
  }

  if (column.key === 'status') {
    return <CellRenderer {...props} value={<ApplicationStatusBadge status={value as ApplicationStatus} />} row={row} />;
  }

  return <CellRenderer {...props} />;
};

export default ApplicationCellRenderer;

import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
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
        <TextTruncated fontSize={16} width={400} fontWeight={500} stringList={[value as string]} />
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
        title={''}
      />
    );
  }

  if (column.key === 'status') {
    return <CellRenderer {...props} value={<ApplicationStatusBadge status={value as ApplicationStatus} />} row={row} />;
  }

  return <CellRenderer {...props} />;
};

export default ApplicationCellRenderer;

import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { getHighestGlobalRole } from 'src/types/GlobalRoles';

export default function PersonCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const to = APP_PATHS.ACCELERATOR_PERSON.replace(':userId', `${row.id}`);
    return <Link to={to}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'email') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPerson(value)}
        row={row}
        sx={{
          fontSize: '14px',
          '& > p': {
            fontSize: '14px',
          },
        }}
      />
    );
  }

  if (column.key === 'globalRoles') {
    return <CellRenderer index={index} column={column} value={getHighestGlobalRole(row.globalRoles)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

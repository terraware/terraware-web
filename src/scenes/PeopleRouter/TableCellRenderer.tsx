import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { isTfContact } from 'src/utils/organization';

export default function Renderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return (
      <Link fontSize='16px' to={personLocation.pathname}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'email' && !isTfContact(row.role)) {
    return (
      <CellRenderer index={index} column={column} value={createLinkToPerson(value)} row={row} title={value as string} />
    );
  }

  return <CellRenderer {...props} />;
}

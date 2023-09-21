import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import { isTfContact } from 'src/utils/organization';

export default function Renderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return <Link to={personLocation.pathname}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'email' && !isTfContact(row.role)) {
    return <CellRenderer index={index} column={column} value={createLinkToPerson(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

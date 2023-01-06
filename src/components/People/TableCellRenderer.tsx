import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import Link from '../common/Link';

export default function Renderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return <Link to={personLocation.pathname}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'firstName' || column.key === 'lastName') {
    return <CellRenderer index={index} column={column} value={createLinkToPerson(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

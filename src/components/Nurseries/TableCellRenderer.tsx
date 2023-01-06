import React from 'react';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import Link from '../common/Link';

export default function NurseriesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToNursery = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.NURSERIES_VIEW.replace(':nurseryId', row.id.toString())}>{iValue as React.ReactNode}</Link>
    );
  };

  if (column.key === 'name') {
    return <CellRenderer index={index} column={column} value={createLinkToNursery(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

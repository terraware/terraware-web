import React, { type JSX } from 'react';

import { APP_PATHS } from 'src/constants';

import Link from '../../components/common/Link';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';

export default function NurseriesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const createLinkToNursery = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link fontSize='16px' to={APP_PATHS.NURSERIES_VIEW.replace(':nurseryId', row.id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToNursery(value)}
        row={row}
        title={value as string}
      />
    );
  }

  return <CellRenderer {...props} />;
}

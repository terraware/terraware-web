import React, { type JSX } from 'react';

import { getDate } from '@terraware/web-components/utils';

import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

export default function FunderCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, row, index } = props;

  if (column.key === 'name') {
    const name = `${row.firstName ?? ''} ${row.lastName ?? ''}`.trim();
    return <CellRenderer index={index} column={column} value={name} row={row} />;
  } else if (column.key === 'dateAdded') {
    const date = getDate(row.createdTime).toFormat('yyyy-MM-dd');
    const value = row.accountCreated ? `${strings.ADDED} ${date}` : activeLocale ? strings.INVITATION_PENDING : '';
    return <CellRenderer index={index} column={column} value={value} row={row} />;
  } else {
    return <CellRenderer {...props} />;
  }
}

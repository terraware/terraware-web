import React from 'react';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';

export default function DocumentCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  if (column.key === 'link') {
    // TODO convert BE label value to locale specific string
    return (
      <CellRenderer
        index={index}
        column={column}
        // TODO this will be a "BE enum to string converter" once we get the types and enums
        value={
          <Link to={{ pathname: value as string }} target='_blank'>
            {row.documentType === 'google' ? 'Google Drive' : ''}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

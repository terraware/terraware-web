import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import TextTruncated from 'src/components/common/TextTruncated';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { ENDPOINT_DELIVERABLE_DOCUMENT } from 'src/services/DeliverablesService';

export default function DocumentCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index } = props;

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={<TextTruncated fontSize={16} fontWeight={500} width={600} stringList={[row.name]} />}
        row={row}
      />
    );
  }
  if (column.key === 'link' && row.isAllowedRead) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link
            to={ENDPOINT_DELIVERABLE_DOCUMENT.replace('{deliverableId}', row.deliverableId).replace(
              '{documentId}',
              row.id
            )}
            target='_blank'
            fontSize='16px'
          >
            {row.documentStore}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

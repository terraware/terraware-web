import React from 'react';
import { Badge } from '@terraware/web-components';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType, statusLabel } from 'src/types/Deliverables';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export default function DeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, index, value } = props;

  const { activeLocale } = useLocalization();

  if (column.key === 'status') {
    // TODO convert BE label value to locale specific string
    return (
      <CellRenderer
        index={index}
        column={column}
        value={activeLocale ? <Badge label={statusLabel(value as DeliverableStatusType)} /> : ''}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

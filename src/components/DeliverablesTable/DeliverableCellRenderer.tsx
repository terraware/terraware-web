import React from 'react';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType } from 'src/types/Deliverables';

export default function DeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const { column, row, index, value } = props;
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const createLinkToDeliverable = (iValue: React.ReactNode | unknown[]) => {
    const deliverableUrl = isAcceleratorRoute ? APP_PATHS.ACCELERATOR_DELIVERABLE_VIEW : APP_PATHS.DELIVERABLE_VIEW;
    const to = deliverableUrl.replace(':deliverableId', `${row.id}`).replace(':projectId', `${row.projectId}`);
    return (
      <Link fontSize='16px' to={to}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name' && row.isAllowedRead) {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToDeliverable(value)}
        row={row}
        style={{
          maxWidth: '500px',
          textOverflow: 'ellipsis',
        }}
        sx={{
          fontSize: '16px',
          '& > p': {
            fontSize: '16px',
          },
        }}
      />
    );
  }

  if (column.key === 'status') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
        row={row}
      />
    );
  }

  if (column.key === 'module') {
    return <CellRenderer index={index} column={column} value={`${row.moduleTitle} - ${row.moduleName}`} row={row} />;
  }

  return <CellRenderer {...props} />;
}

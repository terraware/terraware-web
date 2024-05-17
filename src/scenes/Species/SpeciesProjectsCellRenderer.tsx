import React from 'react';

import { IconButton } from '@mui/material';

import DeliverableStatusBadge from 'src/components/DeliverableView/DeliverableStatusBadge';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType } from 'src/types/Deliverables';

import Icon from '../../components/common/icon/Icon';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';

export default function SpeciesProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  const { goToDeliverable } = useNavigateTo();
  const { activeLocale } = useLocalization();

  if (column.key === 'deliverableId') {
    if (value) {
      return (
        <CellRenderer
          index={index}
          column={column}
          value={
            <IconButton onClick={() => goToDeliverable(value as number, row.projectId)}>
              <Icon name='iconList' size='medium' />
            </IconButton>
          }
          row={row}
        />
      );
    }
  }

  if (column.key === 'submissionStatus') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={activeLocale ? <DeliverableStatusBadge status={value as DeliverableStatusType} /> : ''}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

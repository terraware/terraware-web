import React from 'react';

import { IconButton } from '@mui/material';

import useNavigateTo from 'src/hooks/useNavigateTo';

import Icon from '../../components/common/icon/Icon';
import CellRenderer, { TableRowType } from '../../components/common/table/TableCellRenderer';
import { RendererProps } from '../../components/common/table/types';

export default function SpeciesProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  const { goToDeliverable } = useNavigateTo();

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

  return <CellRenderer {...props} />;
}

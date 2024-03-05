import React from 'react';

import { makeStyles } from '@mui/styles';
import { Badge } from '@terraware/web-components';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType, statusLabel } from 'src/types/Deliverables';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function DeliverableCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { activeLocale } = useLocalization();
  const classes = useStyles();
  const { column, row, index, value } = props;
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const createLinkToDeliverable = (iValue: React.ReactNode | unknown[]) => {
    const deliverableUrl = isAcceleratorRoute ? APP_PATHS.ACCELERATOR_DELIVERABLES_VIEW : APP_PATHS.DELIVERABLES_VIEW;
    const to = deliverableUrl.replace(':deliverableId', `${row.id}`);
    return <Link to={to}>{iValue as React.ReactNode}</Link>;
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToDeliverable(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'status') {
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

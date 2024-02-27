import React from 'react';
import { makeStyles } from '@mui/styles';
import { Badge } from '@terraware/web-components';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { DeliverableStatusType, statusLabel } from 'src/types/Deliverables';
import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function DeliverableCellRenderer(isAcceleratorConsole?: boolean) {
  const { activeLocale } = useLocalization();
  const classes = useStyles();

  return (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, index, value } = props;

    const createLinkToDeliverable = (iValue: React.ReactNode | unknown[]) => {
      const deliverableUrl = isAcceleratorConsole
        ? APP_PATHS.ACCELERATOR_DELIVERABLES_VIEW
        : APP_PATHS.DELIVERABLES_VIEW;
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
  };
}

import React from 'react';
import { makeStyles } from '@mui/styles';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { APP_PATHS } from 'src/constants';
import Link from '../common/Link';
import { useGetTimeZone } from 'src/utils/useTimeZoneUtils';

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function PlantingSitesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;
  const tz = useGetTimeZone();

  const createLinkToPlantingSiteView = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', row.id.toString())}>
        {iValue as React.ReactNode}
      </Link>
    );
  };

  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToPlantingSiteView(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  if (column.key === 'timeZone') {
    return <CellRenderer index={index} column={column} value={tz.get(value as string).longName} row={row} />;
  }

  return <CellRenderer {...props} className={classes.text} />;
}

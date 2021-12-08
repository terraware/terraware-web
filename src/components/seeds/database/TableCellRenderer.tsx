import { createStyles, makeStyles, TableCell, Typography } from '@material-ui/core';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import React from 'react';
import CellRenderer from '../../common/table/TableCellRenderer';
import { RendererProps } from '../../common/table/types';
import { SearchResponseElement } from '../../../api/seeds/search';

const statusStyles = makeStyles((theme) =>
  createStyles({
    flex: {
      display: 'flex',
      alignItems: 'center',
    },
    statusIndicator: {
      fontSize: theme.typography.overline.fontSize,
    },
    inactive: {
      display: 'flex',
      alignItems: 'center',
      color: theme.palette.neutral[600],
    },
  })
);

export default function SearchCellRenderer(props: RendererProps<SearchResponseElement>): JSX.Element {
  const { column, value, index, row } = props;

  const id = `row${index}-${column.key}`;
  if (column.key === 'active' && typeof value === 'string' && value) {
    const classes = statusStyles();
    const active = value === 'Active';

    return (
      <TableCell id={id} align='left'>
        <div className={classes.flex}>
          <FiberManualRecord color={active ? 'primary' : 'disabled'} className={classes.statusIndicator} />
          <Typography classes={{ root: active ? undefined : classes.inactive }}>{value}</Typography>
        </div>
      </TableCell>
    );
  }

  if (column.key === 'remainingQuantity' && value) {
    const units = row.remainingUnits;

    return <CellRenderer index={index} column={column} value={`${value} ${units}`} row={row} />;
  }

  if (column.key === 'totalQuantity' && value) {
    const units = row.totalUnits;

    return <CellRenderer index={index} column={column} value={`${value} ${units}`} row={row} />;
  }

  if (column.key === 'withdrawalQuantity' && value) {
    const units = row.withdrawalUnits;

    return <CellRenderer index={index} column={column} value={`${value} ${units}`} row={row} />;
  }

  return <CellRenderer {...props} />;
}

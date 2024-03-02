import React from 'react';

import { FiberManualRecord } from '@mui/icons-material';
import { TableCell, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

import Link from 'src/components/common/Link';
import CellRenderer from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { SearchResponseElement } from 'src/types/Search';

import { RIGHT_ALIGNED_COLUMNS } from './columns';

const statusStyles = makeStyles((theme: Theme) => ({
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
  rightAligned: {
    textAlign: 'right',
  },
}));

export default function SearchCellRenderer(props: RendererProps<SearchResponseElement>): JSX.Element {
  const { column, value, index, row } = props;
  const classes = statusStyles();

  const id = `row${index}-${column.key}`;
  if (column.key === 'active' && typeof value === 'string' && value) {
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

  if (column.key === 'accessionNumber') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={<Link to={APP_PATHS.ACCESSIONS2_ITEM.replace(':accessionId', `${row.id}`)}>{`${value}`}</Link>}
        row={row}
      />
    );
  }

  const numberCell = (units: unknown) => (
    <CellRenderer index={index} column={column} value={`${value} ${units}`} row={row} />
  );

  if (column.key === 'remainingQuantity' && value) {
    return numberCell(row.remainingUnits);
  }

  if (column.key === 'totalQuantity' && value) {
    return numberCell(row.totalUnits);
  }

  if (column.key === 'withdrawalQuantity' && value) {
    return numberCell(row.withdrawalUnits);
  }

  if (
    (column.key === 'species_endangered' || column.key === 'species_rare') &&
    (value === 'false' || value === 'true')
  ) {
    return <CellRenderer index={index} column={column} value={`${value === 'true' ? 'Yes' : 'No'}`} row={row} />;
  }

  if (column.key === 'totalViabilityPercent' && value !== undefined) {
    return (
      <CellRenderer index={index} column={column} value={`${value}%`} row={row} className={classes.rightAligned} />
    );
  }

  const className = RIGHT_ALIGNED_COLUMNS.indexOf(column.key) !== -1 ? classes.rightAligned : '';

  return <CellRenderer {...props} className={className} />;
}

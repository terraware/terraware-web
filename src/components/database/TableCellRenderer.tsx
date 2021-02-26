import {
  createStyles,
  makeStyles,
  TableCell,
  Typography,
} from '@material-ui/core';
import FiberManualRecord from '@material-ui/icons/FiberManualRecord';
import React from 'react';
import { AccessionState } from '../../api/types/accessions';
import { SearchResponseResults } from '../../api/types/search';
import StateChip from '../common/StateChip';
import CellRenderer from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

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
      color: theme.palette.grey[600],
    },
  })
);

export default function SearchCellRenderer(
  props: RendererProps<SearchResponseResults>
): JSX.Element {
  const { column, value, index } = props;

  const id = `row${index}-${column.key}`;
  if (column.key === 'active' && typeof value === 'string' && value) {
    const classes = statusStyles();
    const active = value === 'Active';

    return (
      <TableCell id={id} align='left'>
        <div className={classes.flex}>
          <FiberManualRecord
            color={active ? 'primary' : 'disabled'}
            className={classes.statusIndicator}
          />
          <Typography classes={{ root: active ? undefined : classes.inactive }}>
            {value}
          </Typography>
        </div>
      </TableCell>
    );
  } else if (column.key === 'state' && typeof value === 'string' && value) {
    return (
      <TableCell id={id} align='left'>
        <StateChip state={value as AccessionState} />
      </TableCell>
    );
  }

  return <CellRenderer {...props} />;
}

import React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';
import Link from 'src/components/common/Link';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrBaseGreen500,
    fontWeight: 600,
    textDecoration: 'none',
  },
}));

export default function WithdrawalRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();

  const { column, row, value, index } = props;

  if (column.key === 'batchNumber' && typeof value === 'string') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link
            to={APP_PATHS.INVENTORY_BATCH_FOR_SPECIES.replace(':speciesId', row.speciesId).replace(
              ':batchId',
              row.batchId
            )}
            className={classes.link}
          >
            {value}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

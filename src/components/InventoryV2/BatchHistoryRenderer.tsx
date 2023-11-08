import React from 'react';
import { makeStyles } from '@mui/styles';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { Link, Theme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrBaseGreen500,
    fontWeight: 600,
    textDecoration: 'none',
  },
  text: {
    fontSize: '14px',
  },
}));

export default function BatchHistoryRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();

  const { column, row, value, index, onRowClick } = props;

  const rowClick = (event?: React.SyntheticEvent) => {
    if (onRowClick) {
      onRowClick();
    }
  };

  if (column.key === 'createdTime' && onRowClick && typeof value === 'string') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={
          <Link onClick={rowClick} className={classes.link}>
            {getDateDisplayValue(value)}
          </Link>
        }
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

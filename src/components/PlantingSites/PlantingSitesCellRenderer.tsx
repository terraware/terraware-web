import React from 'react';
import { makeStyles } from '@mui/styles';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

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

  return <CellRenderer {...props} className={classes.text} />;
}

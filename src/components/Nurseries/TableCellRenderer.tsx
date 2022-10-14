import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
}));

export default function NurseriesCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;

  const createLinkToNursery = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.NURSERIES_VIEW.replace(':nurseryId', row.id.toString())} className={classes.link}>
        {iValue}
      </Link>
    );
  };

  if (column.key === 'name') {
    console.log(createLinkToNursery(value));
    return <CellRenderer index={index} column={column} value={createLinkToNursery(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

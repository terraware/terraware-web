import React from 'react';
import { makeStyles } from '@mui/styles';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
}));

export default function ProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;

  if (column.key === 'projectNames' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={value.join(', ')} row={row} />;
  }

  const createLinkToPerson = (iValue: React.ReactNode | unknown[]) => {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return (
      <Link to={personLocation.pathname} className={classes.link}>
        {iValue}
      </Link>
    );
  };

  if (column.key === 'firstName') {
    return <CellRenderer index={index} column={column} value={createLinkToPerson(value)} row={row} />;
  }

  if (column.key === 'lastName') {
    return <CellRenderer index={index} column={column} value={createLinkToPerson(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

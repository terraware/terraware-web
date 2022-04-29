import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function ProjectsCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;
  if (column.key === 'projectNames' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={value.join(', ')} row={row} />;
  }

  if (column.key === 'firstName') {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return (
      <CellRenderer index={index} column={column} value={<Link to={personLocation.pathname}>{value}</Link>} row={row} />
    );
  }

  if (column.key === 'lastName') {
    const personLocation = {
      pathname: APP_PATHS.PEOPLE_VIEW.replace(':personId', row.id.toString()),
    };
    return (
      <CellRenderer index={index} column={column} value={<Link to={personLocation.pathname}>{value}</Link>} row={row} />
    );
  }

  return <CellRenderer {...props} />;
}

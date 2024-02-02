import React from 'react';
import { makeStyles } from '@mui/styles';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';

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

  return <CellRenderer {...props} className={classes.text} />;
}

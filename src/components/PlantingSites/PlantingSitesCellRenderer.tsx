import React from 'react';
import { makeStyles } from '@mui/styles';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useTheme } from '@mui/material';

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
  const theme = useTheme();
  const { column, row, value, index } = props;

  const createLinkToPlantingSiteView = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        to={APP_PATHS.PLANTING_SITES_VIEW.replace(':plantingSiteId', row.id.toString())}
        style={{ color: theme.palette.TwClrTxtBrand }}
        className={classes.text}
      >
        {iValue}
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

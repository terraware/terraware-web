import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useTheme } from '@mui/material';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { TextTruncated } from '@terraware/web-components';

const COLUMN_WIDTH = 250;

const useStyles = makeStyles(() => ({
  text: {
    fontSize: '14px',
    '& > p': {
      fontSize: '14px',
    },
  },
}));

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const theme = useTheme();
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: string) => {
    const nurseriesArray = nurseries.split('\r');
    return (
      <TextTruncated
        stringList={nurseriesArray}
        maxLengthPx={COLUMN_WIDTH}
        textStyle={{ fontSize: 14 }}
        showAllStyle={{ padding: theme.spacing(2), fontSize: 16 }}
      />
    );
  };

  const createLinkToInventoryDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link
        to={APP_PATHS.INVENTORY_ITEM.replace(':speciesId', row.species_id.toString())}
        style={{ color: theme.palette.TwClrTxtBrand }}
        className={classes.text}
      >
        {iValue}
      </Link>
    );
  };

  if (column.key === 'facilityInventories' && typeof value === 'string') {
    return (
      <CellRenderer index={index} column={column} value={getNurseriesNames(value)} row={row} className={classes.text} />
    );
  }

  if (column.key === 'species_scientificName') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={createLinkToInventoryDetail(value)}
        row={row}
        className={classes.text}
      />
    );
  }

  return <CellRenderer {...props} className={classes.text} />;
}

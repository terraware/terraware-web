import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { Theme } from '@mui/material';
import { TextTruncated } from '@terraware/web-components';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.TwClrTxtBrand,
  },
}));

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: any[]) => {
    return (
      <TextTruncated
        stringList={nurseries.map((n) => n.facility_name)}
        maxLengthPx={250}
        textStyle={{ fontSize: 14 }}
        showAllStyle={{ padding: '17px', fontSize: 16 }}
      />
    );
  };

  const createLinkToInventoryDetail = (iValue: React.ReactNode | unknown[]) => {
    return (
      <Link to={APP_PATHS.INVENTORY_ITEM.replace(':speciesId', row.species_id.toString())} className={classes.link}>
        {iValue}
      </Link>
    );
  };

  if (column.key === 'facilityInventories' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={getNurseriesNames(value)} row={row} />;
  }

  if (column.key === 'species_scientificName') {
    return <CellRenderer index={index} column={column} value={createLinkToInventoryDetail(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

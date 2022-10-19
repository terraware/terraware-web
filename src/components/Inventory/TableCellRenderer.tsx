import { makeStyles } from '@mui/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

const useStyles = makeStyles(() => ({
  link: {
    color: '#0067C8',
  },
}));

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const classes = useStyles();
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: any[]) => {
    let nurseriesNames = '';
    nurseries.forEach((n) => {
      nurseriesNames += n.facility_name;
    });
    return nurseriesNames;
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

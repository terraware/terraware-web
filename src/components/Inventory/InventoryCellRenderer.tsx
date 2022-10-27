import React from 'react';
import { Link } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';
import { useTheme } from '@mui/material';
import { TextTruncated } from '@terraware/web-components';

const COLUMN_WIDTH = 250;

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const theme = useTheme();
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: any[]) => {
    return (
      <TextTruncated
        stringList={nurseries.map((n) => n.facility_name)}
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
      >
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

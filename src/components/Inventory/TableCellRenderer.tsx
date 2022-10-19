import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from '../common/table/types';

export default function InventoryCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const { column, row, value, index } = props;

  const getNurseriesNames = (nurseries: any[]) => {
    let nurseriesNames = '';
    nurseries.forEach((n) => {
      nurseriesNames += n.facility_name;
    });
    return nurseriesNames;
  };

  if (column.key === 'facilityInventories' && Array.isArray(value)) {
    return <CellRenderer index={index} column={column} value={getNurseriesNames(value)} row={row} />;
  }

  return <CellRenderer {...props} />;
}

import React from 'react';
import CellRenderer from '../../common/table/TableCellRenderer';
import { RendererProps } from '../../common/table/types';
import { SpeciesMap } from './PlantMap';

export default function GeolocationCellRenderer(
  props: RendererProps<SpeciesMap>
): JSX.Element {
  const { column, row, index } = props;
  if (column.key === 'name') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.properties.NAME}
        row={row}
      />
    );
  }
  if (column.key === 'location') {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={`${row.geometry.coordinates[0]},${row.geometry.coordinates[1]}`}
        row={row}
      />
    );
  }

  return <CellRenderer {...props} />;
}

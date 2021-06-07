import React from "react";
import CellRenderer from "../common/table/TableCellRenderer";
import { RendererProps } from "../common/table/types";
import { SpecieMap } from "../Map";

export default function GeolocationCellRenderer(
  props: RendererProps<SpecieMap>
): JSX.Element {
  const { column, value, row, index } = props;
  if (column.key === "name") {
    return (
      <CellRenderer
        index={index}
        column={column}
        value={row.properties.NAME}
        row={row}
      />
    );
  }
  if (column.key === "location") {
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

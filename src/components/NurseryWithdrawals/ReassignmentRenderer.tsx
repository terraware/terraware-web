import React from 'react';
import CellRenderer, { TableRowType } from '../common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';

export type PlotInfo = {
  id: string;
  fullName: string;
};

export type PlotsMap = {
  [zoneId: string]: PlotInfo[];
};

export type PlotZoneInfo = {
  id: string;
  name: string;
  plotName: string;
};

export type ZonesMap = {
  [plotId: string]: PlotZoneInfo;
};

export type ReassignmentRendererProps = {
  plots: PlotsMap;
  zones: ZonesMap;
};

export default function ReassignmentRenderer({ plots, zones }: ReassignmentRendererProps) {
  return function ReassignmentlCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
    return <CellRenderer {...props} />;
  };
}

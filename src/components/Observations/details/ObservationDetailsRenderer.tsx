import React from 'react';
import { APP_PATHS } from 'src/constants';
import { MonitoringPlotStatus, getPlotStatus } from 'src/types/Observations';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';

const ObservationDetailsRenderer =
  (plantingSiteId: number, observationId: number) =>
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToPlantingZoneObservation = (name: string) => {
      const url = APP_PATHS.OBSERVATION_PLANTING_ZONE_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':observationId', observationId.toString())
        .replace(':plantingZoneId', row.plantingZoneId.toString());
      return <Link to={url}>{name as React.ReactNode}</Link>;
    };

    if (column.key === 'plantingZoneName') {
      return <CellRenderer {...props} value={createLinkToPlantingZoneObservation(value as string)} />;
    }

    if (column.key === 'mortalityRate') {
      return <CellRenderer {...props} value={`${value}%`} />;
    }

    if (column.key === 'status') {
      return <CellRenderer {...props} value={getPlotStatus(value as MonitoringPlotStatus)} />;
    }

    return <CellRenderer {...props} />;
  };

export default ObservationDetailsRenderer;

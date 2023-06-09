import React from 'react';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';

const ObservationPlantingZoneRenderer =
  (plantingSiteId: number, observationId: number, plantingZoneId: number) =>
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToMonitoringPlotObservation = (name: string) => {
      const url = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':observationId', observationId.toString())
        .replace(':plantingZoneId', plantingZoneId.toString())
        .replace(':monitoringPlotId', row.monitoringPlotId.toString());
      return <Link to={url}>{name as React.ReactNode}</Link>;
    };

    if (column.key === 'monitoringPlotName') {
      return <CellRenderer {...props} value={createLinkToMonitoringPlotObservation(value as string)} />;
    }

    if (column.key === 'mortalityRate') {
      return <CellRenderer {...props} value={`${value}%`} />;
    }

    if (column.key === 'isPermanent') {
      return <CellRenderer {...props} value={value === true ? strings.PERMANENT : strings.TEMPORARY} />;
    }

    return <CellRenderer {...props} />;
  };

export default ObservationPlantingZoneRenderer;

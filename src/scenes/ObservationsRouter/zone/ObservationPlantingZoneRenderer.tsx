import React from 'react';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { MonitoringPlotStatus, getPlotStatus, ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import Link from 'src/components/common/Link';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';

const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies', 'mortalityRate', 'plantingDensity'];

const ObservationPlantingZoneRenderer =
  (
    plantingSiteId: number,
    observationId: number,
    plantingZoneId: number,
    setReplaceObservationPlot: React.Dispatch<React.SetStateAction<ObservationMonitoringPlotResultsPayload | undefined>>
  ) =>
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToMonitoringPlotObservation = (name: string) => {
      const url = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':observationId', observationId.toString())
        .replace(':plantingZoneId', plantingZoneId.toString())
        .replace(':monitoringPlotId', row.monitoringPlotId.toString());
      return <Link to={url}>{name as React.ReactNode}</Link>;
    };

    // don't render data if we don't have data
    if (!row.completedTime && value === 0 && NO_DATA_FIELDS.indexOf(column.key) !== -1) {
      return <CellRenderer {...props} value={''} />;
    }

    if (column.key === 'monitoringPlotName') {
      return <CellRenderer {...props} value={createLinkToMonitoringPlotObservation(value as string)} />;
    }

    if (column.key === 'mortalityRate') {
      return (
        <CellRenderer
          {...props}
          value={value !== undefined && value !== null && row.hasObservedPermanentPlots ? `${value}%` : ''}
        />
      );
    }

    if (column.key === 'status') {
      return <CellRenderer {...props} value={getPlotStatus(value as MonitoringPlotStatus)} />;
    }

    if (column.key === 'isPermanent') {
      return <CellRenderer {...props} value={value === true ? strings.PERMANENT : strings.TEMPORARY} />;
    }

    if (column.key === 'actionsMenu') {
      const tableMenuItem = (
        <TableRowPopupMenu
          menuItems={[
            {
              disabled: row.completedTime, // cannot replace observation plots that are completed
              label: strings.REQUEST_REASSIGNMENT,
              onClick: () => {
                setReplaceObservationPlot(row as ObservationMonitoringPlotResultsPayload);
              },
            },
          ]}
        />
      );

      return <CellRenderer {...props} value={tableMenuItem} />;
    }

    return <CellRenderer {...props} />;
  };

export default ObservationPlantingZoneRenderer;

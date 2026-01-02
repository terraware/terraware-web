import React from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import {
  MonitoringPlotStatus,
  ObservationMonitoringPlotResultsPayload,
  ObservationState,
  getPlotStatus,
} from 'src/types/Observations';

const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies', 'plantingDensity'];

const ObservationStratumRenderer =
  (
    plantingSiteId: number,
    observationId: number,
    stratumName: string,
    setReplaceObservationPlot: React.Dispatch<
      React.SetStateAction<ObservationMonitoringPlotResultsPayload | undefined>
    >,
    observationState?: ObservationState
  ) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToMonitoringPlotObservation = (name: string) => {
      const url = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':observationId', observationId.toString())
        .replace(':stratumName', encodeURIComponent(stratumName))
        .replace(':monitoringPlotId', row.monitoringPlotId.toString());
      return (
        <Link fontSize='16px' to={url}>
          {name as React.ReactNode}
          {row.sizeMeters.toString() === '25' ? '*' : ''}
        </Link>
      );
    };

    // don't render data if we don't have data
    if (!row.completedTime && value === 0 && NO_DATA_FIELDS.indexOf(column.key) !== -1) {
      return <CellRenderer {...props} value={''} />;
    }

    if (column.key === 'monitoringPlotNumber') {
      return (
        <CellRenderer
          {...props}
          value={createLinkToMonitoringPlotObservation(value as string)}
          title={value as string}
        />
      );
    }

    if (column.key === 'survivalRate') {
      return <CellRenderer {...props} value={value !== undefined && value !== null ? `${value as number}%` : ''} />;
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
              disabled: row.completedTime || observationState === 'Abandoned', // cannot replace observation plots that are completed
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

export default ObservationStratumRenderer;

import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import TableRowPopupMenu from 'src/components/common/table/TableRowPopupMenu';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { useReassignPlotModal } from 'src/scenes/ObservationsRouterV2/Reassign';
import { MonitoringPlotStatus, ObservationState, getPlotStatus } from 'src/types/Observations';
import { isManagerOrHigher } from 'src/utils/organization';

export default function MonitoringPlotCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies'];
  const { column, row, value } = props;
  const { strings } = useLocalization();
  const { openReassignPlotModal } = useReassignPlotModal();
  const { selectedOrganization } = useOrganization();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);
  const observationId = row.observationId as number;
  const observationState = row.observationState as ObservationState;
  const stratumName = row.stratumName as string;
  const monitoringPlotId = row.monitoringPlotId as number;

  const textStyles = {
    fontSize: '16px',
    '& > p': {
      fontSize: '16px',
    },
  };

  if (column.key === 'monitoringPlotNumber') {
    const url = APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS_V2.replace(':observationId', observationId.toString())
      .replace(':stratumName', stratumName)
      .replace(':monitoringPlotId', monitoringPlotId.toString());
    return (
      <CellRenderer
        {...props}
        value={
          <Link fontSize='16px' to={url}>
            {value as string}
          </Link>
        }
      />
    );
  }

  // don't render data if we don't have data
  if (!row.completedDate && value === 0 && NO_DATA_FIELDS.indexOf(column.key) !== -1) {
    return <CellRenderer {...props} value={''} />;
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
    const menu = (
      <TableRowPopupMenu
        menuItems={[
          {
            disabled: !replaceObservationPlotEnabled || row.completedDate || observationState === 'Abandoned', // cannot replace observation plots that are completed
            label: strings.REQUEST_REASSIGNMENT,
            onClick: () => {
              openReassignPlotModal(observationId, monitoringPlotId);
            },
          },
        ]}
      />
    );

    return <CellRenderer {...props} value={menu} />;
  }

  return <CellRenderer {...props} sx={textStyles} />;
}

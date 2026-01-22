import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { has25mPlots } from 'src/redux/features/observations/utils';
import { MonitoringPlotStatus, getPlotStatus } from 'src/types/Observations';

const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies'];

const ObservationDetailsRenderer =
  (plantingSiteId: number, observationId: number) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const createLinkToStratumObservation = (name: string) => {
      const url = APP_PATHS.OBSERVATION_STRATUM_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':observationId', observationId.toString())
        .replace(':stratumName', encodeURIComponent(row.stratumName));
      return (
        <Link fontSize='16px' to={url}>
          {name as React.ReactNode}
          {has25mPlots(row.substrata) ? '*' : ''}
        </Link>
      );
    };

    // don't render data if we don't have data
    if (!row.completedTime && value === 0 && NO_DATA_FIELDS.indexOf(column.key) !== -1) {
      return <CellRenderer {...props} value={''} />;
    }

    if (column.key === 'stratumName') {
      return (
        <CellRenderer {...props} value={createLinkToStratumObservation(value as string)} title={value as string} />
      );
    }

    if (column.key === 'survivalRate') {
      return <CellRenderer {...props} value={value !== undefined && value !== null ? `${value as number}%` : ''} />;
    }

    if (column.key === 'status') {
      return <CellRenderer {...props} value={getPlotStatus(value as MonitoringPlotStatus)} />;
    }

    return <CellRenderer {...props} />;
  };

export default ObservationDetailsRenderer;

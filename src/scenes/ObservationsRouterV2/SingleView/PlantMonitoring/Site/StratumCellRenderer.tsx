import React, { type JSX } from 'react';

import Link from 'src/components/common/Link';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { MonitoringPlotStatus, getPlotStatus } from 'src/types/Observations';

export default function StratumCellRenderer(props: RendererProps<TableRowType>): JSX.Element {
  const NO_DATA_FIELDS = ['totalPlants', 'totalSpecies'];
  const { column, row, value } = props;
  const observationId = row.observationId as number;
  const stratumName = row.stratumName as string;
  if (column.key === 'stratumName') {
    const url = APP_PATHS.OBSERVATION_STRATUM_DETAILS_V2.replace(':observationId', observationId.toString()).replace(
      ':stratumName',
      stratumName
    );
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

  return <CellRenderer {...props} />;
}

import React from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { MinimalPlantingSite, MinimalSubstratum } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

/**
 * Planting site list view
 */

type PlantingSiteDetailsTableProps = {
  plantingSite: MinimalPlantingSite;
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.STRATA,
    type: 'string',
  },
  {
    key: 'targetPlantingDensity',
    name: strings.TARGET_PLANTING_DENSITY,
    tooltipTitle: strings.TARGET_PLANTING_DENSITY_TOOLTIP,
    type: 'number',
  },
  {
    key: 'plantingCompleted',
    name: strings.PLANTING_COMPLETE,
    tooltipTitle: strings.PLANTING_COMPLETE_TOOLTIP,
    type: 'boolean',
  },
  {
    key: 'areaHa',
    name: strings.AREA_HA,
    type: 'number',
  },
  {
    key: 'substrata',
    name: strings.SUBSTRATA,
    type: 'number',
  },
  {
    key: 'latestObservationCompletedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export default function PlantingSiteDetailsTable({ plantingSite }: PlantingSiteDetailsTableProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  return (
    <Box>
      <Table
        id='planting-site-details-table'
        columns={columns}
        rows={plantingSite.strata ?? []}
        orderBy='name'
        Renderer={DetailsRenderer(timeZone, plantingSite.id)}
      />
    </Box>
  );
}

const DetailsRenderer =
  (timeZone: string, plantingSiteId: number) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToStratum = () => {
      const url = APP_PATHS.PLANTING_SITES_STRATUM_VIEW.replace(':plantingSiteId', plantingSiteId.toString()).replace(
        ':stratumId',
        row.id.toString()
      );
      return (
        <Link fontSize='16px' to={url}>
          {(row.name || '--') as React.ReactNode}
        </Link>
      );
    };

    const createLinkToPlot = (iValue: React.ReactNode | unknown[]) => {
      const adHocObservationUrl = APP_PATHS.OBSERVATION_AD_HOC_PLOT_DETAILS;

      const to = adHocObservationUrl
        .replace(':monitoringPlotId', row.adHocPlot?.monitoringPlotId?.toString())
        .replace(':observationId', row.observationId?.toString())
        .replace(':plantingSiteId', row.plantingSiteId?.toString());

      return (
        <Link fontSize='16px' to={to}>
          {iValue as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'name') {
      return <CellRenderer {...props} value={createLinkToStratum()} sx={textStyles} title={value as string} />;
    }

    if (column.key === 'latestObservationCompletedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    if (column.key === 'areaHa') {
      return <CellRenderer {...props} value={value || ''} sx={textStyles} />;
    }

    if (column.key === 'substrata') {
      return <CellRenderer {...props} value={row.substrata.length} sx={textStyles} />;
    }

    if (column.key === 'plotNumber') {
      return (
        <CellRenderer
          {...props}
          column={column}
          value={createLinkToPlot(row.plotNumber)}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'plantingCompleted') {
      const isPlantingCompleted = row.substrata.every((psz: MinimalSubstratum) => psz.plantingCompleted);
      return (
        <CellRenderer
          {...props}
          column={column}
          value={isPlantingCompleted}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'observationDate') {
      return (
        <CellRenderer
          {...props}
          column={column}
          value={row.completedTime ? getDateDisplayValue(row.completedTime, timeZone) : row.startDate}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'totalPlants') {
      return (
        <CellRenderer
          {...props}
          column={column}
          value={row.adHocPlot?.totalPlants}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'totalSpecies') {
      return (
        <CellRenderer
          {...props}
          column={column}
          value={row.adHocPlot?.totalSpecies}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    return <CellRenderer {...props} />;
  };

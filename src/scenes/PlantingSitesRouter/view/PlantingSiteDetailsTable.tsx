import React from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import strings from 'src/strings';
import { SubzoneAggregation, ZoneAggregation } from 'src/types/Observations';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

/**
 * Planting site list view
 */

type PlantingSiteDetailsTableProps = {
  data: ZoneAggregation[];
  plantingSite: MinimalPlantingSite;
  zoneViewUrl: string;
};

const columns = (): TableColumnType[] => [
  {
    key: 'name',
    name: strings.ZONES,
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
    key: 'plantingSubzones',
    name: strings.SUBZONES,
    type: 'number',
  },
  {
    key: 'monitoringPlots',
    name: strings.MONITORING_PLOTS,
    type: 'number',
  },
  {
    key: 'completedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

export default function PlantingSiteDetailsTable({
  data,
  plantingSite,
  zoneViewUrl,
}: PlantingSiteDetailsTableProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();

  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  return (
    <Box>
      <Table
        id='planting-site-details-table'
        columns={columns}
        rows={data}
        orderBy='name'
        Renderer={DetailsRenderer(timeZone, plantingSite.id, zoneViewUrl)}
      />
    </Box>
  );
}

const DetailsRenderer =
  (timeZone: string, plantingSiteId: number, zoneViewUrl: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToZone = () => {
      const url = zoneViewUrl
        .replace(':plantingSiteId', plantingSiteId.toString())
        .replace(':zoneId', row.id.toString());
      return (
        <Link fontSize='16px' to={url}>
          {(row.name || '--') as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'name') {
      return <CellRenderer {...props} value={createLinkToZone()} sx={textStyles} />;
    }

    if (column.key === 'completedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    if (column.key === 'monitoringPlots') {
      const numMonitoringPlots = row.plantingSubzones.flatMap((sz: SubzoneAggregation) => sz.monitoringPlots).length;
      return <CellRenderer {...props} value={numMonitoringPlots > 0 ? numMonitoringPlots : ''} sx={textStyles} />;
    }

    if (column.key === 'plantingSubzones') {
      return <CellRenderer {...props} value={row.plantingSubzones.length} sx={textStyles} />;
    }

    return <CellRenderer {...props} />;
  };

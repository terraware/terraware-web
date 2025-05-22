import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import getDateDisplayValue from '@terraware/web-components/utils/date';

import Link from 'src/components/common/Link';
import Table from 'src/components/common/table';
import CellRenderer, { TableRowType } from 'src/components/common/table/TableCellRenderer';
import { RendererProps } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { PlotSelectionType } from 'src/scenes/ObservationsRouter/PlantMonitoring';
import { ObservationType } from 'src/scenes/PlantingSitesRouter/view/BoundariesAndZones';
import strings from 'src/strings';
import { ExistingTreePayload } from 'src/types/Observations';
import { MinimalPlantingSite } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

/**
 * Planting site list view
 */

type PlantingSiteDetailsTableProps = {
  plantingSite: MinimalPlantingSite;
  plotSelection: PlotSelectionType;
  observationType: ObservationType;
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
    key: 'areaHa',
    name: strings.AREA_HA,
    type: 'number',
  },
  {
    key: 'plantingSubzones',
    name: strings.SUBZONES,
    type: 'number',
  },
  {
    key: 'numPermanentPlots',
    name: strings.MONITORING_PLOTS,
    type: 'number',
  },
  {
    key: 'latestObservationCompletedTime',
    name: strings.LAST_OBSERVED,
    type: 'string',
  },
];

const adHocColumns = (): TableColumnType[] => [
  {
    key: 'plotNumber',
    name: strings.PLOT,
    type: 'string',
  },
  {
    key: 'observationDate',
    name: strings.DATE,
    type: 'string',
  },
  {
    key: 'totalPlants',
    name: strings.PLANTS,
    type: 'number',
  },
  {
    key: 'totalSpecies',
    name: strings.SPECIES,
    type: 'number',
  },
];

const biomassColumns = (): TableColumnType[] => [
  {
    key: 'monitoringPlotNumber',
    name: strings.PLOT,
    type: 'string',
  },
  {
    key: 'trees',
    name: strings.TREES_TRUNKS,
    type: 'number',
  },
  {
    key: 'shrubs',
    name: strings.SHRUBS,
    type: 'number',
  },
  {
    key: 'totalSpecies',
    name: strings.SPECIES,
    type: 'number',
  },
  {
    key: 'observationDate',
    name: strings.OBSERVED_DATE,
    type: 'string',
  },
];

export default function PlantingSiteDetailsTable({
  plantingSite,
  plotSelection,
  observationType,
}: PlantingSiteDetailsTableProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = plantingSite.timeZone ?? defaultTimeZone.get().id;

  const { adHocObservationResults } = usePlantingSiteData();

  const monitoringAdHocResults = useMemo(() => {
    return adHocObservationResults?.filter((result) => result.isAdHoc && result.type === 'Monitoring');
  }, [adHocObservationResults]);

  const biomassAdHocResults = useMemo(() => {
    return adHocObservationResults?.filter((result) => result.isAdHoc && result.type === 'Biomass Measurements');
  }, [adHocObservationResults]);

  return (
    <Box>
      {plotSelection === 'assigned' && observationType === 'plantMonitoring' && (
        <Table
          id='planting-site-details-table'
          columns={columns}
          rows={plantingSite.plantingZones ?? []}
          orderBy='name'
          Renderer={DetailsRenderer(timeZone, plantingSite.id)}
        />
      )}
      {plotSelection === 'adHoc' && observationType === 'plantMonitoring' && (
        <Table
          id='planting-site-ad-hoc-details-table'
          columns={adHocColumns}
          rows={monitoringAdHocResults ?? []}
          orderBy='name'
          Renderer={DetailsRenderer(timeZone, plantingSite.id)}
        />
      )}
      {plotSelection === 'adHoc' && observationType === 'biomassMeasurements' && (
        <Table
          id='planting-site-ad-hoc-details-table'
          columns={biomassColumns}
          rows={biomassAdHocResults ?? []}
          orderBy='name'
          Renderer={BiomassRenderer(timeZone)}
        />
      )}
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

    const createLinkToZone = () => {
      const url = APP_PATHS.PLANTING_SITES_ZONE_VIEW.replace(':plantingSiteId', plantingSiteId.toString()).replace(
        ':zoneId',
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
      return <CellRenderer {...props} value={createLinkToZone()} sx={textStyles} title={value as string} />;
    }

    if (column.key === 'latestObservationCompletedTime') {
      return (
        <CellRenderer {...props} value={value ? getDateDisplayValue(value as string, timeZone) : ''} sx={textStyles} />
      );
    }

    if (column.key === 'areaHa') {
      return <CellRenderer {...props} value={value || ''} sx={textStyles} />;
    }

    if (column.key === 'plantingSubzones') {
      return <CellRenderer {...props} value={row.plantingSubzones.length} sx={textStyles} />;
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

const BiomassRenderer =
  (timeZone: string) =>
  // eslint-disable-next-line react/display-name
  (props: RendererProps<TableRowType>): JSX.Element => {
    const { column, row, value } = props;

    const textStyles = {
      fontSize: '16px',
      '& > p': {
        fontSize: '16px',
      },
    };

    const createLinkToPlot = (iValue: React.ReactNode | unknown[]) => {
      const biomassPlotUrl = APP_PATHS.OBSERVATION_BIOMASS_MEASUREMENTS_DETAILS;

      const to = biomassPlotUrl
        .replace(':monitoringPlotId', row.adHocPlot?.monitoringPlotId?.toString())
        .replace(':observationId', row.observationId?.toString())
        .replace(':plantingSiteId', row.plantingSiteId?.toString());

      return (
        <Link fontSize='16px' to={to}>
          {iValue as React.ReactNode}
        </Link>
      );
    };

    if (column.key === 'monitoringPlotNumber') {
      return (
        <CellRenderer
          {...props}
          column={column}
          value={createLinkToPlot(row.adHocPlot.monitoringPlotNumber)}
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
          value={row.biomassMeasurements?.species?.length}
          row={row}
          sx={textStyles}
          title={value as string}
        />
      );
    }

    if (column.key === 'trees') {
      return (
        <CellRenderer
          {...props}
          value={
            row.biomassMeasurements.trees.filter((tree: ExistingTreePayload) => tree.treeGrowthForm !== 'Shrub').length
          }
          sx={textStyles}
        />
      );
    }

    if (column.key === 'shrubs') {
      return (
        <CellRenderer
          {...props}
          value={
            row.biomassMeasurements.trees.filter((tree: ExistingTreePayload) => tree.treeGrowthForm === 'Shrub').length
          }
          sx={textStyles}
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

    return <CellRenderer {...props} />;
  };

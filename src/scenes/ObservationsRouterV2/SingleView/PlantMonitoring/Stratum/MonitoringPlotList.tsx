import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { TableColumnType } from '@terraware/web-components';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { MonitoringPlotStatus, ObservationState } from 'src/types/Observations';
import { SearchSortOrder } from 'src/types/Search';
import { isManagerOrHigher } from 'src/utils/organization';

import MonitoringPlotRenderer from './MonitoringPlotRenderer';

type MonitoringPlotRow = {
  observationId: number;
  observationState: ObservationState;
  monitoringPlotId: number;
  monitoringPlotNumber: number;
  stratumName: string;
  substratumName: string;
  completedDate?: string;
  status: MonitoringPlotStatus;
  isPermanent?: boolean;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
};

export default function MonitoringPlotList(): JSX.Element {
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string; stratumName: string }>();
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const { selectedOrganization } = useOrganization();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

  const columns: TableColumnType[] = useMemo(() => {
    const defaultColumns: TableColumnType[] = [
      { key: 'monitoringPlotNumber', name: strings.MONITORING_PLOT, type: 'string' },
      { key: 'substratumName', name: strings.SUBSTRATUM, type: 'string' },
      { key: 'completedDate', name: strings.DATE, type: 'string' },
      { key: 'status', name: strings.STATUS, type: 'string' },
      { key: 'isPermanent', name: strings.MONITORING_PLOT_TYPE, type: 'string' },
      { key: 'totalLive', name: strings.LIVE_PLANTS, tooltipTitle: strings.TOOLTIP_LIVE_PLANTS, type: 'number' },
      { key: 'totalPlants', name: strings.TOTAL_PLANTS, tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS, type: 'number' },
      { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
      { key: 'plantingDensity', name: strings.PLANT_DENSITY, type: 'number' },
      {
        key: 'survivalRate',
        name: strings.SURVIVAL_RATE,
        type: 'number',
        tooltipTitle: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
      },
    ];

    if (replaceObservationPlotEnabled) {
      return [
        ...defaultColumns,
        {
          key: 'actionsMenu',
          name: '',
          type: 'string',
        },
      ];
    }

    return defaultColumns;
  }, [replaceObservationPlotEnabled, strings]);

  const defaultSearchOrder: SearchSortOrder = {
    field: 'monitoringPlotNumber',
    direction: 'Ascending',
  };

  const fuzzySearchColumns = ['monitoringPlotNumber', 'substratumName'];
  const { data: observationResultsResponse, isLoading } = useGetObservationResultsQuery({ observationId });

  const observationResult = useMemo(
    () => observationResultsResponse?.observation,
    [observationResultsResponse?.observation]
  );

  const stratumResult = useMemo(() => {
    return observationResult?.strata.find((stratum) => stratum.name === stratumName);
  }, [observationResult, stratumName]);

  const rows = useMemo((): MonitoringPlotRow[] => {
    if (observationResult && stratumResult) {
      return stratumResult.substrata.flatMap((substratum) =>
        substratum.monitoringPlots.map((plot): MonitoringPlotRow => {
          const totalLive = plot.species.reduce((total, plotSpecies) => total + plotSpecies.totalLive, 0);

          return {
            observationId,
            observationState: observationResult.state,
            monitoringPlotId: plot.monitoringPlotId,
            monitoringPlotNumber: plot.monitoringPlotNumber,
            stratumName: stratumResult.name,
            substratumName: substratum.name,
            completedDate: plot.completedTime,
            status: plot.status,
            isPermanent: plot.isPermanent,
            totalLive,
            totalPlants: plot.totalPlants,
            totalSpecies: plot.totalSpecies,
            plantingDensity: plot.plantingDensity,
            survivalRate: plot.survivalRate,
          };
        })
      );
    } else {
      return [];
    }
  }, [observationId, observationResult, stratumResult]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <ClientSideFilterTable
        busy={isLoading}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        id='observation-stratum-table'
        Renderer={MonitoringPlotRenderer}
        rows={rows}
        title={strings.MONITORING_PLOTS}
      />
    </Card>
  );
}

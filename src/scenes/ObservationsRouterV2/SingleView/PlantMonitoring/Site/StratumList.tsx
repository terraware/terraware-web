import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { TableColumnType } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import { useLocalization } from 'src/providers/hooks';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { SearchSortOrder } from 'src/types/Search';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import StratumCellRenderer from './StratumCellRenderer';

type StratumRow = {
  observationId: number;
  stratumName: string;
  completedDate?: string;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
};

export default function StratumList(): JSX.Element {
  const { strings } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone().get().id;
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const columns: TableColumnType[] = useMemo(() => {
    return [
      { key: 'stratumName', name: strings.STRATUM, type: 'string' },
      { key: 'completedDate', name: strings.DATE, type: 'string' },
      { key: 'state', name: strings.STATUS, type: 'string' },
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
  }, [strings]);

  const defaultSearchOrder: SearchSortOrder = {
    field: 'stratumName',
    direction: 'Ascending',
  };

  const fuzzySearchColumns = ['stratumName'];
  const { data: observationResultsResponse, isLoading } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, plantingSiteResponse] = useLazyGetPlantingSiteQuery();

  useEffect(() => {
    if (observationResultsResponse) {
      void getPlantingSite(observationResultsResponse.observation.plantingSiteId, true);
    }
  }, [getPlantingSite, observationResultsResponse]);

  const plantingSite = useMemo(() => plantingSiteResponse.data?.site, [plantingSiteResponse.data?.site]);
  const timeZone = useMemo(() => plantingSite?.timeZone ?? defaultTimeZone, [defaultTimeZone, plantingSite?.timeZone]);

  const rows = useMemo((): StratumRow[] => {
    if (observationResultsResponse) {
      return observationResultsResponse.observation.strata.map((stratum): StratumRow => {
        return {
          observationId: observationResultsResponse.observation.observationId,
          stratumName: stratum.name,
          completedDate: stratum.completedTime ? getDateDisplayValue(stratum.completedTime, timeZone) : undefined,
          totalLive: 0,
          totalPlants: stratum.totalPlants,
          totalSpecies: stratum.totalSpecies,
          plantingDensity: stratum.plantingDensity,
          survivalRate: stratum.survivalRate,
        };
      });
    } else {
      return [];
    }
  }, [observationResultsResponse, timeZone]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <ClientSideFilterTable
        busy={isLoading}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        id='observation-site-table'
        Renderer={StratumCellRenderer}
        rows={rows}
        title={strings.STRATA}
      />
    </Card>
  );
}

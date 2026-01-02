import React, { useEffect, useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';
import { Dropdown, Separator } from '@terraware/web-components';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import { TableColumnType } from 'src/components/common/table/types';
import { useLocalization, useOrganization } from 'src/providers';
import {
  ObservationPayload,
  useLazyListAdHocObservationResultsQuery,
  useLazyListAdHocObservationsQuery,
  useLazyListObservationResultsQuery,
  useLazyListObservationsQuery,
} from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { ObservationState } from 'src/types/Observations';
import { SearchSortOrder } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';

import PlantMonitoringRenderer from './PlantMonitorignRenderer';

type PlotSelectionType = 'assigned' | 'adHoc';
type PlantMonitoringRow = {
  observationDate?: string;
  state: ObservationState;
  plantingSiteName?: string;
  strata?: string;
  totalLive?: number;
  totalPlants?: number;
  totalSpecies?: number;
  plantingDensity?: number;
  survivalRate?: number;
  completedDate?: string;
};

export type PlantMonitoringListProps = {
  plantingSiteId?: number;
};

const PlantMonitoringList = ({ plantingSiteId }: PlantMonitoringListProps) => {
  const { selectedOrganization } = useOrganization();
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const { strings } = useLocalization();

  const columns = useMemo((): TableColumnType[] => {
    const defaultColumns: TableColumnType[] = [
      {
        key: 'observationDate',
        name: strings.DATE,
        type: 'string',
      },
      {
        key: 'state',
        name: strings.STATUS,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'strata',
        name: strings.STRATA,
        type: 'string',
      },
      {
        key: 'totalLive',
        name: strings.LIVE_PLANTS,
        tooltipTitle: strings.TOOLTIP_LIVE_PLANTS,
        type: 'number',
      },
      {
        key: 'totalPlants',
        name: strings.TOTAL_PLANTS,
        tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS,
        type: 'number',
      },
      {
        key: 'totalSpecies',
        name: strings.SPECIES,
        type: 'number',
      },
      {
        key: 'plantingDensity',
        name: strings.PLANT_DENSITY,
        type: 'number',
      },
      {
        key: 'survivalRate',
        name: strings.SURVIVAL_RATE,
        tooltipTitle: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
        type: 'number',
      },
      {
        key: 'completedDate',
        name: strings.DATE_OBSERVED,
        type: 'date',
        tooltipTitle: strings.DATE_OBSERVED_TOOLTIP,
      },
    ];

    if (scheduleObservationsEnabled) {
      return [
        ...defaultColumns,
        {
          key: 'actionsMenu',
          name: '',
          type: 'string',
        },
      ];
    } else {
      return defaultColumns;
    }
  }, [scheduleObservationsEnabled, strings]);

  const defaultSearchOrder: SearchSortOrder = {
    field: 'completedDate',
    direction: 'Descending',
  };

  const fuzzySearchColumns = ['plantingSiteName', 'strata'];

  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');

  const [listObservations, listObservationsResponse] = useLazyListObservationsQuery();
  const [listAdHocObservations, listAdHocObservationsResponse] = useLazyListAdHocObservationsQuery();
  const [listObservationResults, listObservationsResultsResponse] = useLazyListObservationResultsQuery();
  const [listAdHocObservationResults, listAdHocObservationResultsResponse] = useLazyListAdHocObservationResultsQuery();
  const [listPlantingSites, listPlantingSitesResult] = useLazyListPlantingSitesQuery();

  const isLoading = useMemo(
    () =>
      listObservationsResponse.isLoading ||
      listAdHocObservationsResponse.isLoading ||
      listObservationsResultsResponse.isLoading ||
      listAdHocObservationResultsResponse.isLoading,
    [
      listAdHocObservationResultsResponse.isLoading,
      listAdHocObservationsResponse.isLoading,
      listObservationsResponse.isLoading,
      listObservationsResultsResponse.isLoading,
    ]
  );

  const plantingSitesById = useMemo(
    () =>
      (listPlantingSitesResult.data?.sites ?? []).reduce(
        (sites, site) => {
          sites[site.id] = site;
          return sites;
        },
        {} as { [siteId: number]: PlantingSitePayload }
      ),
    [listPlantingSitesResult.data]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: true }, true);
      if (selectedPlotSelection === 'adHoc') {
        void listAdHocObservations(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
          },
          true
        );
        void listAdHocObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      } else {
        void listObservations(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
          },
          true
        );
        void listObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      }
    }
  }, [
    listAdHocObservationResults,
    listAdHocObservations,
    listObservationResults,
    listObservations,
    listPlantingSites,
    selectedPlotSelection,
    selectedOrganization,
    plantingSiteId,
  ]);

  const observations = useMemo(() => {
    if (selectedPlotSelection === 'adHoc') {
      if (listAdHocObservationsResponse.isSuccess) {
        return listAdHocObservationsResponse.data.observations.filter(
          (observation) => observation.type === 'Monitoring'
        );
      } else {
        return [];
      }
    } else {
      if (listObservationsResponse.isSuccess) {
        return listObservationsResponse.data.observations.filter((observation) => observation.type === 'Monitoring');
      } else {
        return [];
      }
    }
  }, [listAdHocObservationsResponse, listObservationsResponse, selectedPlotSelection]);

  const observationsById = useMemo(
    () =>
      observations.reduce(
        (observationMap, observation) => {
          observationMap[observation.id] = observation;
          return observationMap;
        },
        {} as { [observationId: number]: ObservationPayload }
      ),
    [observations]
  );

  const observationResults = useMemo(() => {
    if (selectedPlotSelection === 'adHoc') {
      if (listAdHocObservationResultsResponse.isSuccess) {
        return listAdHocObservationResultsResponse.data.observations.filter(
          (observation) => observation.type === 'Monitoring'
        );
      } else {
        return [];
      }
    } else {
      if (listObservationsResultsResponse.isSuccess) {
        return listObservationsResultsResponse.data.observations.filter(
          (observation) => observation.type === 'Monitoring'
        );
      } else {
        return [];
      }
    }
  }, [listAdHocObservationResultsResponse, listObservationsResultsResponse, selectedPlotSelection]);

  const rows = useMemo(
    () =>
      observationResults.map((observationResult): PlantMonitoringRow => {
        const observation = observationsById[observationResult.observationId];
        const plantingSite = plantingSitesById[observationResult.plantingSiteId];

        const strata = observationResult.strata.reduce((stratumNames, stratumResult) => {
          const obsrvedStratum = plantingSite?.strata?.find((stratum) => stratum.id === stratumResult.stratumId);
          if (obsrvedStratum) {
            return stratumNames + `\r${obsrvedStratum.name}`;
          } else {
            return stratumNames;
          }
        }, '');

        return {
          observationDate: observation?.endDate,
          state: observationResult.state,
          plantingSiteName: plantingSite?.name,
          strata,
          totalPlants: observationResult.totalPlants,
          totalSpecies: observationResult.totalSpecies,
          plantingDensity: observationResult.plantingDensity,
          survivalRate: observationResult.survivalRate,
          completedDate: observationResult.completedTime,
        };
      }),
    [observationResults, observationsById, plantingSitesById]
  );

  const rightComponent = useMemo(() => {
    return (
      <Box display={'flex'} flexDirection={'row'} flexGrow={1} alignItems={'center'} justifyContent={'start'}>
        <Separator height={'40px'} />
        <Typography sx={{ paddingRight: 1 }} fontSize={'16px'} fontWeight={500}>
          {strings.PLOT_SELECTION}
        </Typography>
        <Dropdown
          id='plot-selection-selector'
          onChange={(newValue) => setSelectedPlotSelection(newValue as PlotSelectionType)}
          options={[
            { label: strings.ASSIGNED, value: 'assigned' },
            { label: strings.AD_HOC, value: 'adHoc' },
          ]}
          selectedValue={selectedPlotSelection}
          selectStyles={{
            inputContainer: { maxWidth: '160px' },
            optionsContainer: { maxWidth: '160px' },
          }}
          fullWidth
        />
      </Box>
    );
  }, [selectedPlotSelection, strings.AD_HOC, strings.ASSIGNED, strings.PLOT_SELECTION]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      <ClientSideFilterTable
        busy={isLoading}
        columns={columns}
        defaultSortOrder={defaultSearchOrder}
        fuzzySearchColumns={fuzzySearchColumns}
        id='biomass-measurement-table'
        Renderer={PlantMonitoringRenderer}
        rows={rows}
        title={strings.PLANT_MONITORING}
        rightComponent={rightComponent}
      />
    </Card>
  );
};

export default PlantMonitoringList;

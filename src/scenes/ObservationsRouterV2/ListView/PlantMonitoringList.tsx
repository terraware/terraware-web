import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Typography, useTheme } from '@mui/material';
import { Dropdown, Icon, Separator } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import ClientSideFilterTable from 'src/components/Tables/ClientSideFilterTable';
import Card from 'src/components/common/Card';
import Link from 'src/components/common/Link';
import { TableColumnType } from 'src/components/common/table/types';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import {
  useLazyListAdHocObservationResultsQuery,
  useLazyListObservationResultsQuery,
} from 'src/queries/generated/observations';
import { PlantingSitePayload, useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { useLazyGetAllT0SiteDataSetQuery } from 'src/queries/generated/t0';
import { useLazyGetPlotsWithObservationsQuery } from 'src/queries/search/t0';
import { getStatus } from 'src/types/Observations';
import { SearchSortOrder } from 'src/types/Search';
import { getShortDate } from 'src/utils/dateFormatter';
import { isAdmin } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import PlantMonitoringCellRenderer from './PlantMonitoringCellRenderer';

type PlotSelectionType = 'assigned' | 'adHoc';
type PlantMonitoringRow = {
  adHocPlotNumber?: number;
  observationId: number;
  observationDate?: string;
  state: string;
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
  const theme = useTheme();
  const { selectedOrganization } = useOrganization();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);
  const { activeLocale, strings } = useLocalization();
  const { isMobile } = useDeviceInfo();
  const navigate = useSyncNavigate();
  const [selectedPlotSelection, setSelectedPlotSelection] = useState<PlotSelectionType>('assigned');

  const assignedColumns = useMemo((): TableColumnType[] => {
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

  const adHocColumns = useMemo(
    (): TableColumnType[] => [
      {
        key: 'adHocPlotNumber',
        name: strings.PLOT,
        type: 'string',
      },
      {
        key: 'plantingSiteName',
        name: strings.PLANTING_SITE,
        type: 'string',
      },
      {
        key: 'completedDate',
        name: strings.DATE_OBSERVED,
        type: 'date',
        tooltipTitle: strings.DATE_OBSERVED_TOOLTIP,
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
    ],
    [strings]
  );

  const defaultSearchOrder: SearchSortOrder = useMemo(() => {
    if (selectedPlotSelection === 'assigned') {
      return {
        field: 'completedDate',
        direction: 'Descending',
      };
    } else {
      return {
        field: 'adHocPlotNumber',
        direction: 'Ascending',
      };
    }
  }, [selectedPlotSelection]);

  const fuzzySearchColumns = ['adHocPlotNumber', 'plantingSiteName', 'strata'];

  const [listObservationResults, listObservationsResultsResponse] = useLazyListObservationResultsQuery();
  const [listAdHocObservationResults, listAdHocObservationResultsResponse] = useLazyListAdHocObservationResultsQuery();
  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const [getT0SiteDataSet, getT0SiteDataSetResponse] = useLazyGetAllT0SiteDataSetQuery();
  const [getPlotsWithObservations, getPlotsWithObservationsResponse] = useLazyGetPlotsWithObservationsQuery();

  const survivalRateSet = useMemo(() => getT0SiteDataSetResponse.data?.allSet, [getT0SiteDataSetResponse.data?.allSet]);
  const plotsWithObservations = useMemo(
    () => getPlotsWithObservationsResponse.data ?? [],
    [getPlotsWithObservationsResponse.data]
  );

  const isLoading = useMemo(
    () => listObservationsResultsResponse.isLoading || listAdHocObservationResultsResponse.isLoading,
    [listAdHocObservationResultsResponse.isLoading, listObservationsResultsResponse.isLoading]
  );

  const plantingSitesById = useMemo(
    () =>
      (listPlantingSitesResponse.data?.sites ?? []).reduce(
        (sites, site) => {
          sites[site.id] = site;
          return sites;
        },
        {} as { [siteId: number]: PlantingSitePayload }
      ),
    [listPlantingSitesResponse.data]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: true }, true);
      if (selectedPlotSelection === 'adHoc') {
        void listAdHocObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      } else {
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
    listObservationResults,
    listPlantingSites,
    selectedPlotSelection,
    selectedOrganization,
    plantingSiteId,
  ]);

  useEffect(() => {
    if (plantingSiteId) {
      void getT0SiteDataSet(plantingSiteId, true);
      void getPlotsWithObservations(plantingSiteId, true);
    }
  }, [getPlotsWithObservations, getT0SiteDataSet, plantingSiteId]);

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
        const plantingSite = plantingSitesById[observationResult.plantingSiteId];

        const strata = observationResult.strata.reduce((stratumNames, stratumResult) => {
          const obsrvedStratum = plantingSite?.strata?.find((stratum) => stratum.id === stratumResult.stratumId);
          if (obsrvedStratum) {
            return stratumNames + `\r${obsrvedStratum.name}`;
          } else {
            return stratumNames;
          }
        }, '');

        const completedDate = observationResult.completedTime
          ? getDateDisplayValue(observationResult.completedTime, plantingSite?.timeZone ?? defaultTimezone)
          : undefined;
        const observationDate = getShortDate(completedDate ?? observationResult.startDate, activeLocale);

        return {
          adHocPlotNumber: observationResult.adHocPlot?.monitoringPlotNumber,
          observationId: observationResult.observationId,
          observationDate,
          state: getStatus(observationResult.state),
          plantingSiteName: plantingSite?.name,
          strata,
          totalPlants: observationResult.totalPlants,
          totalSpecies: observationResult.totalSpecies,
          plantingDensity: observationResult.plantingDensity,
          survivalRate: observationResult.survivalRate,
          completedDate: observationResult.completedTime,
        };
      }),
    [activeLocale, defaultTimezone, observationResults, plantingSitesById]
  );

  const navigateToSurvivalRateSettings = useCallback(() => {
    if (plantingSiteId) {
      navigate({
        pathname: APP_PATHS.SURVIVAL_RATE_SETTINGS_V2.replace(':plantingSiteId', plantingSiteId.toString()),
      });
    }
  }, [navigate, plantingSiteId]);

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
        {plantingSiteId && selectedPlotSelection === 'assigned' && !!observationResults.length && (
          <Box display={'flex'} alignItems={'center'} flexBasis={isMobile ? '100%' : 'content'}>
            <Link
              onClick={navigateToSurvivalRateSettings}
              fontSize='16px'
              style={{
                paddingLeft: isMobile ? 0 : theme.spacing(2),
                paddingRight: theme.spacing(0.5),
                paddingTop: isMobile ? theme.spacing(1) : 0,
              }}
              disabled={plotsWithObservations.length === 0}
            >
              {strings.SURVIVAL_RATE_SETTINGS}
            </Link>
            {!!plotsWithObservations.length && (
              <>
                {survivalRateSet ? (
                  <Icon name='success' fillColor={theme.palette.TwClrBgSuccess} />
                ) : (
                  <Icon name='iconUnavailable' fillColor={theme.palette.TwClrBgDanger} />
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    );
  }, [
    isMobile,
    navigateToSurvivalRateSettings,
    observationResults?.length,
    plantingSiteId,
    plotsWithObservations.length,
    selectedPlotSelection,
    strings.AD_HOC,
    strings.ASSIGNED,
    strings.PLOT_SELECTION,
    strings.SURVIVAL_RATE_SETTINGS,
    survivalRateSet,
    theme,
  ]);

  return (
    <Card radius={'8px'} style={{ width: '100%' }}>
      {selectedPlotSelection === 'assigned' && (
        <ClientSideFilterTable
          busy={isLoading}
          columns={assignedColumns}
          defaultSortOrder={defaultSearchOrder}
          fuzzySearchColumns={fuzzySearchColumns}
          id='assigned-plant-monitoring-table'
          Renderer={PlantMonitoringCellRenderer}
          rows={rows}
          title={strings.PLANT_MONITORING}
          rightComponent={rightComponent}
        />
      )}
      {selectedPlotSelection === 'adHoc' && (
        <ClientSideFilterTable
          busy={isLoading}
          columns={adHocColumns}
          defaultSortOrder={defaultSearchOrder}
          fuzzySearchColumns={fuzzySearchColumns}
          id='ad-hoc-plant-monitoring-table'
          Renderer={PlantMonitoringCellRenderer}
          rows={rows}
          title={strings.PLANT_MONITORING}
          rightComponent={rightComponent}
        />
      )}
    </Card>
  );
};

export default PlantMonitoringList;

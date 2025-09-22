import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import SurvivalRateMessage from 'src/components/SurvivalRate/SurvivalRateMessage';
import Card from 'src/components/common/Card';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchFiltersProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { searchObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { has25mPlots } from 'src/redux/features/observations/utils';
import { selectPlantingSiteT0 } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSiteT0 } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import AggregatedPlantsStats from 'src/scenes/ObservationsRouter/common/AggregatedPlantsStats';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import ReplaceObservationPlotModal from 'src/scenes/ObservationsRouter/replacePlot/ReplaceObservationPlotModal';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { FieldOptionsMap } from 'src/types/Search';
import { PlotT0Data } from 'src/types/Tracking';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { isManagerOrHigher } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationPlantingZoneRenderer from './ObservationPlantingZoneRenderer';

const replaceObservationPlotColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export default function ObservationPlantingZone(): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useSyncNavigate();
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneName: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);
  const observationId = Number(params.observationId);
  const plantingZoneName = params.plantingZoneName!;

  const [search, onSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [replaceObservationPlot, setReplaceObservationPlot] = useState<
    ObservationMonitoringPlotResultsPayload | undefined
  >();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);
  const { plantingSite } = usePlantingSiteData();
  const [requestId, setRequestId] = useState('');
  const plantingSiteT0Response = useAppSelector(selectPlantingSiteT0(requestId));
  const [t0Plots, setT0Plots] = useState<PlotT0Data[]>();
  const isSurvivalRateCalculationEnabled = isEnabled('Survival Rate Calculation');
  const dispatch = useAppDispatch();

  const defaultColumns = (): TableColumnType[] => [
    { key: 'monitoringPlotNumber', name: strings.MONITORING_PLOT, type: 'string' },
    { key: 'subzoneName', name: strings.SUBZONE, type: 'string' },
    { key: 'completedDate', name: strings.DATE, type: 'string' },
    { key: 'status', name: strings.STATUS, type: 'string' },
    { key: 'isPermanent', name: strings.MONITORING_PLOT_TYPE, type: 'string' },
    { key: 'totalLive', name: strings.LIVE_PLANTS, tooltipTitle: strings.TOOLTIP_LIVE_PLANTS, type: 'number' },
    { key: 'totalPlants', name: strings.TOTAL_PLANTS, tooltipTitle: strings.TOOLTIP_TOTAL_PLANTS, type: 'number' },
    { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
    { key: 'plantingDensity', name: strings.PLANT_DENSITY, type: 'number' },
    {
      key: isSurvivalRateCalculationEnabled ? 'survivalRate' : 'mortalityRate',
      name: isSurvivalRateCalculationEnabled ? strings.SURVIVAL_RATE : strings.MORTALITY_RATE,
      type: 'number',
    },
  ];

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(replaceObservationPlotEnabled ? replaceObservationPlotColumn() : [])];
  }, [activeLocale, replaceObservationPlotEnabled]);

  const filterColumns = useMemo<FilterField[]>(
    () => (activeLocale ? [{ name: 'plotType', label: strings.MONITORING_PLOT_TYPE, type: 'single_selection' }] : []),
    [activeLocale]
  );

  const filterOptions = useMemo<FieldOptionsMap>(
    () =>
      activeLocale
        ? {
            plotType: { partial: false, values: [strings.PERMANENT, strings.TEMPORARY] },
          }
        : { plotType: { partial: false, values: [] } },
    [activeLocale]
  );

  const filtersProps = useMemo<SearchFiltersProps>(
    () => ({
      filters,
      setFilters: (val: Record<string, any>) => setFilters(val),
      filterOptions,
      filterColumns,
    }),
    [filters, setFilters, filterOptions, filterColumns]
  );

  const onCloseModal = useCallback(() => {
    setReplaceObservationPlot(undefined);
  }, [setReplaceObservationPlot]);

  const plantingZone = useAppSelector((state) =>
    searchObservationPlantingZone(
      state,
      {
        plantingSiteId,
        observationId,
        orgId: selectedOrganization?.id || -1,
        plantingZoneName,
        search,
        plotType: filters.plotType === undefined ? undefined : filters.plotType.values[0] === strings.PERMANENT,
      },
      defaultTimeZone.get().id
    )
  );

  useEffect(() => {
    setFilters({});
  }, [activeLocale]);

  useEffect(() => {
    if (!plantingZone) {
      navigate(
        APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', `${plantingSiteId}`).replace(
          ':observationId',
          `${observationId}`
        )
      );
    }
  }, [navigate, observationId, plantingSiteId, plantingZone]);

  useEffect(() => {
    if (isSurvivalRateCalculationEnabled && plantingSite && plantingSite.id !== -1) {
      const request = dispatch(requestPlantingSiteT0(plantingSite.id));
      setRequestId(request.requestId);
    }
  }, [dispatch, isSurvivalRateCalculationEnabled, plantingSite]);

  useEffect(() => {
    if (plantingSiteT0Response?.status === 'success') {
      setT0Plots(plantingSiteT0Response.data);
    }
  }, [plantingSiteT0Response]);

  const rows: (ObservationMonitoringPlotResultsPayload & { subzoneName?: string; totalLive?: number })[] = useMemo(
    () =>
      plantingZone?.plantingSubzones?.flatMap((subzone) =>
        subzone.monitoringPlots.map((plot) => ({
          ...plot,
          subzoneName: subzone.name,
          totalLive: getObservationSpeciesLivePlantsCount(plot.species),
        }))
      ) ?? [],
    [plantingZone]
  );

  const showSurvivalRateMessage = useMemo(() => {
    const allPlotsLength =
      plantingSite?.plantingZones?.flatMap((z) => z.plantingSubzones?.flatMap((sz) => sz.monitoringPlots) || [])
        ?.length || 0;
    return (
      isSurvivalRateCalculationEnabled &&
      plantingSiteT0Response?.status === 'success' &&
      (t0Plots?.length || 0) < (allPlotsLength || 0)
    );
  }, [isSurvivalRateCalculationEnabled, plantingSite?.plantingZones, plantingSiteT0Response?.status, t0Plots?.length]);

  return (
    <>
      {replaceObservationPlot && (
        <ReplaceObservationPlotModal
          monitoringPlot={replaceObservationPlot}
          observationId={observationId}
          onClose={onCloseModal}
          plantingSiteId={plantingSiteId}
        />
      )}
      <DetailsPage
        title={plantingZoneName}
        plantingSiteId={plantingSiteId}
        plantingZoneName={plantingZoneName}
        observationId={observationId}
      >
        {showSurvivalRateMessage && plantingSiteId && <SurvivalRateMessage selectedPlantingSiteId={plantingSiteId} />}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AggregatedPlantsStats {...(plantingZone ?? {})} />
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 3, maxWidth: '100%' }}>
          <Card flushMobile>
            <Search search={search} onSearch={onSearch} filtersProps={filtersProps} />
            <Box marginTop={2}>
              <Table
                id='observation-zone-table'
                columns={columns}
                rows={rows}
                orderBy='plantingZoneName'
                Renderer={ObservationPlantingZoneRenderer(
                  plantingSiteId,
                  observationId,
                  plantingZoneName,
                  setReplaceObservationPlot
                )}
                tableComments={
                  plantingZone?.plantingSubzones && has25mPlots(plantingZone.plantingSubzones)
                    ? strings.PLOTS_SIZE_NOTE
                    : undefined
                }
              />
            </Box>
          </Card>
        </Box>
      </DetailsPage>
    </>
  );
}

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
import useObservation from 'src/hooks/useObservation';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { searchObservationStratum } from 'src/redux/features/observations/observationStratumSelectors';
import { has25mPlots } from 'src/redux/features/observations/utils';
import { useAppSelector } from 'src/redux/store';
import AggregatedPlantsStats from 'src/scenes/ObservationsRouter/common/AggregatedPlantsStats';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import ReplaceObservationPlotModal from 'src/scenes/ObservationsRouter/replacePlot/ReplaceObservationPlotModal';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { FieldOptionsMap } from 'src/types/Search';
import { getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { isManagerOrHigher } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationStratumRenderer from './ObservationStratumRenderer';

const replaceObservationPlotColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export default function ObservationStratum(): JSX.Element {
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

  const { observation } = useObservation(observationId);
  const [search, onSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [replaceObservationPlot, setReplaceObservationPlot] = useState<
    ObservationMonitoringPlotResultsPayload | undefined
  >();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

  const defaultColumns = useCallback(
    () =>
      [
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
          key: 'survivalRate',
          name: strings.SURVIVAL_RATE,
          type: 'number',
          tooltipTitle: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
        },
      ] as TableColumnType[],
    []
  );

  const columns = useCallback((): TableColumnType[] => {
    if (!activeLocale) {
      return [];
    }

    return [...defaultColumns(), ...(replaceObservationPlotEnabled ? replaceObservationPlotColumn() : [])];
  }, [activeLocale, defaultColumns, replaceObservationPlotEnabled]);

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
    searchObservationStratum(
      state,
      {
        plantingSiteId,
        observationId,
        orgId: selectedOrganization?.id || -1,
        stratumName: plantingZoneName,
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
    if (selectedOrganization && !plantingZone) {
      navigate(
        APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', `${plantingSiteId}`).replace(
          ':observationId',
          `${observationId}`
        )
      );
    }
  }, [navigate, selectedOrganization, observationId, plantingSiteId, plantingZone]);

  const rows: (ObservationMonitoringPlotResultsPayload & { subzoneName?: string; totalLive?: number })[] = useMemo(
    () =>
      plantingZone?.substrata?.flatMap((subzone) =>
        subzone.monitoringPlots.map((plot) => ({
          ...plot,
          subzoneName: subzone.name,
          totalLive: getObservationSpeciesLivePlantsCount(plot.species),
        }))
      ) ?? [],
    [plantingZone]
  );

  const showSurvivalRateMessage = useMemo(() => {
    return plantingZone?.survivalRate === undefined;
  }, [plantingZone]);

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
                Renderer={ObservationStratumRenderer(
                  plantingSiteId,
                  observationId,
                  plantingZoneName,
                  setReplaceObservationPlot,
                  observation?.state
                )}
                tableComments={
                  plantingZone?.substrata && has25mPlots(plantingZone.substrata) ? strings.PLOTS_SIZE_NOTE : undefined
                }
              />
            </Box>
          </Card>
        </Box>
      </DetailsPage>
    </>
  );
}

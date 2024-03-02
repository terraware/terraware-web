import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import { FilterField } from 'src/components/common/FilterGroup';
import Search, { SearchFiltersProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization, useOrganization } from 'src/providers';
import { searchObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { useAppSelector } from 'src/redux/store';
import AggregatedPlantsStats from 'src/scenes/ObservationsRouter/common/AggregatedPlantsStats';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import ReplaceObservationPlotModal from 'src/scenes/ObservationsRouter/replacePlot/ReplaceObservationPlotModal';
import strings from 'src/strings';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';
import { FieldOptionsMap } from 'src/types/Search';
import { isManagerOrHigher } from 'src/utils/organization';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationPlantingZoneRenderer from './ObservationPlantingZoneRenderer';

const defaultColumns = (): TableColumnType[] => [
  { key: 'monitoringPlotName', name: strings.MONITORING_PLOT, type: 'string' },
  { key: 'completedDate', name: strings.DATE, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'isPermanent', name: strings.MONITORING_PLOT_TYPE, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

const replaceObservationPlotColumn = (): TableColumnType[] => [
  {
    key: 'actionsMenu',
    name: '',
    type: 'string',
  },
];

export default function ObservationPlantingZone(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
  }>();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const history = useHistory();
  const [search, onSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [replaceObservationPlot, setReplaceObservationPlot] = useState<
    ObservationMonitoringPlotResultsPayload | undefined
  >();
  const replaceObservationPlotEnabled = isManagerOrHigher(selectedOrganization);

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
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
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
      history.push(
        APP_PATHS.OBSERVATION_DETAILS.replace(':plantingSiteId', Number(plantingSiteId).toString()).replace(
          ':observationId',
          Number(observationId).toString()
        )
      );
    }
  }, [history, observationId, plantingSiteId, plantingZone]);

  return (
    <>
      {replaceObservationPlot && (
        <ReplaceObservationPlotModal
          monitoringPlot={replaceObservationPlot}
          observationId={Number(observationId)}
          onClose={onCloseModal}
          plantingSiteId={Number(plantingSiteId)}
        />
      )}
      <DetailsPage
        title={plantingZone?.plantingZoneName ?? ''}
        plantingSiteId={plantingSiteId}
        observationId={observationId}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AggregatedPlantsStats {...(plantingZone ?? {})} />
          </Grid>
        </Grid>
        <Box sx={{ marginTop: 3, maxWidth: '100%' }}>
          <Card flushMobile>
            <Search search={search} onSearch={(value: string) => onSearch(value)} filtersProps={filtersProps} />
            <Box marginTop={2}>
              <Table
                id='observation-zone-table'
                columns={columns}
                rows={plantingZone?.plantingSubzones?.flatMap((subzone) => subzone.monitoringPlots) ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationPlantingZoneRenderer(
                  Number(plantingSiteId),
                  Number(observationId),
                  Number(plantingZoneId),
                  setReplaceObservationPlot
                )}
              />
            </Box>
          </Card>
        </Box>
      </DetailsPage>
    </>
  );
}

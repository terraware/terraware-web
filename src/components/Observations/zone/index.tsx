import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { TableColumnType } from '@terraware/web-components';
import { FieldOptionsMap } from 'src/types/Search';
import strings from 'src/strings';
import { useLocalization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { useAppSelector } from 'src/redux/store';
import { searchObservationPlantingZone } from 'src/redux/features/observations/observationPlantingZoneSelectors';
import { FilterField } from 'src/components/common/FilterGroup';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search from 'src/components/common/SearchFiltersWrapper';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import AggregatedPlantsStats from 'src/components/Observations/common/AggregatedPlantsStats';
import ObservationPlantingZoneRenderer from './ObservationPlantingZoneRenderer';

const columns = (): TableColumnType[] => [
  { key: 'monitoringPlotName', name: strings.MONITORING_PLOT, type: 'string' },
  { key: 'completedDate', name: strings.DATE, type: 'string' },
  { key: 'isPermanent', name: strings.MONITORING_PLOT_TYPE, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

export default function ObservationPlantingZone(): JSX.Element {
  const { plantingSiteId, observationId, plantingZoneId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneId: string;
  }>();
  const { activeLocale } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const [search, onSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [plotTypeSearch, setPlotTypeSearch] = useState<boolean | undefined>();

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

  const plantingZone = useAppSelector((state) =>
    searchObservationPlantingZone(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        plantingZoneId: Number(plantingZoneId),
        search,
        plotType: plotTypeSearch,
      },
      defaultTimeZone.get().id
    )
  );

  useEffect(() => {
    if (filters.plotType && plotTypeSearch !== undefined) {
      filters.plotType.values = [plotTypeSearch ? strings.PERMANENT : strings.TEMPORARY];
    }
  }, [activeLocale, filters, plotTypeSearch]);

  return (
    <DetailsPage
      title={plantingZone?.plantingZoneName ?? ''}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AggregatedPlantsStats {...(plantingZone ?? {})} />
        </Grid>
        <Grid item xs={12}>
          <Card flushMobile>
            <Search
              search={search}
              onSearch={(value: string) => onSearch(value)}
              filters={filters}
              setFilters={(val) => {
                setFilters(val);
                if (val.plotType) {
                  setPlotTypeSearch(val.plotType.values[0] === strings.PERMANENT);
                } else {
                  setPlotTypeSearch(undefined);
                }
              }}
              filterOptions={filterOptions}
              filterColumns={filterColumns}
            />
            <Box marginTop={2}>
              <Table
                id='observation-details-table'
                columns={columns}
                rows={plantingZone?.plantingSubzones?.flatMap((subzone) => subzone.monitoringPlots) ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationPlantingZoneRenderer(
                  Number(plantingSiteId),
                  Number(observationId),
                  Number(plantingZoneId)
                )}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}

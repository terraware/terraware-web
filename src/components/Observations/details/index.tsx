import { useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import { Message, TableColumnType } from '@terraware/web-components';
import { FieldOptionsMap } from 'src/types/Search';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { getLongDate, getShortDate } from 'src/utils/dateFormatter';
import { useLocalization } from 'src/providers';
import { useAppSelector } from 'src/redux/store';
import {
  searchObservationDetails,
  selectDetailsZoneNames,
} from 'src/redux/features/observations/observationDetailsSelectors';
import { selectObservation } from 'src/redux/features/observations/observationsSelectors';
import Card from 'src/components/common/Card';
import Table from 'src/components/common/table';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import DetailsPage from 'src/components/Observations/common/DetailsPage';
import AggregatedPlantsStats from 'src/components/Observations/common/AggregatedPlantsStats';
import ObservationDetailsRenderer from './ObservationDetailsRenderer';

const columns = (): TableColumnType[] => [
  { key: 'plantingZoneName', name: strings.ZONE, type: 'string' },
  { key: 'completedDate', name: strings.DATE, type: 'string' },
  { key: 'status', name: strings.STATUS, type: 'string' },
  { key: 'totalPlants', name: strings.PLANTS, type: 'number' },
  { key: 'totalSpecies', name: strings.SPECIES, type: 'number' },
  { key: 'plantingDensity', name: strings.PLANTING_DENSITY, type: 'number' },
  { key: 'mortalityRate', name: strings.MORTALITY_RATE, type: 'number' },
];

type ObservationStatusSummary = {
  endDate: string;
  pendingPlots: number;
  totalPlots: number;
  observedPlots: number;
  observedPlotsPercentage: number;
};

export type ObservationDetailsProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
};

export default function ObservationDetails(props: ObservationDetailsProps): JSX.Element {
  const { setFilterOptions } = props;
  const { ...searchProps }: SearchProps = props;
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const { activeLocale } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const history = useHistory();

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId: Number(plantingSiteId),
        observationId: Number(observationId),
        search: searchProps.search,
        zoneNames: searchProps.filtersProps?.filters.zone?.values ?? [],
      },
      defaultTimeZone.get().id
    )
  );

  const observation = useAppSelector((state) =>
    selectObservation(state, Number(plantingSiteId), Number(observationId))
  );

  const zoneNames = useAppSelector((state) =>
    selectDetailsZoneNames(state, Number(plantingSiteId), Number(observationId))
  );

  const title = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedDate ? getShortDate(details.completedDate, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  const statusSummary = useMemo<ObservationStatusSummary | undefined>(() => {
    if (observation && details && Date.now() <= new Date(observation.endDate).getTime()) {
      const plots = details.plantingZones.flatMap((zone) =>
        zone.plantingSubzones.flatMap((subzone) => subzone.monitoringPlots)
      );
      const pendingPlots = plots.filter((plot) => !plot.completedTime).length;
      const totalPlots = plots.length;
      const observedPlots = totalPlots - pendingPlots;

      return {
        endDate: getLongDate(observation.endDate, activeLocale),
        pendingPlots,
        totalPlots,
        observedPlots,
        observedPlotsPercentage: +((observedPlots / totalPlots) * 100).toFixed(2),
      };
    }
    return undefined;
  }, [activeLocale, details, observation]);

  useEffect(() => {
    setFilterOptions({
      zone: {
        partial: false,
        values: zoneNames,
      },
    });
  }, [setFilterOptions, zoneNames]);

  useEffect(() => {
    if (!details) {
      history.push(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', Number(plantingSiteId).toString()));
    }
  }, [details, history, plantingSiteId]);

  useEffect(() => {
    const initialZones = searchProps.filtersProps?.filters?.zone?.values ?? [];
    const availableZones = initialZones.filter((name: string) => zoneNames.includes(name));

    if (availableZones.length < initialZones.length) {
      searchProps.filtersProps?.setFilters((previous: Record<string, any>) => ({
        ...previous,
        zone: { ...previous.zone, values: availableZones },
      }));
    }
  }, [zoneNames, searchProps.filtersProps]);

  return (
    <DetailsPage title={title} plantingSiteId={plantingSiteId}>
      <ObservationStatusSummaryMessage statusSummary={statusSummary} />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AggregatedPlantsStats {...(details ?? {})} />
        </Grid>
        <Grid item xs={12}>
          <Card flushMobile style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 'fit-content' }}>
            <Search {...searchProps} />
            <Box marginTop={2}>
              <Table
                id='observation-details-table'
                columns={columns}
                rows={details?.plantingZones ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationDetailsRenderer(Number(plantingSiteId), Number(observationId))}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}

type ObservationStatusSummaryMessageProps = {
  statusSummary?: ObservationStatusSummary;
};

const ObservationStatusSummaryMessage = ({
  statusSummary,
}: ObservationStatusSummaryMessageProps): JSX.Element | null => {
  if (!statusSummary) {
    return null;
  }

  return (
    <Box marginBottom={3} display='flex' flexGrow={1}>
      <Message
        type='page'
        priority='info'
        title={strings.OBSERVATION_STATUS}
        body={
          <>
            <Box marginBottom={3}>
              {
                strings.formatString(
                  strings.OBSERVATIONS_REQUIRED_BY_DATE,
                  statusSummary.pendingPlots.toString(),
                  statusSummary.endDate
                ) as string
              }
            </Box>
            <Box>
              {
                strings.formatString(
                  strings.OBSERVATIONS_COMPLETION_PERCENTAGE,
                  statusSummary.observedPlots,
                  statusSummary.totalPlots,
                  statusSummary.observedPlotsPercentage
                ) as string
              }
            </Box>
          </>
        }
      />
    </Box>
  );
};

import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, useTheme } from '@mui/material';
import { Message, TableColumnType } from '@terraware/web-components';

import Card from 'src/components/common/Card';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import Table from 'src/components/common/table';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import {
  searchObservationDetails,
  selectDetailsZoneNames,
} from 'src/redux/features/observations/observationDetailsSelectors';
import { selectObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import AggregatedPlantsStats from 'src/scenes/ObservationsRouter/common/AggregatedPlantsStats';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import strings from 'src/strings';
import { Observation } from 'src/types/Observations';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { getLongDate, getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

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

  const { activeLocale } = useLocalization();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useNavigate();
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId || -1);
  const observationId = Number(params.observationId || -1);

  const details = useAppSelector((state) =>
    searchObservationDetails(
      state,
      {
        plantingSiteId,
        observationId,
        search: searchProps.search,
        zoneNames: searchProps.filtersProps?.filters.zone?.values ?? [],
      },
      defaultTimeZone.get().id
    )
  );

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const observation = useAppSelector((state) => selectObservation(state, plantingSiteId, observationId));
  const zoneNames = useAppSelector((state) => selectDetailsZoneNames(state, plantingSiteId, observationId));

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
      navigate(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', `${plantingSiteId}`));
    }
  }, [details, navigate, plantingSiteId]);

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
      <ObservationStatusSummaryMessage
        plantingZones={plantingSite?.plantingZones}
        requestedSubzoneIds={observation?.requestedSubzoneIds}
        statusSummary={statusSummary}
      />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AggregatedPlantsStats {...(details ?? {})} />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Card flushMobile>
            <Search {...searchProps} />
            <Box marginTop={2}>
              <Table
                id='observation-details-table'
                columns={columns}
                rows={details?.plantingZones ?? []}
                orderBy='plantingZoneName'
                Renderer={ObservationDetailsRenderer(plantingSiteId, observationId)}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </DetailsPage>
  );
}

type ObservationStatusSummaryMessageProps = {
  plantingZones?: PlantingSite['plantingZones'];
  requestedSubzoneIds?: Observation['requestedSubzoneIds'];
  statusSummary?: ObservationStatusSummary;
};

const ObservationStatusSummaryMessage = ({
  plantingZones,
  requestedSubzoneIds,
  statusSummary,
}: ObservationStatusSummaryMessageProps): JSX.Element | null => {
  const theme = useTheme();

  const subzoneMessageBody = useMemo(() => {
    if (!requestedSubzoneIds || requestedSubzoneIds.length === 0 || !plantingZones || plantingZones.length === 0) {
      return undefined;
    }

    const zoneListItems: JSX.Element[] = plantingZones
      .map((zone, index): JSX.Element | null => {
        const subzoneNames = zone.plantingSubzones
          .filter((subzone) => requestedSubzoneIds.includes(subzone.id))
          .map((subzone) => subzone.name);

        if (subzoneNames.length === 0) {
          return null;
        }

        return <li key={index}>{`${zone.name}: ${subzoneNames.join(', ')}`}</li>;
      })
      .filter((element: JSX.Element | null): element is JSX.Element => element !== null);

    if (zoneListItems.length === 0) {
      return null;
    }

    return (
      <Box marginTop={3}>
        {strings.THIS_OBSERVATION_INCLUDES}
        <ul style={{ margin: 0, padding: `0 ${theme.spacing(3)}` }}>{zoneListItems}</ul>
      </Box>
    );
  }, [plantingZones, requestedSubzoneIds, theme]);

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
            <Box>
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

            {subzoneMessageBody}
          </>
        }
      />
    </Box>
  );
};

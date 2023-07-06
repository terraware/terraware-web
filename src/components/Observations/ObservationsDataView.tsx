import { useEffect, useMemo } from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { useAppSelector } from 'src/redux/store';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import {
  searchObservations,
  selectObservationsZoneNames,
  selectPlantingSiteObservations,
} from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import OrgObservationsListView from './org/OrgObservationsListView';
import ObservationMapView from './map/ObservationMapView';
import ObservationsEventsNotification, { ObservationEvent } from './ObservationsEventsNotification';

export type ObservationsDataViewProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  selectedPlantingSiteId: number;
};

export default function ObservationsDataView(props: ObservationsDataViewProps): JSX.Element {
  const { selectedPlantingSiteId, setFilterOptions } = props;
  const { ...searchProps }: SearchProps = props;
  const defaultTimeZone = useDefaultTimeZone();

  const observationsResults = useAppSelector((state) =>
    searchObservations(
      state,
      selectedPlantingSiteId,
      defaultTimeZone.get().id,
      searchProps.search,
      searchProps.filtersProps?.filters.zone?.values ?? []
    )
  );

  const upcomingObservations = useAppSelector((state) => selectPlantingSiteObservations(state, -1, 'Upcoming'));

  const zoneNames = useAppSelector((state) => selectObservationsZoneNames(state, selectedPlantingSiteId));

  useEffect(() => {
    setFilterOptions({
      zone: {
        partial: false,
        values: zoneNames,
      },
    });
  }, [setFilterOptions, zoneNames]);

  const observationsEvents = useMemo<ObservationEvent[]>(() => {
    if (!upcomingObservations) {
      return [];
    }
    const now = Date.now();
    // return observations that haven't passed
    return upcomingObservations.filter((observation) => now <= new Date(observation.endDate).getTime());
  }, [upcomingObservations]);

  return (
    <Grid container display='flex' flexDirection='column'>
      <ObservationsEventsNotification events={observationsEvents} />
      <ListMapView
        initialView='list'
        search={<Search {...searchProps} />}
        list={<OrgObservationsListView observationsResults={observationsResults} />}
        map={
          selectedPlantingSiteId === -1 ? (
            <AllPlantingSitesMapView />
          ) : (
            <ObservationMapView observationsResults={observationsResults} {...searchProps} />
          )
        }
      />
    </Grid>
  );
}

const AllPlantingSitesMapView = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box textAlign='center' marginTop={6}>
      <Typography fontSize='18px' fontWeight={500} color={theme.palette.TwClrTxtSecondary}>
        {strings.OBSERVATIONS_MAP_VIEW_PROMPT}
      </Typography>
    </Box>
  );
};

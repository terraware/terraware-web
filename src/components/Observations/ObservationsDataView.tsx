import { useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { FieldOptionsMap } from 'src/types/Search';
import { useAppSelector } from 'src/redux/store';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { searchObservations, selectObservationsZoneNames } from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import OrgObservationsListView from './org/OrgObservationsListView';
import ObservationMapView from './map/ObservationMapView';

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

  const zoneNames = useAppSelector((state) => selectObservationsZoneNames(state, selectedPlantingSiteId));

  useEffect(() => {
    setFilterOptions({
      zone: {
        partial: false,
        values: zoneNames,
      },
    });
  }, [setFilterOptions, zoneNames]);

  return (
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
  );
}

const AllPlantingSitesMapView = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box textAlign='center' marginTop={6}>
      <Typography fontSize='18px' fontWeight={500} color={theme.palette.TwClrTxtSecondary}>
        Placeholder: Select a single planting site to view data
      </Typography>
    </Box>
  );
};

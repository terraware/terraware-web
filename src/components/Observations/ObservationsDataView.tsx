import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { FieldOptionsMap } from 'src/types/Search';
import { useAppSelector } from 'src/redux/store';
import { useLocalization } from 'src/providers';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';
import { searchObservations } from 'src/redux/features/observations/observationsSelectors';
import ListMapView from 'src/components/ListMapView';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import OrgObservationsListView from './org/OrgObservationsListView';
import ObservationMapView from './map/ObservationMapView';

export type ObservationsDataViewProps = Omit<SearchProps, 'filterOptions'> & {
  selectedPlantingSiteId: number;
};

export default function ObservationsDataView({
  selectedPlantingSiteId,
  search,
  onSearch,
  filters,
  setFilters,
  filterColumns,
}: ObservationsDataViewProps): JSX.Element {
  const defaultTimeZone = useDefaultTimeZone();
  const { activeLocale } = useLocalization();

  const observationsResults = useAppSelector((state) =>
    searchObservations(state, selectedPlantingSiteId, defaultTimeZone.get().id, search)
  );

  const filterOptions = useMemo<FieldOptionsMap>(
    () =>
      activeLocale
        ? {
            zone: { partial: false, values: [] },
          }
        : { zone: { partial: false, values: [] } },
    [activeLocale]
  );

  return (
    <ListMapView
      initialView='list'
      search={
        <Search
          search={search}
          onSearch={onSearch}
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          filterColumns={filterColumns}
        />
      }
      list={<OrgObservationsListView observationsResults={observationsResults} />}
      map={
        selectedPlantingSiteId === -1 ? (
          <AllPlantingSitesMapView />
        ) : (
          <ObservationMapView observationsResults={observationsResults} search={search} onSearch={onSearch} />
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

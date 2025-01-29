import React, { useEffect } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import { View } from 'src/components/common/ListMapSelector';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { searchObservations, selectObservationsZoneNames } from 'src/redux/features/observations/observationsSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMapView from './map/ObservationMapView';
import OrgObservationsListView from './org/OrgObservationsListView';

export type ObservationsDataViewProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  selectedPlantingSiteId: number;
  selectedPlantingSite?: PlantingSite;
  setView: (view: View) => void;
  view?: View;
  reload: () => void;
};

export default function ObservationsDataView(props: ObservationsDataViewProps): JSX.Element {
  const { selectedPlantingSiteId, selectedPlantingSite, setFilterOptions, setView, view, reload } = props;
  const { ...searchProps }: SearchProps = props;
  const defaultTimeZone = useDefaultTimeZone();

  const observationsResults = useAppSelector((state) =>
    searchObservations(
      state,
      selectedPlantingSiteId,
      defaultTimeZone.get().id,
      searchProps.search,
      searchProps.filtersProps?.filters.zone?.values ?? [],
      searchProps.filtersProps?.filters.status?.values ?? []
    )
  );

  const zoneNames = useAppSelector((state) =>
    selectObservationsZoneNames(state, selectedPlantingSiteId, searchProps.filtersProps?.filters.status?.values)
  );

  useEffect(() => {
    setFilterOptions({
      zone: {
        partial: false,
        values: zoneNames,
      },
      status: {
        partial: false,
        values: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
      },
    });
  }, [setFilterOptions, zoneNames]);

  return (
    <ListMapView
      initialView='list'
      list={
        <OrgObservationsListView
          observationsResults={observationsResults}
          plantingSiteId={selectedPlantingSiteId}
          reload={reload}
        />
      }
      map={
        selectedPlantingSite && selectedPlantingSiteId !== -1 ? (
          <ObservationMapView
            observationsResults={observationsResults}
            selectedPlantingSite={selectedPlantingSite}
            {...searchProps}
          />
        ) : (
          <AllPlantingSitesMapView />
        )
      }
      onView={setView}
      search={<Search {...searchProps} />}
      style={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}
    />
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

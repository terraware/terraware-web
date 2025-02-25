import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import { View } from 'src/components/common/ListMapSelector';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import {
  searchAdHocObservations,
  searchObservations,
  selectObservationsZoneNames,
} from 'src/redux/features/observations/observationsSelectors';
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
  selectedPlotSelection?: string;
};

export default function ObservationsDataView(props: ObservationsDataViewProps): JSX.Element {
  const {
    selectedPlantingSiteId,
    selectedPlantingSite,
    setFilterOptions,
    setView,
    view,
    reload,
    selectedPlotSelection,
  } = props;
  const { ...searchProps }: SearchProps = props;
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = selectedPlantingSite?.timeZone || defaultTimeZone.get().id;

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

  const allAdHocObservationsResults = useAppSelector((state) =>
    searchAdHocObservations(state, selectedPlantingSiteId, defaultTimeZone.get().id, searchProps.search)
  );

  const adHocObservationsResults = useMemo(() => {
    if (!allAdHocObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationsResults?.filter((observationResult) => {
      const isMonitoring = observationResult.type === 'Monitoring';
      return isMonitoring;
    });
  }, [allAdHocObservationsResults, selectedPlantingSite]);

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
          adHocObservationsResults={adHocObservationsResults}
          plantingSiteId={selectedPlantingSiteId}
          reload={reload}
          selectedPlotSelection={selectedPlotSelection}
          timeZone={timeZone}
        />
      }
      map={
        selectedPlantingSite && selectedPlantingSiteId !== -1 ? (
          <ObservationMapView
            observationsResults={observationsResults}
            adHocObservationsResults={adHocObservationsResults}
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

export const AllPlantingSitesMapView = (): JSX.Element => {
  const theme = useTheme();

  return (
    <Box textAlign='center' marginTop={6}>
      <Typography fontSize='18px' fontWeight={500} color={theme.palette.TwClrTxtSecondary}>
        {strings.OBSERVATIONS_MAP_VIEW_PROMPT}
      </Typography>
    </Box>
  );
};

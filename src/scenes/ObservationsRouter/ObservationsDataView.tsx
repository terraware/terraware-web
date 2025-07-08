import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import { View } from 'src/components/common/ListMapSelector';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useOrganization } from 'src/providers';
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
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const timeZone = selectedPlantingSite?.timeZone || defaultTimeZone.get().id;

  const observationsResults = useAppSelector((state) =>
    searchObservations(
      state,
      selectedPlantingSiteId,
      selectedOrganization?.id || -1,
      defaultTimeZone.get().id,
      searchProps.search,
      searchProps.filtersProps?.filters.zone?.values ?? [],
      searchProps.filtersProps?.filters.status?.values ?? []
    )
  );

  const allAdHocObservationResults = useAppSelector((state) =>
    searchAdHocObservations(state, selectedPlantingSiteId, defaultTimeZone.get().id, searchProps.search)
  );

  const adHocObservationResults = useMemo(() => {
    if (!allAdHocObservationResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allAdHocObservationResults?.filter((observationResult) => {
      const isMonitoring = observationResult.type === 'Monitoring';
      return isMonitoring;
    });
  }, [allAdHocObservationResults, selectedPlantingSite]);

  const zoneNames = useAppSelector((state) =>
    selectedOrganization
      ? selectObservationsZoneNames(
          state,
          selectedPlantingSiteId,
          selectedOrganization.id,
          searchProps.filtersProps?.filters.status?.values
        )
      : undefined
  );

  useEffect(() => {
    if (zoneNames !== undefined) {
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
    }
  }, [setFilterOptions, zoneNames]);

  return (
    <ListMapView
      initialView='list'
      list={
        <OrgObservationsListView
          observationsResults={observationsResults}
          adHocObservationResults={adHocObservationResults}
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
            adHocObservationResults={adHocObservationResults}
            selectedPlantingSite={selectedPlantingSite}
            {...searchProps}
          />
        ) : (
          <AllPlantingSitesMapView />
        )
      }
      onView={setView}
      search={
        <Search
          {...searchProps}
          filtersProps={selectedPlotSelection === 'adHoc' ? undefined : searchProps.filtersProps}
        />
      }
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

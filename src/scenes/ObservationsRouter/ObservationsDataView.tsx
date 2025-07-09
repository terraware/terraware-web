import React, { useEffect, useMemo } from 'react';

import { Box, Typography, useTheme } from '@mui/material';

import ListMapView from 'src/components/ListMapView';
import { View } from 'src/components/common/ListMapSelector';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMapView from './map/ObservationMapView';
import OrgObservationsListView from './org/OrgObservationsListView';

export type ObservationsDataViewProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  selectedPlantingSite?: PlantingSite;
  setView: (view: View) => void;
  view?: View;
  reload: () => void;
  selectedPlotSelection?: string;
};

export default function ObservationsDataView(props: ObservationsDataViewProps): JSX.Element {
  const {
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

  const { observationResults, adHocObservationResults } = useOrgTracking();

  const monitoringAdHocObservationResults = useMemo(() => {
    if (!adHocObservationResults || !selectedPlantingSite?.id) {
      return [];
    }

    return adHocObservationResults.filter((observationResult) => {
      const isMonitoring = observationResult.type === 'Monitoring';
      return isMonitoring;
    });
  }, [adHocObservationResults, selectedPlantingSite]);

  useEffect(() => {
    setFilterOptions({
      status: {
        partial: false,
        values: ['Abandoned', 'Completed', 'InProgress', 'Overdue'],
      },
    });
  }, [setFilterOptions]);

  return (
    <ListMapView
      initialView='list'
      list={
        <OrgObservationsListView reload={reload} selectedPlotSelection={selectedPlotSelection} timeZone={timeZone} />
      }
      map={
        selectedPlantingSite ? (
          <ObservationMapView
            observationsResults={observationResults}
            adHocObservationResults={monitoringAdHocObservationResults}
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

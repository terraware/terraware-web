import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Card, CircularProgress } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { ButtonProps } from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';
import { View } from 'src/components/common/ListMapSelector';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import EmptyStateContent from 'src/components/emptyStatePages/EmptyStateContent';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useLocalization, useOrganization } from 'src/providers';
import { selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import {
  selectObservationSchedulableSites,
  selectUpcomingObservations,
} from 'src/redux/features/observations/observationsUtilsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { PlantingSite } from 'src/types/Tracking';
import { isAdmin } from 'src/utils/organization';
import useQuery from 'src/utils/useQuery';
import useStateLocation, { getLocation } from 'src/utils/useStateLocation';

import BiomassMeasurement from './BiomassMeasurement';
import ObservationsDataView from './ObservationsDataView';
import ObservationsEventsNotification from './ObservationsEventsNotification';
import PlantMonitoring from './PlantMonitoring';

export type ObservationsHomeProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
};

export default function ObservationsHome(props: ObservationsHomeProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const location = useStateLocation();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();
  const query = useQuery();
  const tab = query.get('tab') || 'plantMonitoring';
  const [activeTab, setActiveTab] = useState<string>(tab);
  const [view, setView] = useState<View>();
  const plantingSites = useAppSelector(selectPlantingSites);
  const adHocObservationSupportEnabled = isEnabled('Ad Hoc Observation Support');

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const onTabChange = useCallback(
    (newTab: string) => {
      query.set('tab', newTab);
      navigate(getLocation(location.pathname, location, query.toString()));
    },
    [query, navigate, location]
  );

  const allObservationsResults = useAppSelector(selectObservationsResults);
  const observationsResults = useMemo(() => {
    if (!allObservationsResults || !selectedPlantingSite?.id) {
      return [];
    }

    return allObservationsResults?.filter((observationResult) => {
      const matchesSite =
        selectedPlantingSite.id !== -1 ? observationResult.plantingSiteId === selectedPlantingSite.id : true;
      const matchesState = ['Abandoned', 'Completed', 'Overdue', 'InProgress'].indexOf(observationResult.state) !== -1;
      return matchesSite && matchesState;
    });
  }, [allObservationsResults, selectedPlantingSite]);

  // get upcoming observations for notifications
  const upcomingObservations = useAppSelector(selectUpcomingObservations);
  // get observation schedulable sites
  const newObservationsSchedulable = useAppSelector(selectObservationSchedulableSites).length;
  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  const onSelect = useCallback((site: PlantingSite) => setSelectedPlantingSite(site), [setSelectedPlantingSite]);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  useEffect(() => {
    if (plantingSites?.length === 0) {
      navigate(APP_PATHS.HOME);
    }
  }, [navigate, plantingSites?.length]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  const actionButton = useMemo<ButtonProps | undefined>(() => {
    if (!activeLocale || !newObservationsSchedulable || !scheduleObservationsEnabled) {
      return undefined;
    }
    return {
      title: strings.SCHEDULE_OBSERVATION,
      onClick: () => navigate(APP_PATHS.SCHEDULE_OBSERVATION),
      icon: 'plus',
    };
  }, [activeLocale, navigate, newObservationsSchedulable, scheduleObservationsEnabled]);

  return (
    <PlantsPrimaryPage
      actionButton={actionButton}
      allowAllAsSiteSelection={true}
      isEmptyState={!plantingSites?.length || !observationsResults?.length}
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      onSelect={onSelect}
      pagePath={APP_PATHS.OBSERVATIONS_SITE}
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      style={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}
      title={strings.OBSERVATIONS}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <ObservationsEventsNotification events={upcomingObservations} />
        {adHocObservationSupportEnabled ? (
          <Tabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            tabs={[
              {
                id: 'plantMonitoring',
                label: strings.PLANT_MONITORING,
                children: <PlantMonitoring {...props} selectedPlantingSite={selectedPlantingSite} />,
              },
              {
                id: 'biomassMeasurements',
                label: strings.BIOMASS_MEASUREMENT,
                children: <BiomassMeasurement />,
              },
            ]}
          />
        ) : (
          <>
            {observationsResults === undefined ? (
              <CircularProgress sx={{ margin: 'auto' }} />
            ) : selectedPlantingSite && observationsResults?.length ? (
              <ObservationsDataView
                selectedPlantingSiteId={selectedPlantingSite.id}
                selectedPlantingSite={selectedPlantingSite}
                setView={setView}
                view={view}
                {...props}
              />
            ) : (
              <Card style={{ margin: '56px auto 0', borderRadius: '24px', height: 'fit-content' }}>
                <EmptyStateContent
                  title={strings.OBSERVATIONS_EMPTY_STATE_TITLE}
                  subtitle={[strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_1, strings.OBSERVATIONS_EMPTY_STATE_MESSAGE_2]}
                />
              </Card>
            )}
          </>
        )}
      </Box>
    </PlantsPrimaryPage>
  );
}

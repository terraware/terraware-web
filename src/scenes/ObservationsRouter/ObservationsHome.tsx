import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { ButtonProps } from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { APP_PATHS } from 'src/constants';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { useAppDispatch } from 'src/redux/store';
import BiomassMeasurement from 'src/scenes/ObservationsRouter/biomass/BiomassMeasurement';
import strings from 'src/strings';
import { FieldOptionsMap } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';
import useStickyTabs from 'src/utils/useStickyTabs';

import ObservationsEventsNotification from './ObservationsEventsNotification';
import PlantMonitoring from './PlantMonitoring';

export type ObservationsHomeProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
};

export default function ObservationsHome(props: ObservationsHomeProps): JSX.Element {
  const navigate = useSyncNavigate();
  const dispatch = useAppDispatch();

  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();

  const { allPlantingSites, plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const { observations, reportedPlants, reload } = useOrgTracking();

  const upcomingObservations = useMemo(() => {
    const now = Date.now();
    return observations?.filter((observation) => {
      const endTime = new Date(observation.endDate).getTime();
      return observation.state === 'Upcoming' && now <= endTime;
    });
  }, [observations]);

  useEffect(() => {
    reload();
  }, [reload]);

  const plantingSitesWithZonesAndNoUpcomingObservations = useMemo(() => {
    if (!allPlantingSites || !reportedPlants) {
      return [];
    }
    return allPlantingSites?.filter((site) => {
      if (!site.plantingZones?.length) {
        return false;
      }
      const sitePlants = reportedPlants.find((_sitePlants) => _sitePlants.id === site.id);
      if (!sitePlants?.totalPlants) {
        return false;
      }
      const siteUpcomingObservations = upcomingObservations?.filter(
        (observation) => observation.plantingSiteId === site.id
      );

      if (siteUpcomingObservations.length > 0) {
        return false;
      }
      return true;
    });
  }, [allPlantingSites, reportedPlants, upcomingObservations]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }
    return [
      {
        id: 'plantMonitoring',
        label: strings.PLANT_MONITORING,
        children: <PlantMonitoring {...props} selectedPlantingSite={plantingSite} />,
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassMeasurement {...props} selectedPlantingSite={plantingSite} />,
      },
    ];
  }, [activeLocale, plantingSite, props]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'plantMonitoring',
    tabs,
    viewIdentifier: 'accelerator-overview',
    keepQuery: false,
  });

  const newObservationsSchedulable = useMemo(() => {
    return plantingSitesWithZonesAndNoUpcomingObservations.length > 0;
  }, [plantingSitesWithZonesAndNoUpcomingObservations]);

  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  const onPreferences = useCallback(
    (preferences: Record<string, unknown>) => setPlantsSitePreferences(preferences),
    [setPlantsSitePreferences]
  );

  useEffect(() => {
    if (allPlantingSites?.length === 0) {
      navigate(APP_PATHS.HOME);
    }
  }, [navigate, allPlantingSites?.length]);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      void dispatch(requestPlantings(selectedOrganization.id));
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
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      pagePath={APP_PATHS.OBSERVATIONS_SITE}
      plantingSitesData={allPlantingSites ?? []}
      plantsSitePreferences={plantsSitePreferences}
      setPlantsSitePreferences={onPreferences}
      style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
      title={strings.OBSERVATIONS}
      onSelect={setSelectedPlantingSite}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <ObservationsEventsNotification events={upcomingObservations} />
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </PlantsPrimaryPage>
  );
}

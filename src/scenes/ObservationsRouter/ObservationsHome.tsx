import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

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
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();

  const { allPlantingSites, plantingSite, setSelectedPlantingSite } = usePlantingSiteData();
  const { observations, reportedPlants, reload } = useOrgTracking();

  useEffect(() => {
    const id = Number(plantingSiteId);
    if (!isNaN(id) && id > 0) {
      setSelectedPlantingSite(id);
    }
  }, [plantingSiteId, setSelectedPlantingSite]);

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
        children: <PlantMonitoring {...props} />,
      },
      {
        id: 'biomassMeasurements',
        label: strings.BIOMASS_MONITORING,
        children: <BiomassMeasurement {...props} />,
      },
    ];
  }, [activeLocale, props]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'plantMonitoring',
    tabs,
    viewIdentifier: 'observations',
  });

  const newObservationsSchedulable = useMemo(() => {
    return plantingSitesWithZonesAndNoUpcomingObservations.length > 0;
  }, [plantingSitesWithZonesAndNoUpcomingObservations]);

  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  useEffect(() => {
    if (allPlantingSites?.length === 0) {
      navigate(APP_PATHS.HOME);
    }
  }, [navigate, allPlantingSites?.length]);

  useEffect(() => {
    if (selectedOrganization) {
      void dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization]);

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

  const selectPlantingSite = useCallback(
    (id: number | 'all' | undefined) => {
      if (id !== undefined && id !== 'all') {
        setSelectedPlantingSite(id);
        navigate(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', id.toString()));
      }
      // TODO handle all selection.
    },
    [navigate, setSelectedPlantingSite]
  );

  return (
    <PlantsPrimaryPage
      actionButton={actionButton}
      allowAllAsSiteSelection={true}
      lastVisitedPreferenceName='plants.observations.lastVisitedPlantingSite'
      plantingSitesData={allPlantingSites ?? []}
      style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}
      title={strings.OBSERVATIONS}
      organizationId={selectedOrganization?.id}
      onSelect={selectPlantingSite}
      selectedPlantingSiteId={plantingSite?.id}
    >
      <Box display='flex' flexGrow={1} flexDirection='column'>
        <ObservationsEventsNotification events={upcomingObservations} />
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </PlantsPrimaryPage>
  );
}

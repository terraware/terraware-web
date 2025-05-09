import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import PlantsPrimaryPage from 'src/components/PlantsPrimaryPage';
import { ButtonProps } from 'src/components/PlantsPrimaryPage/PlantsPrimaryPageView';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { selectObservationsResults } from 'src/redux/features/observations/observationsSelectors';
import {
  selectObservationSchedulableSites,
  selectUpcomingObservations,
} from 'src/redux/features/observations/observationsUtilsSelectors';
import { useAppSelector } from 'src/redux/store';
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
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [plantsSitePreferences, setPlantsSitePreferences] = useState<Record<string, unknown>>();

  const { allPlantingSites, plantingSite, setSelectedPlantingSite } = usePlantingSiteData();

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
  const allObservationsResults = useAppSelector(selectObservationsResults);
  const observationsResults = useMemo(() => {
    if (!allObservationsResults || !plantingSite?.id) {
      return [];
    }

    return allObservationsResults?.filter((observationResult) => {
      const matchesSite = plantingSite.id !== -1 ? observationResult.plantingSiteId === plantingSite.id : true;
      const matchesState = ['Abandoned', 'Completed', 'Overdue', 'InProgress'].indexOf(observationResult.state) !== -1;
      return matchesSite && matchesState;
    });
  }, [allObservationsResults, plantingSite]);

  // get upcoming observations for notifications
  const upcomingObservations = useAppSelector(selectUpcomingObservations);
  // get observation schedulable sites
  const newObservationsSchedulable = useAppSelector(selectObservationSchedulableSites).length;
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
      isEmptyState={!allPlantingSites?.length || !observationsResults?.length}
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

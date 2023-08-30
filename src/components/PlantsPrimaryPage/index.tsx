import React, { useCallback, useEffect, useState } from 'react';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { PreferencesService, TrackingService } from 'src/services';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import PlantsPrimaryPageView from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  title: string;
  text?: string;
  children: React.ReactNode; // primary content for this page
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  pagePath: string;
  lastVisitedPreferenceName: string;
  plantsSitePreferences?: Record<string, unknown>;
  setPlantsSitePreferences: (preferences: Record<string, unknown>) => void;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  // this is to allow redux based components to pass in already selected data
  plantingSitesData?: PlantingSite[];
};

const allSitesOption = (organizationId: number): PlantingSite => ({
  name: strings.ALL,
  id: -1,
  organizationId,
});

export default function PlantsPrimaryPage({
  title,
  text,
  children,
  onSelect,
  pagePath,
  lastVisitedPreferenceName,
  plantsSitePreferences,
  setPlantsSitePreferences,
  allowAllAsSiteSelection,
  isEmptyState,
  plantingSitesData,
}: PlantsPrimaryPageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const history = useHistory();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  useEffect(() => {
    if (plantsSitePreferences) {
      PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
        [lastVisitedPreferenceName]: plantsSitePreferences,
      });
    }
  }, [plantsSitePreferences, lastVisitedPreferenceName, selectedOrganization.id]);

  useEffect(() => {
    const populatePlantingSites = async () => {
      let plantingSitesList: PlantingSite[] | undefined = plantingSitesData;
      if (plantingSitesList === undefined) {
        const serverResponse = await TrackingService.listPlantingSites(
          selectedOrganization.id,
          undefined,
          activeLocale
        );
        if (serverResponse.requestSucceeded) {
          plantingSitesList = serverResponse.sites;
        } else {
          snackbar.toastError();
          return;
        }
      }
      plantingSitesList =
        allowAllAsSiteSelection && plantingSitesList?.length
          ? [allSitesOption(selectedOrganization.id), ...plantingSitesList]
          : plantingSitesList ?? [];
      setPlantingSites(plantingSitesList);
    };
    populatePlantingSites();
  }, [selectedOrganization.id, snackbar, allowAllAsSiteSelection, plantingSitesData, activeLocale]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        history.push(pagePath.replace(':plantingSiteId', site.id.toString()));
      }
    },
    [history, pagePath]
  );

  useEffect(() => {
    const initializePlantingSite = async () => {
      if (plantingSites && plantingSites.length) {
        let lastVisitedPlantingSite: any = {};
        const response = await PreferencesService.getUserOrgPreferences(selectedOrganization.id);
        if (response.requestSucceeded && response.preferences && response.preferences[lastVisitedPreferenceName]) {
          lastVisitedPlantingSite = response.preferences[lastVisitedPreferenceName];
        }
        const plantingSiteIdToUse = plantingSiteId || lastVisitedPlantingSite.plantingSiteId;
        const requestedPlantingSite = plantingSites.find(
          (plantingSite) => plantingSite?.id === parseInt(plantingSiteIdToUse, 10)
        );
        const plantingSiteToUse = requestedPlantingSite || plantingSites[0];

        if (plantingSiteToUse.id !== lastVisitedPlantingSite.plantingSiteId) {
          lastVisitedPlantingSite = { plantingSiteId: plantingSiteToUse.id };
          PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
            [lastVisitedPreferenceName]: lastVisitedPlantingSite,
          });
        }
        setPlantsSitePreferences(lastVisitedPlantingSite);
        if (plantingSiteToUse.id.toString() === plantingSiteId) {
          setSelectedPlantingSite(plantingSiteToUse);
          onSelect(plantingSiteToUse);
        } else {
          setActivePlantingSite(plantingSiteToUse);
        }
      }
    };
    initializePlantingSite();
  }, [
    onSelect,
    plantingSites,
    plantingSiteId,
    setActivePlantingSite,
    selectedOrganization.id,
    lastVisitedPreferenceName,
    setPlantsSitePreferences,
  ]);

  return (
    <PlantsPrimaryPageView
      title={title}
      text={text}
      children={children}
      plantingSites={plantingSites}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      onSelect={setActivePlantingSite}
      isEmptyState={isEmptyState}
    />
  );
}

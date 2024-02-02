import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import { useHistory, useParams } from 'react-router-dom';
import useSnackbar from 'src/utils/useSnackbar';
import { CachedUserService, PreferencesService, TrackingService } from 'src/services';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import PlantsPrimaryPageView, { ButtonProps } from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  actionButton?: ButtonProps;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  lastVisitedPreferenceName: string;
  onSelect: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
  pagePath: string;
  plantsSitePreferences?: Record<string, unknown>;
  // this is to allow redux based components to pass in already selected data
  plantingSitesData?: PlantingSite[];
  setPlantsSitePreferences: (preferences: Record<string, unknown>) => void;
  style?: Record<string, string | number>;
  title: string;
  text?: string;
};

const allSitesOption = (organizationId: number): PlantingSite => ({
  name: strings.ALL,
  id: -1,
  organizationId,
  plantingSeasons: [],
});

export default function PlantsPrimaryPage({
  actionButton,
  allowAllAsSiteSelection,
  children,
  isEmptyState,
  lastVisitedPreferenceName,
  onSelect,
  pagePath,
  plantsSitePreferences,
  plantingSitesData,
  setPlantsSitePreferences,
  style,
  title,
  text,
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
      const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
      if (!_.isEqual(response[lastVisitedPreferenceName], plantsSitePreferences)) {
        PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          [lastVisitedPreferenceName]: plantsSitePreferences,
        });
      }
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
    const initializePlantingSite = () => {
      if (plantingSites && plantingSites.length) {
        let lastVisitedPlantingSite: any = {};
        const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
        if (response[lastVisitedPreferenceName]) {
          lastVisitedPlantingSite = response[lastVisitedPreferenceName];
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
      actionButton={actionButton}
      children={children}
      isEmptyState={isEmptyState}
      onSelect={setActivePlantingSite}
      plantingSites={plantingSites}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      style={style}
      title={title}
      text={text}
    />
  );
}

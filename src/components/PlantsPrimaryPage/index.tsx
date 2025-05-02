import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import _ from 'lodash';

import { useLocalization, useOrganization } from 'src/providers/hooks';
import { CachedUserService, PreferencesService, TrackingService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
import useSnackbar from 'src/utils/useSnackbar';

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
  newHeader?: boolean;
  showGeometryNote?: boolean;
  latestObservationId?: number;
  projectId?: number;
  organizationId?: number;
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
  newHeader,
  showGeometryNote,
  latestObservationId,
  projectId,
  organizationId,
}: PlantsPrimaryPageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { activeLocale } = useLocalization();

  useEffect(() => {
    if (plantsSitePreferences && selectedOrganization.id !== -1) {
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
      if (plantingSitesList === undefined && (selectedOrganization.id !== -1 || organizationId)) {
        const orgIdToUse = selectedOrganization.id !== -1 ? selectedOrganization.id : organizationId;
        const serverResponse = await TrackingService.listPlantingSites(orgIdToUse ?? -1, undefined, activeLocale);
        if (serverResponse.requestSucceeded) {
          plantingSitesList = projectId
            ? serverResponse.sites?.filter((ps) => ps.projectId === projectId)
            : serverResponse.sites;
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
  }, [
    selectedOrganization.id,
    snackbar,
    allowAllAsSiteSelection,
    plantingSitesData,
    activeLocale,
    projectId,
    organizationId,
  ]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        if (projectId) {
          onSelect(site);
          setSelectedPlantingSite(site);
        } else {
          navigate(pagePath.replace(':plantingSiteId', site.id.toString()));
        }
      }
    },
    [navigate, pagePath, projectId]
  );

  useEffect(() => {
    const initializePlantingSite = () => {
      if (plantingSites && plantingSites.length) {
        let lastVisitedPlantingSite: any = {};
        if (selectedOrganization.id !== -1) {
          const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
          if (response[lastVisitedPreferenceName]) {
            lastVisitedPlantingSite = response[lastVisitedPreferenceName];
          }
        }
        const plantingSiteIdToUse = plantingSiteId || lastVisitedPlantingSite.plantingSiteId;
        const requestedPlantingSite = plantingSites.find(
          (plantingSite) => plantingSite?.id === parseInt(plantingSiteIdToUse, 10)
        );
        const plantingSiteToUse = requestedPlantingSite || plantingSites[0];

        if (selectedOrganization.id !== -1) {
          if (plantingSiteToUse.id !== lastVisitedPlantingSite.plantingSiteId) {
            lastVisitedPlantingSite = { plantingSiteId: plantingSiteToUse.id };
            PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
              [lastVisitedPreferenceName]: lastVisitedPlantingSite,
            });
          }
          setPlantsSitePreferences(lastVisitedPlantingSite);
        }

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
    organizationId,
  ]);

  return (
    <PlantsPrimaryPageView
      actionButton={actionButton}
      // eslint-disable-next-line react/no-children-prop
      children={children}
      isEmptyState={isEmptyState}
      onSelect={setActivePlantingSite}
      plantingSites={plantingSites}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      style={style}
      title={title}
      text={text}
      newHeader={newHeader}
      showGeometryNote={showGeometryNote}
      latestObservationId={latestObservationId}
    />
  );
}

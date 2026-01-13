import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers/hooks';
import { CachedUserService, PreferencesService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';

import PlantsPrimaryPageView, { ButtonProps } from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  actionButton?: ButtonProps;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  children: React.ReactNode; // primary content for this page
  lastVisitedPreferenceName: string;
  pagePath: string;
  plantsSitePreferences?: Record<string, unknown>;
  plantingSitesData: PlantingSite[];
  setPlantsSitePreferences: (preferences: Record<string, unknown>) => void;
  style?: Record<string, string | number>;
  title: string;
  text?: string;
  newHeader?: boolean;
  showGeometryNote?: boolean;
  showSurvivalRateMessage?: boolean;
  latestObservationId?: number;
  projectId?: number;
  organizationId?: number;
  onSelect: (plantingSiteId: number) => void;
  onSelectProjectId?: (projectId: number) => void;
};

export default function PlantsPrimaryPage({
  actionButton,
  allowAllAsSiteSelection,
  children,
  lastVisitedPreferenceName,
  pagePath,
  plantsSitePreferences,
  plantingSitesData,
  setPlantsSitePreferences,
  style,
  title,
  text,
  newHeader,
  showGeometryNote,
  showSurvivalRateMessage,
  latestObservationId,
  projectId,
  organizationId,
  onSelect,
  onSelectProjectId,
}: PlantsPrimaryPageProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (plantsSitePreferences && selectedOrganization) {
      const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
      if (!_.isEqual(response[lastVisitedPreferenceName], plantsSitePreferences)) {
        void PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          [lastVisitedPreferenceName]: plantsSitePreferences,
        });
      }
    }
  }, [plantsSitePreferences, lastVisitedPreferenceName, selectedOrganization]);

  const plantingSitesList = useMemo((): PlantingSite[] => {
    const projectSites = projectId
      ? plantingSitesData.filter((site) => site.projectId === projectId || site.id === -1)
      : plantingSitesData;
    const projectSitesWithAll =
      allowAllAsSiteSelection && projectSites.length > 2 ? projectSites : projectSites.filter((site) => site.id !== -1);
    return projectSitesWithAll.toSorted((a, b) => {
      // Keep site with id -1 (allSites) always first
      if (a.id === -1) {
        return -1;
      }
      if (b.id === -1) {
        return 1;
      }
      // Sort other sites
      return a.name.localeCompare(b.name, activeLocale || undefined);
    });
  }, [activeLocale, allowAllAsSiteSelection, plantingSitesData, projectId]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        setSelectedPlantingSite(site);
        if (projectId === undefined) {
          navigate(pagePath.replace(':plantingSiteId', site.id.toString()));
        }
      } else {
        setSelectedPlantingSite(undefined);
      }
    },
    [navigate, pagePath, projectId, setSelectedPlantingSite]
  );

  useEffect(() => {
    const initializePlantingSite = async () => {
      if (plantingSitesList && plantingSitesList.length) {
        let lastVisitedPlantingSite: any = {};
        if (selectedOrganization && !projectId) {
          const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
          if (response[lastVisitedPreferenceName]) {
            lastVisitedPlantingSite = response[lastVisitedPreferenceName];
          }
        }
        const lastPlantingSiteId = Number(lastVisitedPlantingSite.plantingSiteId);
        const paramPlantingSiteId = plantingSiteId ? Number(plantingSiteId) : undefined;

        const plantingSiteIdToUse = !projectId ? paramPlantingSiteId ?? lastPlantingSiteId : lastPlantingSiteId;
        const nextPlantingSite =
          plantingSitesList.find((plantingSite) => plantingSite?.id === plantingSiteIdToUse) ?? plantingSitesList[0];
        const nextPlantingSiteId = nextPlantingSite.id;

        if (selectedOrganization && !projectId) {
          if (nextPlantingSiteId !== lastPlantingSiteId) {
            await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
              [lastVisitedPreferenceName]: { plantingSiteId: nextPlantingSiteId },
            });
          }
          setPlantsSitePreferences({ plantingSiteId: nextPlantingSiteId });
        }

        if (nextPlantingSiteId === plantingSiteIdToUse) {
          setSelectedPlantingSite(nextPlantingSite);
        } else {
          setActivePlantingSite(nextPlantingSite);
        }
      }
    };

    void initializePlantingSite();
  }, [
    projectId,
    plantingSitesList,
    plantingSiteId,
    setActivePlantingSite,
    selectedOrganization,
    lastVisitedPreferenceName,
    setPlantsSitePreferences,
    organizationId,
  ]);

  useEffect(() => {
    if (selectedPlantingSite) {
      onSelect(selectedPlantingSite.id);
    }
  }, [selectedPlantingSite, onSelect]);

  return (
    <PlantsPrimaryPageView
      actionButton={actionButton}
      // eslint-disable-next-line react/no-children-prop
      children={children}
      onSelect={setActivePlantingSite}
      plantingSites={plantingSitesList}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      style={style}
      title={title}
      text={text}
      newHeader={newHeader}
      showGeometryNote={showGeometryNote}
      showSurvivalRateMessage={showSurvivalRateMessage}
      latestObservationId={latestObservationId}
      projectId={projectId}
      onSelectProjectId={onSelectProjectId}
      allowAllAsSiteSelection={allowAllAsSiteSelection}
    />
  );
}

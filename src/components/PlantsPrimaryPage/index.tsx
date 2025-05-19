import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { CachedUserService, PreferencesService } from 'src/services';
import { PlantingSite } from 'src/types/Tracking';

import PlantsPrimaryPageView, { ButtonProps } from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  actionButton?: ButtonProps;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
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
  latestObservationId?: number;
  projectId?: number;
  organizationId?: number;
  onSelect: (plantingSiteId: number) => void;
  onSelectProjectId?: (projectId: number) => void;
  isLoading?: boolean;
};

export default function PlantsPrimaryPage({
  actionButton,
  allowAllAsSiteSelection,
  children,
  isEmptyState,
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
  latestObservationId,
  projectId,
  organizationId,
  onSelect,
  onSelectProjectId,
  isLoading,
}: PlantsPrimaryPageProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [selectedPlantingSite, setSelectedPlantingSite] = useState<PlantingSite>();
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const navigate = useSyncNavigate();

  useEffect(() => {
    if (plantsSitePreferences && selectedOrganization.id !== -1) {
      const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
      if (!_.isEqual(response[lastVisitedPreferenceName], plantsSitePreferences)) {
        void PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          [lastVisitedPreferenceName]: plantsSitePreferences,
        });
      }
    }
  }, [plantsSitePreferences, lastVisitedPreferenceName, selectedOrganization.id]);

  const plantingSitesList = useMemo((): PlantingSite[] => {
    const projectSites = projectId
      ? plantingSitesData.filter((site) => site.projectId === projectId || site.id === -1)
      : plantingSitesData;
    const projectSitesWithAll =
      allowAllAsSiteSelection && projectSites.length > 2 ? projectSites : projectSites.filter((site) => site.id !== -1);
    return projectSitesWithAll.toSorted((a, b) => a.id - b.id);
  }, [plantingSitesData, allowAllAsSiteSelection, selectedOrganization, projectId]);

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
        if (selectedOrganization.id !== -1) {
          const response = CachedUserService.getUserOrgPreferences(selectedOrganization.id);
          if (response[lastVisitedPreferenceName]) {
            lastVisitedPlantingSite = response[lastVisitedPreferenceName];
          }
        }
        const lastPlantingSiteId = Number(lastVisitedPlantingSite.plantingSiteId);
        const paramPlantingSiteId = plantingSiteId ? Number(plantingSiteId) : undefined;

        const plantingSiteIdToUse = paramPlantingSiteId ?? lastPlantingSiteId;
        const nextPlantingSite =
          plantingSitesList.find((plantingSite) => plantingSite?.id === plantingSiteIdToUse) ?? plantingSitesList[0];
        const nextPlantingSiteId = nextPlantingSite.id;

        if (selectedOrganization.id !== -1) {
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
    plantingSitesList,
    plantingSiteId,
    setActivePlantingSite,
    selectedOrganization.id,
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
      isEmptyState={isEmptyState}
      onSelect={setActivePlantingSite}
      plantingSites={plantingSitesList}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      style={style}
      title={title}
      text={text}
      newHeader={newHeader}
      showGeometryNote={showGeometryNote}
      latestObservationId={latestObservationId}
      projectId={projectId}
      onSelectProjectId={onSelectProjectId}
      isLoading={isLoading}
    />
  );
}

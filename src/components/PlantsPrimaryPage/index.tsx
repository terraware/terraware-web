import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import _ from 'lodash';

import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import { CachedUserService, PreferencesService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import PlantsPrimaryPageView, { ButtonProps } from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  actionButton?: ButtonProps;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  lastVisitedPreferenceName: string;
  onSelect?: (plantingSite: PlantingSite) => void; // planting site selected, id of -1 refers to All
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
    if (allowAllAsSiteSelection) {
      return [allSitesOption(selectedOrganization.id), ...plantingSitesData];
    } else {
      return plantingSitesData;
    }
  }, [plantingSitesData, allowAllAsSiteSelection, selectedOrganization]);

  const setActivePlantingSite = useCallback(
    (site: PlantingSite | undefined) => {
      if (site) {
        if (projectId) {
          onSelect?.(site);
          setSelectedPlantingSite(site);
        } else {
          navigate(pagePath.replace(':plantingSiteId', site.id.toString()));
        }
      } else {
        const emptySite = {
          id: -2,
          name: '',
          organizationId: 0,
          plantingSeasons: [],
        };
        setSelectedPlantingSite(emptySite);
        onSelect?.(emptySite);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            lastVisitedPlantingSite = response[lastVisitedPreferenceName];
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

        if (nextPlantingSiteId === paramPlantingSiteId) {
          setSelectedPlantingSite(nextPlantingSite);
          onSelect?.(nextPlantingSite);
        } else {
          setActivePlantingSite(nextPlantingSite);
        }
      }
    };

    void initializePlantingSite();
  }, [
    onSelect,
    plantingSitesList,
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
      plantingSites={plantingSitesList}
      selectedPlantingSiteId={selectedPlantingSite?.id}
      style={style}
      title={title}
      text={text}
      newHeader={newHeader}
      showGeometryNote={showGeometryNote}
      latestObservationId={latestObservationId}
      projectId={projectId}
    />
  );
}

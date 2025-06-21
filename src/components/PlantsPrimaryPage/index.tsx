import React, { useEffect, useMemo } from 'react';

import { PlantingSite } from 'src/types/Tracking';

import PlantsPrimaryPageView, { ButtonProps } from './PlantsPrimaryPageView';

export type PlantsPrimaryPageProps = {
  actionButton?: ButtonProps;
  allowAllAsSiteSelection?: boolean; // whether to support 'All' as a planting site selection
  children: React.ReactNode; // primary content for this page
  isEmptyState?: boolean; // optional boolean to indicate this is an empty state view
  lastVisitedPreferenceName: string;
  plantingSitesData: PlantingSite[];
  style?: Record<string, string | number>;
  title: string;
  text?: string;
  newHeader?: boolean;
  showGeometryNote?: boolean;
  latestObservationId?: number;
  projectId?: number;
  organizationId?: number;
  selectedPlantingSiteId: number | 'all' | undefined;
  onSelect: (plantingSiteId: number | 'all' | undefined) => void;
  onSelectProjectId?: (projectId?: number) => void;
};

export default function PlantsPrimaryPage({
  actionButton,
  allowAllAsSiteSelection,
  children,
  isEmptyState,
  lastVisitedPreferenceName,
  plantingSitesData,
  style,
  title,
  text,
  newHeader,
  showGeometryNote,
  latestObservationId,
  projectId,
  organizationId,
  selectedPlantingSiteId,
  onSelect,
  onSelectProjectId,
}: PlantsPrimaryPageProps): JSX.Element {
  const plantingSitesList = useMemo((): PlantingSite[] => {
    const projectSites = projectId
      ? plantingSitesData.filter((site) => site.projectId === projectId)
      : plantingSitesData;
    return projectSites.toSorted((a, b) => a.id - b.id);
  }, [projectId, plantingSitesData]);

  useEffect(() => {
    if (selectedPlantingSiteId !== 'all' && plantingSitesList.length > 0) {
      if (plantingSitesList.find((site) => site.id === selectedPlantingSiteId) === undefined) {
        onSelect(plantingSitesList[0].id);
      }
    }
  }, [onSelect, plantingSitesList, selectedPlantingSiteId]);

  return (
    <PlantsPrimaryPageView
      actionButton={actionButton}
      allowAllAsSiteSelection={allowAllAsSiteSelection}
      isEmptyState={isEmptyState}
      lastVisitedPreferenceName={lastVisitedPreferenceName}
      onSelect={onSelect}
      plantingSites={plantingSitesList}
      selectedPlantingSiteId={selectedPlantingSiteId}
      style={style}
      title={title}
      text={text}
      newHeader={newHeader}
      showGeometryNote={showGeometryNote}
      latestObservationId={latestObservationId}
      organizationId={organizationId}
      projectId={projectId}
      onSelectProjectId={onSelectProjectId}
    >
      {children}
    </PlantsPrimaryPageView>
  );
}

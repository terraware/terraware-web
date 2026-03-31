import React, { useCallback, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useListObservationResultsQuery } from 'src/queries/generated/observations';
import { useGetPlantingSiteReportedPlantsQuery, useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

import { useLocalization, useOrganization } from '../hooks';
import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();

  const { selectedOrganization } = useOrganization();
  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization?.id;

  const plantingSitesQuery = useListPlantingSitesQuery(
    { organizationId: orgId!, full: false, includeZones: false },
    { skip: !orgId }
  );
  const plantingSites = plantingSitesQuery.data?.sites;
  const skipPlantingSiteQueries = !plantingSite || plantingSite.id === -1;
  const observationResultsQuery = useListObservationResultsQuery(
    { plantingSiteId: plantingSite?.id },
    { skip: skipPlantingSiteQueries }
  );
  const reportedPlantsQuery = useGetPlantingSiteReportedPlantsQuery(plantingSite?.id ?? -1, {
    skip: skipPlantingSiteQueries,
  });

  const allSitesOption = useMemo(() => {
    if (activeLocale && orgId) {
      return {
        name: strings.ALL_PLANTING_SITES,
        id: -1,
        adHocPlots: [],
        organizationId: orgId,
        plantingSeasons: [],
      };
    }
  }, [activeLocale, orgId]);

  const setSelectedPlantingSite = useCallback(
    (plantingSiteId?: number) => {
      let foundSite = plantingSites?.find((site) => site.id === plantingSiteId);
      if (plantingSiteId === -1 && (plantingSites?.length || 0) > 0) {
        foundSite = allSitesOption;
      }
      if (plantingSite !== foundSite) {
        setPlantingSite(foundSite);
      }
    },
    [plantingSites, plantingSite, allSitesOption]
  );

  const allPlantingSites = useMemo(
    () =>
      plantingSites && allSitesOption
        ? [...plantingSites, allSitesOption].toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        : [],
    [activeLocale, allSitesOption, plantingSites]
  );

  const observationResults = observationResultsQuery.currentData?.observations;
  const reportedPlants = reportedPlantsQuery.currentData?.site;

  const isLoading =
    plantingSitesQuery.isFetching || observationResultsQuery.isFetching || reportedPlantsQuery.isFetching;

  const latestResult = useMemo(() => {
    return observationResults?.find(
      (result) =>
        (result.state === 'Completed' || result.state === 'Abandoned') &&
        result.isAdHoc === false &&
        result.type === 'Monitoring'
    );
  }, [observationResults]);

  const { refetch: refetchSites } = plantingSitesQuery;

  const reload = useCallback(() => {
    void refetchSites();
  }, [refetchSites]);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      plantingSiteReportedPlants: reportedPlants,
      setSelectedPlantingSite,
      latestResult,
      isLoading,
      isInitiated: plantingSitesQuery.isSuccess,
      reload,
    }),
    [
      acceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      reportedPlants,
      setSelectedPlantingSite,
      latestResult,
      isLoading,
      plantingSitesQuery.isSuccess,
      reload,
    ]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyListObservationsQuery } from 'src/queries/generated/observations';
import {
  useLazyListPlantingSiteReportedPlantsQuery,
  useLazyListPlantingSitesQuery,
} from 'src/queries/generated/plantingSites';

const useObservablePlantingSites = () => {
  const { selectedOrganization } = useOrganization();
  const [listPlantingSites, listPlantingSitesRepsonse] = useLazyListPlantingSitesQuery();
  const [listObservations, listObservationsResponse] = useLazyListObservationsQuery();
  const [listSitesReportedPlants, listSitesReportedPlantsResponse] = useLazyListPlantingSiteReportedPlantsQuery();

  const allPlantingSites = useMemo(
    () => listPlantingSitesRepsonse.data?.sites ?? [],
    [listPlantingSitesRepsonse.data?.sites]
  );

  const allObservations = useMemo(
    () => listObservationsResponse.data?.observations ?? [],
    [listObservationsResponse.data?.observations]
  );

  const allSitesReportedPlants = useMemo(
    () => listSitesReportedPlantsResponse.data?.sites,
    [listSitesReportedPlantsResponse.data?.sites]
  );
  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, full: true }, true);
      void listSitesReportedPlants({ organizationId: selectedOrganization.id }, true);
      void listObservations({ organizationId: selectedOrganization.id }, true);
    }
  }, [listObservations, listPlantingSites, listSitesReportedPlants, selectedOrganization]);

  const upcomingObservations = useMemo(() => {
    const now = Date.now();
    return allObservations?.filter((observation) => {
      const endTime = new Date(observation.endDate).getTime();
      return observation.state === 'Upcoming' && now <= endTime;
    });
  }, [allObservations]);

  const plantingSitesWithStrataAndNoUpcomingObservations = useMemo(() => {
    if (!allPlantingSites || !allSitesReportedPlants) {
      return [];
    }
    return allPlantingSites.filter((site) => {
      if (!site.strata?.length) {
        return false;
      }
      const sitePlants = allSitesReportedPlants.find((_sitePlants) => _sitePlants.id === site.id);
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
  }, [allPlantingSites, allSitesReportedPlants, upcomingObservations]);

  return plantingSitesWithStrataAndNoUpcomingObservations;
};

export default useObservablePlantingSites;

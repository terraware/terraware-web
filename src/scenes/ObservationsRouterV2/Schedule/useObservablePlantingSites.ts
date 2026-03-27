import { useEffect, useMemo, useState } from 'react';

import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useOrganization } from 'src/providers';
import { useLazyListObservationsQuery } from 'src/queries/generated/observations';
import { useLazyListPlantingSiteReportedPlantsQuery } from 'src/queries/generated/plantingSites';

const useObservablePlantingSites = () => {
  const { selectedOrganization } = useOrganization();
  const [listObservations, listObservationsResponse] = useLazyListObservationsQuery();
  const [listSitesReportedPlants, listSitesReportedPlantsResponse] = useLazyListPlantingSiteReportedPlantsQuery();

  const { allPlantingSites } = useOrganizationPlantingSites(true);
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
      void listSitesReportedPlants({ organizationId: selectedOrganization.id }, true);
      void listObservations({ organizationId: selectedOrganization.id }, true);
    }
  }, [listObservations, listSitesReportedPlants, selectedOrganization]);

  const [now] = useState(() => Date.now());

  const upcomingObservations = useMemo(() => {
    return allObservations?.filter((observation) => {
      const endTime = new Date(observation.endDate).getTime();
      return observation.state === 'Upcoming' && now <= endTime;
    });
  }, [allObservations, now]);

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

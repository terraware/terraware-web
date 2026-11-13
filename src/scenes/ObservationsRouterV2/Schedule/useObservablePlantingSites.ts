import { useEffect, useMemo, useState } from 'react';

import { useFeatureEnabled } from 'src/features';
import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import { useOrganization } from 'src/providers';
import { useLazyListObservationsQuery } from 'src/queries/generated/observations';
import {
  PlantingSiteReportedPlantsPayload,
  useLazyListPlantingSiteReportedPlantsQuery,
} from 'src/queries/generated/plantingSites';
import { PlantingSite } from 'src/types/Tracking';

import { MonitoringType } from './monitoringTypes';

/** Start dates of the upcoming observations that block scheduling another one of the same type. */
export type UpcomingObservationStartDates = Partial<Record<MonitoringType, string>>;

export type ObservablePlantingSite = PlantingSite & {
  hasPlantings: boolean;
  upcomingObservationStartDates: UpcomingObservationStartDates;
};

// The server only lets an observation be scheduled when the site has plantings assigned to a
// substratum, so a site whose plants are all recorded at the site level doesn't qualify.
const hasSubstratumPlantings = (sitePlants?: PlantingSiteReportedPlantsPayload) =>
  sitePlants?.strata.some((stratum) => stratum.substrata.some((substratum) => substratum.totalPlants > 0)) === true;

const useObservablePlantingSites = (): ObservablePlantingSite[] => {
  const { selectedOrganization } = useOrganization();
  const [listObservations, listObservationsResponse] = useLazyListObservationsQuery();
  const [listSitesReportedPlants, listSitesReportedPlantsResponse] = useLazyListPlantingSiteReportedPlantsQuery();
  const biomassSchedulingEnabled = useFeatureEnabled('Scheduled Biomass Monitoring Observations');

  const { plantingSites } = useOrganizationPlantingSites({ full: true });
  const allObservations = useMemo(
    () => listObservationsResponse.currentData?.observations,
    [listObservationsResponse.currentData?.observations]
  );

  const allSitesReportedPlants = useMemo(
    () => listSitesReportedPlantsResponse.currentData?.sites,
    [listSitesReportedPlantsResponse.currentData?.sites]
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

  const observablePlantingSites = useMemo((): ObservablePlantingSite[] => {
    if (!plantingSites || !allSitesReportedPlants || !upcomingObservations) {
      return [];
    }
    return plantingSites.flatMap((site) => {
      if (!site.strata?.some((stratum) => stratum.substrata.length > 0)) {
        return [];
      }
      const sitePlants = allSitesReportedPlants.find((_sitePlants) => _sitePlants.id === site.id);
      const siteHasPlantings = hasSubstratumPlantings(sitePlants);
      const siteUpcomingObservations = upcomingObservations.filter(
        (observation) => observation.plantingSiteId === site.id
      );

      if (!biomassSchedulingEnabled) {
        return !site.strata?.length || !siteHasPlantings || siteUpcomingObservations.length > 0
          ? []
          : [{ ...site, hasPlantings: true, upcomingObservationStartDates: {} }];
      }

      const upcomingObservationStartDates: UpcomingObservationStartDates = {};
      siteUpcomingObservations.forEach((observation) => {
        const blockingStartDate = upcomingObservationStartDates[observation.type];
        if (!blockingStartDate || observation.startDate < blockingStartDate) {
          upcomingObservationStartDates[observation.type] = observation.startDate;
        }
      });

      return [{ ...site, hasPlantings: siteHasPlantings, upcomingObservationStartDates }];
    });
  }, [plantingSites, allSitesReportedPlants, biomassSchedulingEnabled, upcomingObservations]);

  return observablePlantingSites;
};

export default useObservablePlantingSites;

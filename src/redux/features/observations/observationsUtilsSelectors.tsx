import { createSelector } from '@reduxjs/toolkit';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { selectPlantings } from 'src/redux/features/plantings/plantingsSelectors';
import { selectPlantingSiteObservations } from './observationsSelectors';

export const selectUpcomingObservations = createSelector(
  [(state) => selectPlantingSiteObservations(state, -1, 'Upcoming')],
  (upcomingObservations) => {
    if (!upcomingObservations) {
      return [];
    }
    const now = Date.now();
    // return observations that haven't passed
    return upcomingObservations.filter((observation) => now <= new Date(observation.endDate).getTime());
  }
);

export const selectObservationSchedulableSites = createSelector(
  [
    (state) => selectUpcomingObservations(state),
    (state) => selectPlantingSites(state),
    (state) => selectPlantings(state),
  ],
  (upcomingObservations, plantingSites, plantings) => {
    // map sites with plantings
    const sitesWithPlantings = (plantings ?? []).reduce((acc, planting) => {
      const siteId = planting.plantingSite.id;
      const numPlants = planting['numPlants(raw)'];
      acc[siteId] = (acc[siteId] ?? 0) + Number(numPlants);
      return acc;
    }, {} as Record<string, number>);

    // find sites with zones
    const sitesWithZones = (plantingSites ?? []).filter((site) => site.plantingZones?.length);

    // find sites that have zones and plantings
    const sitesWithZonesAndPlantings = sitesWithZones.filter((site) => sitesWithPlantings[site.id.toString()] > 0);

    // find sites with zones and plantings that don't have an upcoming observation
    const observationSchedulableSites = sitesWithZonesAndPlantings.filter(
      (site) => !upcomingObservations.find((observation) => observation.plantingSiteId === site.id)
    );

    return observationSchedulableSites;
  }
);

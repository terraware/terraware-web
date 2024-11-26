import { createSelector } from '@reduxjs/toolkit';

import { selectPlantings } from 'src/redux/features/plantings/plantingsSelectors';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { RootState } from 'src/redux/rootReducer';
import { SiteReportedPlantsData } from 'src/services/TrackingService';
import {
  PlantingSite,
  PlantingSiteSubzoneWithReportedPlants,
  PlantingSiteWithReportedPlants,
  PlantingSiteZoneWithReportedPlants,
} from 'src/types/Tracking';

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
    (state: RootState) => selectUpcomingObservations(state),
    (state: RootState) => selectPlantingSites(state),
    (state: RootState) => selectPlantings(state),
  ],
  (upcomingObservations, plantingSites, plantings): PlantingSite[] => {
    // map sites with plantings
    const sitesWithPlantings = (plantings ?? []).reduce(
      (acc, planting) => {
        const siteId = planting.plantingSite.id;
        const numPlants = planting['numPlants(raw)'];
        acc[siteId] = (acc[siteId] ?? 0) + Number(numPlants);
        return acc;
      },
      {} as Record<string, number>
    );

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

// Merge the reporting data for subzones into the planting sites returned in the above selector
// This is currently only used in the "schedule observation" form which needs the subzone "total plants"
// to determine how to auto populate the form
export const selectObservationSchedulableSitesWithPlantReportData = createSelector(
  [
    (state: RootState) => selectObservationSchedulableSites(state),
    (state: RootState) => state.siteReportedPlantsResults,
  ],
  (plantingSites, reportedPlantsResults): PlantingSiteWithReportedPlants[] => {
    return plantingSites.map((plantingSite): PlantingSiteWithReportedPlants => {
      const plantsResults: SiteReportedPlantsData['site'] | undefined = reportedPlantsResults[plantingSite.id]?.site;
      if (!plantsResults) {
        return plantingSite as PlantingSiteWithReportedPlants;
      }

      return {
        ...plantingSite,
        plantingZones: (plantingSite.plantingZones || []).map((zone): PlantingSiteZoneWithReportedPlants => {
          const plantsResultsZone = plantsResults.plantingZones.find((_zone) => _zone.id === zone.id);
          if (!plantsResultsZone) {
            return zone as PlantingSiteZoneWithReportedPlants;
          }

          return {
            ...zone,
            plantingSubzones: zone.plantingSubzones.map((subzone): PlantingSiteSubzoneWithReportedPlants => {
              const plantsResultsSubzone = plantsResultsZone.plantingSubzones.find(
                (_subzone) => _subzone.id === subzone.id
              );
              if (!plantsResultsSubzone) {
                return subzone as PlantingSiteSubzoneWithReportedPlants;
              }

              return {
                ...subzone,
                totalPlants: plantsResultsSubzone.totalPlants,
              };
            }),
          };
        }),
      };
    });
  }
);

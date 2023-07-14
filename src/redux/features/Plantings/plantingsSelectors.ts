import { RootState } from 'src/redux/rootReducer';
import { selectPlantingSite } from '../tracking/trackingSelectors';
import { createSelector } from '@reduxjs/toolkit';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectPlantingsDateRange = (state: RootState, dateRange: string[]) =>
  selectPlantings(state)?.filter((planting) => {
    if (!dateRange || dateRange.length === 0) {
      return true;
    }
    return planting.createdTime > dateRange[0] && (dateRange.length < 2 || planting.createdTime < dateRange[1]);
  }) ?? [];

export const selectPlantingSiteReportedPlants = (state: RootState, plantingSiteId: number) =>
  state.plantingSiteReportedPlants;

export const selectPlantingProgressSubzones = createSelector(
  [
    (state: RootState, plantingSiteId: number) => selectPlantingSite(state, plantingSiteId),
    (state: RootState, plantingSiteId: number) => selectPlantingSiteReportedPlants(state, plantingSiteId),
  ],
  (plantingSite, plantingSiteReportedPlants) => {
    plantingSite?.plantingZones?.flatMap((zone) => {
      return zone.plantingSubzones.map((sz) => {
        return {
          subzoneName: sz.fullName,
          plantingComplete: sz.plantingCompleted,
          plantingSite: plantingSite.name,
          zone: zone.name,
          targetPlantingDensity: zone.targetPlantingDensity,
          totalSeedlingsSent: plantingSiteReportedPlants.site?.plantingZones
            .find((reportedZone) => reportedZone.id === zone.id)
            ?.plantingSubzones.find((reportedSubzone) => reportedSubzone.id === sz.id)?.totalPlants,
        };
      });
    });
  }
);

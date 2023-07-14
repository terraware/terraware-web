import { RootState } from 'src/redux/rootReducer';
import { selectPlantingSites } from '../tracking/trackingSelectors';
import { createSelector } from '@reduxjs/toolkit';

export const selectPlantings = (state: RootState) => state.plantings?.plantings;

export const selectTotalPlantsBySubzone = (state: RootState) => {
  const plantingsBySubzone: Record<number, { totalPlants: number }> = {};
  state.plantings?.plantings?.forEach((planting) => {
    if (plantingsBySubzone[Number(planting.plantingSubzone.id)]) {
      plantingsBySubzone[Number(planting.plantingSubzone.id)] = {
        totalPlants: plantingsBySubzone[Number(planting.plantingSubzone.id)].totalPlants + planting.totalPlants,
      };
    } else {
      plantingsBySubzone[Number(planting.plantingSubzone.id)] = { totalPlants: planting.totalPlants };
    }
  });
  return plantingsBySubzone;
};

export const selectPlantingsDateRange = (state: RootState, dateRange: string[]) =>
  selectPlantings(state)?.filter((planting) => {
    if (!dateRange || dateRange.length === 0) {
      return true;
    }
    return planting.createdTime > dateRange[0] && (dateRange.length < 2 || planting.createdTime < dateRange[1]);
  }) ?? [];

export const selectPlantingProgressSubzones = createSelector(
  [(state: RootState) => selectPlantingSites(state), (state: RootState) => selectTotalPlantsBySubzone(state)],
  (plantingSites, plantingsBySubzone) => {
    plantingSites?.flatMap((ps) => {
      return ps.plantingZones?.flatMap((zone) => {
        return zone.plantingSubzones.map((sz) => {
          return {
            subzoneName: sz.fullName,
            plantingComplete: sz.plantingCompleted,
            plantingSite: ps.name,
            zone: zone.name,
            targetPlantingDensity: zone.targetPlantingDensity,
            totalSeedlingsSent: plantingsBySubzone[sz.id].totalPlants,
          };
        });
      });
    });
  }
);

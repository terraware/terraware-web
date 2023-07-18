import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';
import { createCachedSelector } from 're-reselect';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;

export const selectSearchPlantingSites = (state: RootState) => state.plantingSitesResults.sites;

export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectZoneProgress = createCachedSelector(
  (state: RootState, plantingSiteId: number) => selectPlantingSite(state, plantingSiteId),
  (plantingSite) => {
    const zoneProgress: Record<number, { name: string; progress: number; targetDensity: number }> = {};
    plantingSite?.plantingZones?.forEach((zone) => {
      let completedPlantingArea = 0;
      zone.plantingSubzones.forEach((sz) => {
        completedPlantingArea += sz.plantingCompleted ? +sz.areaHa : 0;
      });
      const percentProgress = Math.round((100 * completedPlantingArea) / +zone.areaHa);
      zoneProgress[zone.id] = { name: zone.name, progress: percentProgress, targetDensity: zone.targetPlantingDensity };
    });
    return zoneProgress;
  }
)((state: RootState, plantingSiteId: number) => `${plantingSiteId}`);

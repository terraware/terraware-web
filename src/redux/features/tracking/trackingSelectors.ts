import { RootState } from 'src/redux/rootReducer';
import { PlantingSite } from 'src/types/Tracking';
import { createCachedSelector } from 're-reselect';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;

export const selectPlantingSitesSearchResults = (state: RootState) => state.plantingSitesSearchResults.sites;

export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectSiteReportedPlants = (state: RootState, plantingSiteId: number) =>
  state.siteReportedPlantsResults[plantingSiteId]?.site;

export const selectSiteReportedPlantsError = (state: RootState, plantingSiteId: number) =>
  state.siteReportedPlantsResults[plantingSiteId]?.error;

export const selectZoneProgress = createCachedSelector(
  (state: RootState, plantingSiteId: number) => selectPlantingSite(state, plantingSiteId),
  (state: RootState, plantingSiteId: number) => selectSiteReportedPlants(state, plantingSiteId),
  (plantingSite, reportedPlants) => {
    const zoneProgress: Record<number, { name: string; progress: number; targetDensity: number }> = {};
    plantingSite?.plantingZones?.forEach((zone) => {
      const percentProgress = reportedPlants?.plantingZones?.find((z) => z.id === zone.id)?.progressPercent ?? 0;
      zoneProgress[zone.id] = { name: zone.name, progress: percentProgress, targetDensity: zone.targetPlantingDensity };
    });
    return zoneProgress;
  }
)((state: RootState, plantingSiteId: number) => `${plantingSiteId}`);

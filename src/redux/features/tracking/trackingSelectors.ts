import { createCachedSelector } from 're-reselect';
import { RootState } from 'src/redux/rootReducer';
import { PlantingSite, PlantingZone } from 'src/types/Tracking';

export const selectPlantingSites = (state: RootState) => state.tracking?.plantingSites;
export const selectPlantingSitesError = (state: RootState) => state.tracking?.error;

export const selectPlantingSite = (state: RootState, plantingSiteId: number) =>
  selectPlantingSites(state)?.find((site: PlantingSite) => site.id === plantingSiteId);

export const selectPlantingZoneNames = createCachedSelector(
  (state: RootState, plantingSiteId: number) =>
    plantingSiteId !== -1 ? [selectPlantingSite(state, plantingSiteId)] : selectPlantingSites(state),
  (plantingSites) => {
    const plantingZones: PlantingZone[] = (plantingSites ?? [])
      .filter((plantingSite?: PlantingSite) => !!plantingSite?.plantingZones)
      .flatMap((plantingSite?: PlantingSite) => plantingSite!.plantingZones!);

    return Array.from(new Set(plantingZones.map((plantingZone) => plantingZone.name)));
  }
)((state: RootState, plantingSiteId: number) => plantingSiteId.toString());

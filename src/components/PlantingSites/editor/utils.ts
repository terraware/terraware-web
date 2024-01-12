import { PlantingZone } from 'src/types/Tracking';

export type DefaultZonePayload = Omit<PlantingZone, 'plantingSubzones' | 'areaHa'>;

export const defaultZonePayload = (payload: DefaultZonePayload): PlantingZone => {
  const { boundary, id, name, targetPlantingDensity } = payload;

  return {
    areaHa: 0,
    boundary,
    id,
    name,
    plantingSubzones: [
      {
        areaHa: 0,
        boundary,
        fullName: name,
        id,
        name,
        plantingCompleted: false,
      },
    ],
    targetPlantingDensity,
  };
};

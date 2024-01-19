import { Feature } from 'geojson';
import { PlantingSubzone, PlantingZone } from 'src/types/Tracking';
import { toFeature } from 'src/components/Map/utils';

export type DefaultZonePayload = Omit<PlantingZone, 'plantingSubzones' | 'areaHa'>;

export const defaultZonePayload = (payload: DefaultZonePayload): PlantingZone => {
  const { boundary, id, name, targetPlantingDensity } = payload;
  const subzoneName = `subzone-${name}`;

  return {
    areaHa: 0,
    boundary,
    id,
    name,
    plantingSubzones: [
      {
        areaHa: 0,
        boundary,
        fullName: subzoneName,
        id,
        name: subzoneName,
        plantingCompleted: false,
      },
    ],
    targetPlantingDensity,
  };
};

/**
 * Generates incremental ids, uses list of input features to determine next id
 */
export const IdGenerator = (features: Feature[]): (() => number) => {
  let nextId = 0;
  const ids = features
    .filter((f) => !isNaN(Number(f.id)))
    .map((f) => f.id as number)
    .sort();

  if (ids.length) {
    nextId = ids[ids.length - 1];
  }

  return () => {
    nextId++;
    return nextId;
  };
};

/**
 * Utility to generate an identifiable feature payload from input.
 * Properties are 'id' and 'name' for identity
 */
export const toIdentifiableFeature = (
  feature: Feature,
  idGenerator: () => number,
  additionalProperties?: Record<string, string | number | boolean>
) => {
  const id: number = isNaN(Number(feature.id)) ? idGenerator() : (feature.id! as number);
  const properties = {
    id,
    name: feature.properties?.name ?? '',
    ...(additionalProperties || {}),
  };
  return toFeature(feature.geometry, properties, id);
};

/**
 * Utility to generate an identifiable zone feature payload from input
 * This is from newly generated polygon data to a zone feature.
 */
export const toZoneFeature = (feature: Feature, idGenerator: () => number) =>
  toIdentifiableFeature(feature, idGenerator, {
    targetPlantingDensity: feature.properties?.targetPlantingDensity ?? 1500,
  });

/**
 * Utility to generate a feature from planting zone data.
 * This is from BE planting zone data to a zone feature.
 */
export const plantingZoneToFeature = (zone: PlantingZone): Feature => {
  const { boundary, id, name, targetPlantingDensity } = zone;
  return toFeature(boundary, { id, name, targetPlantingDensity }, id);
};

/**
 * Utility to generate a feature from planting subzone data.
 * This is from BE planting subzone data to a subzone feature.
 */
export const plantingSubzoneToFeature = (subzone: PlantingSubzone): Feature => {
  const { boundary, id, name } = subzone;
  return toFeature(boundary, { id, name }, id);
};

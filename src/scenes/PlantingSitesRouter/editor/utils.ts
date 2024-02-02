import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import area from '@turf/area';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import { PlantingSubzone, PlantingZone } from 'src/types/Tracking';
import { toFeature } from 'src/components/Map/utils';

const SQ_M_TO_HECTARES = 1 / 10000;

export type DefaultZonePayload = Omit<PlantingZone, 'plantingSubzones' | 'areaHa'>;

export const defaultZonePayload = (payload: DefaultZonePayload): PlantingZone => {
  const { boundary, id, name, targetPlantingDensity } = payload;
  const subzoneName = 'A';

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
  let nextId = features
    .map((f) => Number(f.id))
    .filter((id) => !isNaN(id))
    .reduce((a, b) => Math.max(a, b), -1);

  return () => {
    return ++nextId;
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

/**
 * generate string for number in alphabetical order looping through all alphabets
 * 1 -> A, 2 -> B, 26 -> Z, 27 -> AA, etc.
 * Source: https://codereview.stackexchange.com/questions/16124/implement-numbering-scheme-like-a-b-c-aa-ab-aaa-similar-to-converting
 */
export const alphabetName = (position: number): string => {
  const baseChar = 'A'.charCodeAt(0);
  let name = '';

  do {
    position -= 1;
    name = String.fromCharCode(baseChar + (position % 26)) + name;
    position = Math.floor(position / 26);
  } while (position > 0);

  return name;
};

/**
 * Subzone name generator.
 * Generates names in alphabetical order, whose values are in
 * A - Z
 * AA - AZ
 * BA - BZ
 * and so on.
 */
export const subzoneNameGenerator = (usedNames: Set<string>): string => {
  let nextNameIndex = 0;
  let nextName = '';

  do {
    nextName = alphabetName(++nextNameIndex);
  } while (usedNames.has(nextName));

  return nextName;
};

/**
 * Get area of bbox of polygon in hectares
 */
export const boundingAreaHectares = (geometry: MultiPolygon | Polygon): number => {
  return parseFloat((area(bboxPolygon(bbox(geometry))) * SQ_M_TO_HECTARES).toFixed(2));
};

/**
 * empty boundary
 */
export const emptyBoundary = (): FeatureCollection => ({ type: 'FeatureCollection', features: [] });

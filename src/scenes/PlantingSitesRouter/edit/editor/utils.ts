import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
import area from '@turf/area';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import { MinimalPlantingSubzone, MinimalPlantingZone } from 'src/types/Tracking';
import { GeometryFeature } from 'src/types/Map';
import { cutPolygons, toFeature } from 'src/components/Map/utils';

const SQ_M_TO_HECTARES = 1 / 10000;

export type DefaultZonePayload = Omit<MinimalPlantingZone, 'plantingSubzones'>;

export const defaultZonePayload = (payload: DefaultZonePayload): MinimalPlantingZone => {
  const { boundary, id, name, targetPlantingDensity } = payload;
  const subzoneName = 'A';

  return {
    boundary,
    id,
    name,
    plantingSubzones: [
      {
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
export const plantingZoneToFeature = (zone: MinimalPlantingZone): Feature => {
  const { boundary, id, name, targetPlantingDensity } = zone;
  return toFeature(boundary, { id, name, targetPlantingDensity }, id);
};

/**
 * Utility to generate a feature from planting subzone data.
 * This is from BE planting subzone data to a subzone feature.
 */
export const plantingSubzoneToFeature = (subzone: MinimalPlantingSubzone): Feature => {
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

/**
 * Utility to select updated feature by diffing old and new states of a feature collections
 * @param previous
 *  previous state of a feature collection
 * @param latest
 *  latest state of a feature collection
 * @returns Updated feature if there are new features, otherwise existing feature if present else undefined
 */
export const getLatestFeature = (
  previous?: FeatureCollection,
  latest?: FeatureCollection
): GeometryFeature | undefined => {
  // pick the latest geometry that was drawn
  const latestFeature =
    latest?.features && latest.features.length > 1
      ? latest?.features?.filter((f1) => !previous?.features?.find((f2) => f2.id === f1.id))?.[0]
      : latest?.features?.[0];
  return latestFeature as GeometryFeature;
};

/**
 * Cut boundaries from an input feature collection of boundaries and an overlay cut geometry
 * @param source
 *  input feature collection to further divide into boundaries
 * @param cutWith
 *  polygon to use as the cutting boundary overlay
 * @param errorText
 *  error message to use in error annotations
 * @param minimumSideDimension
 *  minimum side of a square in meters, that needs to be contained within each cut zone (eg. 100 for 100m x 100m)
 * @param onSuccess
 *  callback on success, which accepts the new list of cut boundaries
 * @param onError
 *  callback when the cut geometries are too small, or there were no new cut geometries due to no overlap,
 *  callback accepts list of error annotation features
 */
export type CutData = {
  cutWithFeature?: GeometryFeature;
  errorText: string;
  minimumSideDimension: number;
  source?: FeatureCollection;
};
export const cutOverlappingBoundaries = (
  data: CutData,
  onSuccess: (cutBoundaries: GeometryFeature[]) => void,
  onError: (errorAnnotations: Feature[]) => void
) => {
  const { cutWithFeature, errorText, minimumSideDimension, source } = data;
  if (!source || !cutWithFeature) {
    onError([]);
    return;
  }

  const minArea = minimumSideDimension * minimumSideDimension * SQ_M_TO_HECTARES;

  // cut new polygons using the cut geometry overlapping the fixed boundaries
  const cutBoundaries = cutPolygons(source!.features as GeometryFeature[], cutWithFeature!.geometry) || [];

  // check if the cut polygons are too small to be boundaries (in which case, we won't create new fixed boundaries using the cut polygons)
  // mark them as error annotations instead
  const boundariesTooSmall = cutBoundaries
    .filter((boundary) => boundingAreaHectares(boundary.geometry) < minArea) // (stopgap until we have BE supported API for size validation)
    .map((boundary) => ({ ...boundary, properties: { errorText, fill: true } }));

  if (cutBoundaries.length && !boundariesTooSmall.length) {
    onSuccess(cutBoundaries);
  } else {
    onError(boundariesTooSmall);
  }
};

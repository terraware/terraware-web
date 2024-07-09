import area from '@turf/area';
import bbox from '@turf/bbox';
import bboxPolygon from '@turf/bbox-polygon';
import { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';

import { overlayAndSubtract, toFeature, toMultiPolygon } from 'src/components/Map/utils';
import strings from 'src/strings';
import { GeometryFeature } from 'src/types/Map';
import { DraftPlantingSite, PlantingSiteProblem } from 'src/types/PlantingSite';
import { MinimalPlantingSubzone, MinimalPlantingZone } from 'src/types/Tracking';
import { TrackingService } from 'src/services';
import { fromDraftToCreate } from 'src/utils/draftPlantingSiteUtils';
import union from '@turf/union';

export const SQ_M_TO_HECTARES = 1 / 10000;

export type DefaultZonePayload = Omit<MinimalPlantingZone, 'plantingSubzones'>;

export const defaultZonePayload = (payload: DefaultZonePayload): MinimalPlantingZone => {
  const { boundary, id, name, targetPlantingDensity } = payload;
  const subzoneName = subzoneNameGenerator(new Set(), strings.SUBZONE);

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
export const subzoneNameGenerator = (usedNames: Set<string>, prefix?: string): string => {
  let nextNameIndex = 0;
  let nextName = '';

  do {
    const subzoneNameVal = alphabetName(++nextNameIndex);
    nextName = prefix ? `${prefix} ${subzoneNameVal}` : subzoneNameVal;
  } while (usedNames.has(nextName));

  return nextName;
};

/**
 * Zone name generator.
 * Generates names in numerical order, with 2 digits with leading 0
 */
export const zoneNameGenerator = (usedNames?: Set<string>, prefix?: string): string => {
  let nextNameIndex = 0;
  let nextName = '';

  do {
    const zoneNum = `${++nextNameIndex}`.padStart(2, '0');
    nextName = prefix ? `${prefix} ${zoneNum}` : zoneNum;
  } while (usedNames && usedNames.has(nextName));

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
 * @param errorCheckLevel
 *  level at which to check errors for
 * @param createDraftSiteWith
 *  callback to create a draft site with the cut boundaries, to be used for error checking
 * @param onSuccess
 *  callback on success, which accepts the new list of cut boundaries
 * @param onError
 *  callback when the cut geometries are too small, or there were no new cut geometries due to no overlap,
 *  callback accepts list of error annotation features
 */
export type ErrorCheckLevel = 'site_boundary' | 'exclusion' | 'zone' | 'subzone';
export type CutData = {
  cutWithFeature?: GeometryFeature;
  errorCheckLevel: ErrorCheckLevel;
  createDraftSiteWith: (cutBoundaries: GeometryFeature[]) => DraftPlantingSite;
  source?: FeatureCollection;
};
export const cutOverlappingBoundaries = async (
  data: CutData,
  onSuccess: (cutBoundaries: GeometryFeature[]) => void,
  onError: (errorAnnotations: Feature[]) => void
) => {
  const { cutWithFeature, createDraftSiteWith, source } = data;
  if (!source || !cutWithFeature) {
    onError([]);
    return;
  }

  // overlay new polygon over existing polygons
  const cutBoundaries = overlayAndSubtract(source.features as GeometryFeature[], cutWithFeature.geometry) || [];

  if (!cutBoundaries.length) {
    onError([]);
    return;
  }

  const errors = await findErrors(createDraftSiteWith(cutBoundaries));
  console.log(errors)

  if (!errors.length) {
    onSuccess(cutBoundaries);
  } else {
    onError(errors);
  }
};

/**
 * Find errors in the draft site with a dry-run planting site creation.
 * The response contains error annotation information, if any.
 */
export const findErrors = async (draft: DraftPlantingSite): Promise<Feature[]> => {
  // TODO: use BE API
  // 1. do a dry-run of planting site create with the input 'draft'
  // 2. check problems returned
  // 3. map problems to error annotation with boundary of
  //    site or exclusion or zone or subzone mentioned in the problem
  // 4. map problem type to a string.<mapped_string_for_problem> as errorText
  if (!draft) {
    return [];
  }

  const payload = fromDraftToCreate(draft);

  const result = await TrackingService.validatePlantingSite(payload)
  if (result.requestSucceeded && result.data) {
    if (result.data.isValid) {
      return []
    } else {
      return result.data.problems.map((value, index) => problemToFeature(draft, value, index)).filter((item) : item is Feature => item !== null);
    }
  } else {
    return Promise.reject('Server error on validation.')
  }
};

/**
 * @returns the geometry feature to draw for the problem, or null if it is not a drawable problem
 */
const problemToFeature = (draft: DraftPlantingSite, problem: PlantingSiteProblem, index: number) : Feature | null => {
  if (!draft.boundary) {
    return null;
  }
  // TODO: consider showing a list of problems, and toggle to show feature per problem? 
  const problemZone = problem.plantingZone ? draft.plantingZones?.find((zone) => zone.name === problem.plantingZone) : null;
  if (problemZone && !problemZone.boundary) {
    return null;
  }

  const problemSubzone = problem.plantingSubzone ? problemZone?.plantingSubzones?.find((subzone) => subzone.name === problem.plantingSubzone) : null;
  if (problemSubzone && !problemSubzone.boundary) {
    return null;
  }
  
  const errorText = problemToText(draft, problem);
  console.log(problem)

  switch (problem.problemType) {
    case 'SiteTooLarge':
      // Site errors
      return { type: 'Feature', geometry: draft.boundary, properties: { errorText, fill: true }, id: index }
    case 'CannotRemovePlantedSubzone':
    case 'CannotSplitSubzone':
    case 'SubzoneBoundaryChanged':
    case 'SubzoneInExclusionArea':
    case 'SubzoneNotInZone':
      // Single subzone errors
      return problemSubzone ? { type: 'Feature', geometry: problemSubzone.boundary, properties: { errorText, fill: true }, id: index } : null
    case 'CannotSplitZone':
    case 'ZoneBoundaryChanged':
    case 'ZoneHasNoSubzones':
    case 'ZoneNotInSite':
    case 'ZoneTooSmall':
      // Single zone errors
      return problemZone ? { type: 'Feature', geometry: problemZone.boundary, properties: { errorText, fill: true }, id: index } : null
    case 'SubzoneBoundaryOverlaps':
      // Multiple subzones errors
      const otherSubzoneBoundaries = problem.conflictsWith
        ?.map((subzoneName) => problemZone?.plantingSubzones?.find((subzone) => subzone.name === subzoneName)?.boundary)
        ?.filter((boundary) : boundary is MultiPolygon => boundary !== undefined) ?? [];
      if (problemSubzone?.boundary) {
        otherSubzoneBoundaries.push(problemSubzone.boundary);
      }
      const subzonePoly = otherSubzoneBoundaries.reduce((acc: MultiPolygon, curr: MultiPolygon): MultiPolygon => {
          const unionResult = union(acc, curr);
          const multiPolygon = unionResult ? toMultiPolygon(unionResult.geometry) : null;
          return multiPolygon || curr;
        });
      return { type: 'Feature', geometry: subzonePoly, properties: { errorText, fill: true }, id: index }
    case 'ZoneBoundaryOverlaps':
      // Multiple zones erros
      const otherZoneBoundaries = problem.conflictsWith
        ?.map((zoneName) => draft.plantingZones?.find((zone) => zone.name === zoneName)?.boundary)
        ?.filter((boundary) : boundary is MultiPolygon => boundary !== undefined) ?? [];
      if (problemZone?.boundary) {
        otherZoneBoundaries.push(problemZone.boundary);
      }
      const zonePoly = otherZoneBoundaries.reduce((acc: MultiPolygon, curr: MultiPolygon): MultiPolygon => {
          const unionResult = union(acc, curr);
          const multiPolygon = unionResult ? toMultiPolygon(unionResult.geometry) : null;
          return multiPolygon || curr;
        });
      return { type: 'Feature', geometry: zonePoly, properties: { errorText, fill: true }, id: index }
    case 'DuplicateSubzoneName':
    case 'DuplicateZoneName':
    case 'ExclusionWithoutBoundary':
    case 'ZonesWithoutSiteBoundary':
      // Text only errors:
      // TODO: add non-feature error types
      return null
  }

  return null;
}

/**
 * 
 * @returns the text to show for the problem
 */
const problemToText = (draft: DraftPlantingSite, problem: PlantingSiteProblem) : string => {
  // const problemZone = problem.plantingZone ? draft.plantingZones?.find((zone) => zone.id === Number(problem.plantingZone)) : null;
  // const problemSubzone = problem.plantingSubzone ? problemZone?.plantingSubzones?.find((subzone) => subzone.id === Number(problem.plantingSubzone)) : null;
  
  // TODO Add translatable strings for each user visible problem
  switch (problem.problemType) {
    case 'CannotRemovePlantedSubzone':
    case 'CannotSplitSubzone':
    case 'CannotSplitZone':
    case 'DuplicateSubzoneName':
    case 'DuplicateZoneName':
    case 'ExclusionWithoutBoundary':
    case 'SiteTooLarge':
    case 'SubzoneBoundaryChanged':
    case 'SubzoneBoundaryOverlaps':
    case 'SubzoneInExclusionArea':
    case 'SubzoneNotInZone':
    case 'ZoneBoundaryChanged':
    case 'ZoneBoundaryOverlaps':
    case 'ZoneHasNoSubzones':
    case 'ZoneNotInSite':
    case 'ZoneTooSmall':
    case 'ZonesWithoutSiteBoundary':
  }

  return problem.problemType;
}
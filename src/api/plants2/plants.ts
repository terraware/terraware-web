import axios from 'src/api/index';
import {paths} from 'src/api/types/generated-schema';
import {
  Coordinate,
  Plant,
  PlantErrorByLayerId,
  PlantRequestError, PlantsByLayerId,
  PlantSummariesByLayerId,
  PlantSummary,
} from 'src/types/Plant';
import addQueryParams from 'src/api/addQueryParams';
import {SpeciesById} from 'src/types/Species';
import {getAllSpecies} from 'src/api/species/species';

/*
 * All functions in this module ALWAYS return a promise that resolves. Any errors will be caught and
 * surfaced to the caller in the return object.
 */

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

const LIST_PLANTS_ENDPOINT = '/api/v1/gis/plants/list/{layerId}';
type ListPlantsQuery = paths[typeof LIST_PLANTS_ENDPOINT]['get']['parameters']['query'];
type ListPlantsResponse = paths[typeof LIST_PLANTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type ListPlantsResponseElement = ListPlantsResponse['list'][0];
type Geometry = ListPlantsResponseElement['geom'];

/*
 * getPlants() will not include the species name on the Plant objects unless the caller provides speciesById.
 */
export type GetPlantsResponse = {
  layerId: number;
  plantsWithoutSpeciesName: Plant[];  // Will be empty if an error occurred.
  error: PlantRequestError | null;
};

export async function getPlants(
  layerId: number,
  speciesById?: SpeciesById,
  filters?: ListPlantsQuery, // The client code knows this type as PlantSearchOptions.
): Promise<GetPlantsResponse> {
  const response: GetPlantsResponse = {layerId, plantsWithoutSpeciesName: [], error: null};
  let endpoint = `${BASE_URL}${LIST_PLANTS_ENDPOINT}`.replace('{layerId}', `${layerId}`);
  if (filters) {
    endpoint = addQueryParams(endpoint, filters);
  }

  try {
    const apiList : ListPlantsResponseElement[] = (await axios.get(endpoint)).data.list;

    response.plantsWithoutSpeciesName = apiList.map((plant) => {
      const coords: Coordinate | undefined = plant.geom?.coordinates
        ? { longitude: plant.geom.coordinates[0],
            latitude: plant.geom.coordinates[1] }
        : undefined;

      let speciesName;
      if (plant.speciesId && speciesById) {
        if (speciesById.has(plant.speciesId)) {
          speciesName = speciesById.get(plant.speciesId)?.name;
        } else {
          console.error(`Cannot find species name for species ID ${plant.speciesId}, on feature ${plant.featureId}`);
        }
      }

      return {
        featureId: plant.featureId,
        layerId,
        coordinates: coords,
        notes: plant.notes,
        enteredTime: plant.enteredTime,
        speciesId: plant.speciesId,
        speciesName,
      };
    });
  } catch(error) {
    console.error(error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      response.error = PlantRequestError.LayerIdNotFound;
    } else {
      response.error = PlantRequestError.RequestFailed;
    }
  }

  return response;
}

/*
 * You most likely don't want to use this function directly. Prefer to use getPlantsAndSpecies(), which
 * fetches the species map so that this function can return Plant objects that include a species name.
 */
export type GetAllPlantsResponse = {
  plantsByLayerId: PlantsByLayerId;
  plantErrorByLayerId: PlantErrorByLayerId;
};

async function getPlantsForMultipleLayers(
  layerIds: number[],
  speciesById?: SpeciesById,
): Promise<GetAllPlantsResponse> {
  const promises = layerIds.map((id) => (getPlants(id, speciesById)));
  const plantsResponseList : GetPlantsResponse[] = await Promise.all(promises);

  const response: GetAllPlantsResponse = {
    plantsByLayerId: new Map(),
    plantErrorByLayerId: new Map(),
  };

  plantsResponseList.forEach((plantResponse) => {
    if (plantResponse.error) {
      response.plantErrorByLayerId.set(plantResponse.layerId, plantResponse.error);
    } else {
      response.plantsByLayerId.set(plantResponse.layerId, plantResponse.plantsWithoutSpeciesName);
    }
  });

  return response;
}

/*
 * If we failed to fetch species names,
 *    speciesRequestSucceeded will be false
 *    the Plant objects in plantsByLayerId will only include species IDs, not species names
 * If we failed to fetch plants for any of the requested layer IDs,
 *    plantsByLayerId will not include that layer ID
 *    plantErrorByLayerId will include an error message for that layer ID
 */
export type GetPlantsAndSpeciesResponse = {
  plantsByLayerId: PlantsByLayerId;
  plantErrorByLayerId: PlantErrorByLayerId;
  speciesById: SpeciesById;
  speciesRequestSucceeded: boolean;
};

export async function getPlantsAndSpecies (
  layerIds: number[],
): Promise<GetPlantsAndSpeciesResponse> {

  // Fetch this synchronously so that we can pass the species list to getPlantsForMultipleLayers().
  // The alternative would be to add species names to the Plant objects returned from getPlantsForMultipleLayers().
  // However, that seems overly complicated and could take up a lot of memory because we'd be duplicating
  // a (possibly) large map of arrays.
  const {speciesById, requestSucceeded} = await getAllSpecies();
  const {plantsByLayerId, plantErrorByLayerId} = await getPlantsForMultipleLayers(
    layerIds, requestSucceeded ? speciesById : undefined
  );

  return {
    plantsByLayerId,
    plantErrorByLayerId,
    speciesById,
    speciesRequestSucceeded: requestSucceeded,
  };
}

const PLANT_SUMMARY_ENDPOINT = '/api/v1/gis/plants/list/summary/{layerId}';
type PlantSummaryQuery = paths[typeof PLANT_SUMMARY_ENDPOINT]['get']['parameters']['query'];
type PlantSummaryResponse = paths[typeof PLANT_SUMMARY_ENDPOINT]['get']['responses'][200]['content']['application/json'];

export type GetPlantSummaryResponse = {
  layerId: number;
  maxEnteredTime: Date;
  summary: PlantSummary | null;  // Will be null if an error occurred.
  error: PlantRequestError | null;
};

export async function getPlantSummary (
  layerId: number,
  maxEnteredTime: Date,
): Promise<GetPlantSummaryResponse> {
  let endpoint = `${BASE_URL}${PLANT_SUMMARY_ENDPOINT}`.replace('{layerId}', `${layerId}`);
  // Put maxEnteredTime inside an object to type check it against the autogenerated PlantSummaryQuery type.
  const queryParams: PlantSummaryQuery = {maxEnteredTime: maxEnteredTime.toISOString()};
  endpoint = addQueryParams(endpoint, queryParams);

  const response: GetPlantSummaryResponse = {
    layerId,
    maxEnteredTime,
    summary: {
      numSpecies: 0,
      numPlants: 0,
    },
    error: null,
  };

  try {
    const apiResponse: PlantSummaryResponse = (await axios.get(endpoint)).data;
    for (const speciesId in apiResponse.summary) {
      // https://palantir.github.io/tslint/rules/forin/
      if (apiResponse.summary.hasOwnProperty(speciesId)) {
        // We initialized response.summary to be not null
        response.summary!!.numSpecies += 1;
        response.summary!!.numPlants += apiResponse.summary[speciesId];
      }
    }
  } catch (error) {
    console.error(error);
    // Ensure that we don't return an incomplete summary list.
    response.summary = null;
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      response.error = PlantRequestError.LayerIdNotFound;
    } else {
      response.error = PlantRequestError.RequestFailed;
    }
  }

  return response;
}

/*
 * PlantSummaries will only be returned when we were able to fetch both this week's and last week's
 * data. Otherwise, the layer ID will be associated with the first error message we encountered.
 * The failure to fetch a PlantSummaries object for one layer ID will not affect the return data
 * for the other requested layer IDs.
 */
export type GetPlantSummariesResponse = {
  plantSummariesByLayerId: PlantSummariesByLayerId;
  plantErrorByLayerId: PlantErrorByLayerId;
};

export async function getPlantSummaries(layerIds: number[]): Promise<GetPlantSummariesResponse> {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const promises = layerIds.map((layerId) => {
    return [getPlantSummary(layerId, today), getPlantSummary(layerId, oneWeekAgo)];
  }).flat();
  const plantSummaryResponseList: GetPlantSummaryResponse[] = await Promise.all(promises);
  const thisWeekSummary = plantSummaryResponseList.filter((summary: GetPlantSummaryResponse) => {
    return summary.maxEnteredTime.getDate() === today.getDate();
  });
  const lastWeekSummary = plantSummaryResponseList.filter((summary: GetPlantSummaryResponse) => {
    return summary.maxEnteredTime.getDate() === oneWeekAgo.getDate();
  });

  const currSummaries: PlantSummariesByLayerId = new Map();
  const currSummaryErrors: PlantErrorByLayerId = new Map();

  thisWeekSummary.forEach((summary: GetPlantSummaryResponse) => {
    if (summary.error) {
      currSummaryErrors.set(summary.layerId, summary.error);
    } else {
      currSummaries.set(summary.layerId, {
        thisWeek: summary.summary,
        lastWeek: null
      });
    }
  });

  lastWeekSummary.forEach((summary: GetPlantSummaryResponse) => {
    if (currSummaryErrors.has(summary.layerId)) {
      return;
    } else if (summary.error) {
      currSummaryErrors.set(summary.layerId, summary.error);
      // Don't return any summary data if we couldn't fetch last week's data
      currSummaries.delete(summary.layerId);
    } else {
      const currSummary = currSummaries.get(summary.layerId)!!;
      currSummaries.set(summary.layerId, {...currSummary, lastWeek: summary.summary});
    }
  });

  return {
    plantSummariesByLayerId: currSummaries,
    plantErrorByLayerId: currSummaryErrors,
  };
}

const FEATURE_ENDPOINT = '/api/v1/gis/features/{featureId}';
type UpdateFeatureRequest = paths[typeof FEATURE_ENDPOINT]['put']['requestBody']['content']['application/json'];
type UpdateFeatureResponse = paths[typeof FEATURE_ENDPOINT]['put']['responses']['200']['content']['application/json'];
type FeaturePayload = UpdateFeatureResponse['feature'];

const PLANT_ENDPOINT = '/api/v1/gis/plants/{featureId}';
type UpdatePlantRequest = paths[typeof PLANT_ENDPOINT]['put']['requestBody']['content']['application/json'];
type UpdatePlantResponse = paths[typeof PLANT_ENDPOINT]['put']['responses']['200']['content']['application/json'];
type PlantPayload = UpdatePlantResponse['plant'];

/*
 * PutPlantResponse.plant WILL NEVER BE EMPTY! The caller must examine PutPlantResponse.error to determine
 * if the API call succeeded. In the event of a failure,
 *    plant = the plant we attempted to update
 *    error = the error
 * In the event of a success,
 *    plant = the plant data returned from the server
 *    error = null
 */
export type PutPlantResponse = {
  plant: Plant;
  error: PlantRequestError | null;
};

export async function putPlant (
  plant: Plant
): Promise<PutPlantResponse> {
  const response: PutPlantResponse = { plant, error: null };
  try {
    const featureEndpoint = `${BASE_URL}${FEATURE_ENDPOINT}`.replace('{featureId}', `${plant.featureId}`);
    const geom : Geometry | undefined =  plant.coordinates
      ? { type : 'Point', coordinates: [plant.coordinates.longitude, plant.coordinates.latitude]}
      : undefined;
    const featureRequest: UpdateFeatureRequest = {
      layerId: plant.layerId,
      geom,
      notes: plant.notes,
      enteredTime: plant.enteredTime,
    };
    const featureResponse: FeaturePayload = (await axios.put(featureEndpoint, featureRequest)).data.feature;

    const coordinateResponse: Coordinate | undefined =
      featureResponse.geom && Array.isArray(featureResponse.geom.coordinates)
        ? { longitude: featureResponse.geom.coordinates[0],
            latitude: featureResponse.geom.coordinates[1] }
        : undefined;

    const plantEndpoint = `${BASE_URL}${PLANT_ENDPOINT}`.replace('{featureId}', `${plant.featureId}`);
    const updatePlantRequest: UpdatePlantRequest = {
      speciesId: plant.speciesId,
    };
    const plantResponse : PlantPayload = (await axios.put(plantEndpoint, updatePlantRequest)).data.plant;

    response.plant = {
      featureId: featureResponse.id,
      layerId: featureResponse.layerId,
      coordinates: coordinateResponse,
      notes: featureResponse.notes,
      enteredTime: featureResponse.enteredTime,
      speciesId: plantResponse.speciesId,
    };
  } catch(error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      response.error = PlantRequestError.FeatureIdNotFound;
    } else {
      response.error = PlantRequestError.RequestFailed;
    }
    // Don't return partially updated data.
    response.plant = plant;
  }

  return response;
}

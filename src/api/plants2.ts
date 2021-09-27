import axios from 'axios';
import {components} from './types/generated-schema';
import Plant, {Coordinate, PlantSummary, SearchOptions} from '../types/Plant';

type ListPlantsResponseElement = components['schemas']['ListPlantsResponseElement'];
type PlantSummaryResponse = components['schemas']['PlantSummaryResponsePayload'];
type UpdateFeatureRequestPayload = components['schemas']['UpdateFeatureRequestPayload'];
type FeatureResponse = components['schemas']['FeatureResponse'];
type UpdatePlantRequestPayload = components['schemas']['UpdatePlantRequestPayload'];
type PlantResponse = components['schemas']['PlantResponse'];
type Geometry = components['schemas']['Geometry'];
type Point = components['schemas']['Point'];

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/gis`;

export const getPlants = async (
    layerId: number,
    filters?: SearchOptions,
): Promise<Plant[]> => {
  let endpoint = `${BASE_URL}/plants/list/${layerId}`;

  if (filters) {
    type SearchOptionsKeys = keyof SearchOptions;
    const keys = Object.keys(filters) as SearchOptionsKeys[];
    keys.forEach((key) => {
      if (filters[key]) {
        endpoint = endpoint.includes('?')
            ? endpoint.concat('&')
            : endpoint.concat('?');
        endpoint = endpoint.concat(`${key}=${filters[key]}`);
      }
    });
  }

  const apiList : ListPlantsResponseElement[] = (await axios.get(endpoint)).data.list;

  return apiList.map((plant) => {
    const coords : Coordinate | undefined = plant.geom && plant.geom.coordinates
        ? { longitude: plant.geom.coordinates[0] as number,
            latitude: plant.geom.coordinates[1] as number }
        : undefined;

    return {
      featureId: plant.featureId,
      layerId,
      coordinates: coords,
      notes: plant.notes,
      enteredTime: plant.enteredTime,
      speciesId: plant.speciesId,
    };
  });
};

export const getPlantSummary = async (
    layerId: number,
    maxEnteredTime: string
): Promise<PlantSummary[]> => {
  const endpoint = `${BASE_URL}/plants/list/summary/${layerId}?maxEnteredTime=${maxEnteredTime}`;

  try {
    const apiResponse = await axios.get(endpoint);
    const data : PlantSummaryResponse = apiResponse.data;
    if (data.status !== 'ok') {
      console.error(`Server returned error status when calling ${endpoint}`);
      return [];
    }
    const apiSummary = apiResponse.data.summary;
    const plantSummary : PlantSummary[] = [];
    // tslint:disable-next-line:forin
    for (const key in apiSummary) {
      plantSummary.push({
        speciesId: Number(key),
        count: apiSummary[key],
      });
    }
    return plantSummary;
  } catch (err) {
    console.error(err);
    return [];
  }

};

export const putPlant = async (
    plant: Plant
): Promise<Plant> => {
  const featureEndpoint = `${BASE_URL}/features/${plant.featureId}`;
  const geom : Geometry | undefined =  plant.coordinates
      ? { type : 'Point', coordinates: [plant.coordinates.longitude, plant.coordinates.latitude]}
      : undefined;
  const featureRequest : UpdateFeatureRequestPayload = {
    layerId: plant.layerId,
    geom,
    notes: plant.notes,
    enteredTime: plant.enteredTime,
  };
  const featureResponse : FeatureResponse = (await axios.put(featureEndpoint, featureRequest)).data.feature;

  const plantEndpoint = `${BASE_URL}/plants/${plant.featureId}`;
  const plantRequest : UpdatePlantRequestPayload = {
    speciesId: plant.speciesId,
  };
  const plantResponse : PlantResponse = (await axios.put(plantEndpoint, plantRequest)).data.plant;
  const coordinateResponse : Coordinate | undefined =
      featureResponse.geom && Array.isArray(featureResponse.geom.coordinates)
      ? { longitude: featureResponse.geom.coordinates[0] as number,
          latitude: featureResponse.geom.coordinates[1] as number }
      : undefined;

  return {
    featureId: featureResponse.id,
    layerId: featureResponse.layerId,
    coordinates: coordinateResponse,
    notes: featureResponse.notes,
    enteredTime: featureResponse.enteredTime,
    speciesId: plantResponse.speciesId,
  };
};

export const deletePlant = async (featureId: number): Promise<number> => {
  // Deleting a feature deletes everything associated with it (including the Plant row).
  const endpoint = `${BASE_URL}/features/${featureId}`;
  await axios.delete(endpoint);

  return featureId;
};

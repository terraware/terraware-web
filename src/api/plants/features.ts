import { addQueryParams } from 'src/utils/api';
import axios from '..';
import { featureEndpoint, FeatureListQuery, FeatureListResponse, featuresEndpoint } from '../types/feature';

export const getFeatures = async (layerId: number, limit?: number, skip?: number): Promise<FeatureListResponse> => {
  const queryParams: FeatureListQuery = { limit: limit ?? 5000, skip: skip ?? 0 };

  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${featuresEndpoint}`.replace('{layerId}', `${layerId}`);
  const response: FeatureListResponse = (await axios.get(addQueryParams(endpoint, queryParams))).data;

  return response;
};

export const deleteFeature = async (featureId: number): Promise<void> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${featureEndpoint}`.replace('{featureId}', `${featureId}`);
  await axios.delete(endpoint);
};

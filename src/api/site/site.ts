import axios from 'axios';
import { Site } from 'src/types/Organization';
import { paths } from '../types/generated-schema';

const SITES = '/api/v1/sites';
type CreateSiteResponsePayload = paths[typeof SITES]['post']['responses'][200]['content']['application/json'];

type CreateSiteRequestPayload = paths[typeof SITES]['post']['requestBody']['content']['application/json'];

type PostSiteResponse = {
  siteId: number | null;
  requestSucceeded: boolean;
};

export async function createSite(site: Site): Promise<PostSiteResponse> {
  const response: PostSiteResponse = {
    siteId: null,
    requestSucceeded: true,
  };
  const createSiteRequestPayload: CreateSiteRequestPayload = {
    name: site.name,
    description: site.description,
    projectId: site.projectId,
    location: { type: 'Point', coordinates: [1234, 1234] },
  };
  try {
    const serverResponse: CreateSiteResponsePayload = (await axios.post(SITES, createSiteRequestPayload)).data;
    if (serverResponse.status === 'ok') {
      response.siteId = serverResponse.id;
    } else {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

const SITE = '/api/v1/sites/{siteId}';

type SimpleResponse = {
  requestSucceeded: boolean;
};

type UpdateSiteRequestPayload = paths[typeof SITE]['put']['requestBody']['content']['application/json'];

export async function updateSite(site: Site): Promise<SimpleResponse> {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  const updateSiteRequestPayload: UpdateSiteRequestPayload = {
    name: site.name,
    description: site.description,
    location: { type: 'Point', coordinates: [site.longitude ?? 1234, site.latitude ?? 1234] },
  };
  try {
    await axios.put(SITE.replace('{siteId}', site.id.toString()), updateSiteRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

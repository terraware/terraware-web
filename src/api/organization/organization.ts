import { AxiosResponse } from 'axios';
import axios from 'src/api/index';
import { PlantLayer, Site, ServerOrganization } from 'src/types/Organization';
import { paths } from 'src/api/types/generated-schema';
import { parseProject } from 'src/utils/organization';

const LAYERS = '/api/v1/gis/layers/list/{siteId}';
type ListLayersResponse = paths[typeof LAYERS]['get']['responses'][200]['content']['application/json'];
type LayerResponse = ListLayersResponse['layers'][0];

type GetPlantLayersResponse = {
  layers: PlantLayer[];
  requestSucceeded: boolean;
};
export async function getPlantLayers(sites: Site[]): Promise<GetPlantLayersResponse> {
  // We may want to add functionality to allow fetching of some layers to fail
  // while still returning those that were fetched successfully
  const response: GetPlantLayersResponse = {
    layers: [],
    requestSucceeded: true,
  };
  try {
    const axiosResponse: AxiosResponse<ListLayersResponse>[] = await Promise.all(
      sites.map((site) => axios.get(LAYERS.replace('{siteId}', `${site.id}`)))
    );

    const layers: PlantLayer[] = [];
    axiosResponse.forEach((serResponse) => {
      serResponse.data.layers.forEach((layer: LayerResponse) => {
        if (layer.layerType === 'Plants Planted') {
          layers.push({
            id: layer.id,
            siteId: layer.siteId,
          });
        }
      });
    });

    response.layers = layers;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

export const exportedForTesting = {
  getLayers: getPlantLayers,
};

const ORGANIZATIONS = '/api/v1/organizations';
type ListOrganizationsResponsePayload =
  paths[typeof ORGANIZATIONS]['get']['responses'][200]['content']['application/json'];

type OrganizationsResponse = {
  organizations: ServerOrganization[];
  requestSucceeded: boolean;
};
export async function getOrganizations(): Promise<OrganizationsResponse> {
  const response: OrganizationsResponse = {
    organizations: [],
    requestSucceeded: true,
  };
  try {
    const organizationsResponse: ListOrganizationsResponsePayload = (await axios.get(`${ORGANIZATIONS}?depth=Facility`))
      .data;
    response.organizations = organizationsResponse.organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      role: organization.role,
      projects: organization.projects?.map((project) => parseProject(project)),
    }));
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

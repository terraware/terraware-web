import axios from 'axios';
import { Project } from 'src/types/Organization';
import { paths } from '../types/generated-schema';

const PROJECTS = '/api/v1/projects';
type CreateProjectResponsePayload = paths[typeof PROJECTS]['post']['responses'][200]['content']['application/json'];

type CreateProjectRequestPayload = paths[typeof PROJECTS]['post']['requestBody']['content']['application/json'];

type PostProjectResponse = {
  project: Project | null;
  requestSucceeded: boolean;
};

export async function createProject(project: Project, organizationId: number): Promise<PostProjectResponse> {
  const response: PostProjectResponse = {
    project: null,
    requestSucceeded: true,
  };

  const createProjectRequestPayload: CreateProjectRequestPayload = {
    organizationId,
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    status: project.status,
    types: project.types,
  };
  try {
    const serverResponse: CreateProjectResponsePayload = (await axios.post(PROJECTS, createProjectRequestPayload)).data;
    response.project = {
      id: serverResponse.project.id,
      name: serverResponse.project.name,
      description: serverResponse.project.description,
      startDate: serverResponse.project.startDate,
      status: serverResponse.project.status,
      types: serverResponse.project.types,
    };
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

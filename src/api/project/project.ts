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

const PROJECT = '/api/v1/projects/{id}';

type SimpleResponse = {
  requestSucceeded: boolean;
};

export const updateProject = async (project: Project): Promise<SimpleResponse> => {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.put(PROJECT.replace('{id}', project.id.toString()), project);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

const USER_IN_PROJECT = '/api/v1/projects/{projectId}/users/{userId}';
type SimpleSuccessResponsePayload =
  paths[typeof USER_IN_PROJECT]['post']['responses'][200]['content']['application/json'];

export const addProjectUser = async (projectId: number, userId: number): Promise<SimpleResponse> => {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  try {
    const serverResponse: SimpleSuccessResponsePayload = (
      await axios.post(
        USER_IN_PROJECT.replace('{projectId}', projectId.toString()).replace('{userId}', userId.toString())
      )
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
};

export const deleteProjectUser = async (projectId: number, userId: number): Promise<SimpleResponse> => {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  try {
    const serverResponse: SimpleSuccessResponsePayload = (
      await axios.delete(
        USER_IN_PROJECT.replace('{projectId}', projectId.toString()).replace('{userId}', userId.toString())
      )
    ).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

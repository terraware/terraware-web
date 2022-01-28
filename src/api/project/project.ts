import axios, { AxiosResponse } from 'axios';
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
      organizationId: serverResponse.project.organizationId,
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

type UpdateProjectRequestPayload = paths[typeof PROJECT]['put']['requestBody']['content']['application/json'];

export async function updateProject(project: Project): Promise<SimpleResponse> {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  const updateProjectRequestPayload: UpdateProjectRequestPayload = {
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    status: project.status,
    types: project.types,
  };
  try {
    await axios.put(PROJECT.replace('{id}', project.id.toString()), updateProjectRequestPayload);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
}

const USER_IN_PROJECT = '/api/v1/projects/{projectId}/users/{userId}';
type SimpleSuccessResponsePayload =
  paths[typeof USER_IN_PROJECT]['post']['responses'][200]['content']['application/json'];

export async function updateProjectUser(
  projectId: number,
  userId: number,
  operation: (url: string, data?: any) => Promise<AxiosResponse<any>>
): Promise<SimpleResponse> {
  const response: SimpleResponse = {
    requestSucceeded: true,
  };
  const url = USER_IN_PROJECT.replace('{projectId}', projectId.toString()).replace('{userId}', userId.toString());
  try {
    const serverResponse: SimpleSuccessResponsePayload = (await operation(url)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

type ListAllProjectsResponse = {
  requestSucceeded: boolean;
  projects: Project[] | null;
};
type ListProjectsResponsePayload = paths[typeof PROJECTS]['get']['responses'][200]['content']['application/json'];
export async function listAllProjects(): Promise<ListAllProjectsResponse> {
  const response: ListAllProjectsResponse = {
    requestSucceeded: true,
    projects: null,
  };
  try {
    const serverResponse: ListProjectsResponsePayload = (await axios.get(`${PROJECTS}?totalUsers=true`)).data;
    if (serverResponse.status === 'error') {
      response.requestSucceeded = false;
    } else {
      response.projects = serverResponse.projects.map((project) => {
        return {
          id: project.id,
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          status: project.status,
          types: project.types,
          sites: project.sites,
          totalUsers: project.totalUsers,
          organizationId: project.organizationId,
        };
      });
    }
  } catch {
    response.requestSucceeded = false;
  }
  return response;
}

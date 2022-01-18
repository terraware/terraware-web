import axios from 'axios';
import { NewProject, Project } from 'src/types/Organization';
import { paths } from '../types/generated-schema';

const PROJECTS = '/api/v1/projects';
type CreateProjectResponsePayload = paths[typeof PROJECTS]['post']['responses'][200]['content']['application/json'];

type PostProjectResponse = {
  project: Project | null;
  requestSucceeded: boolean;
};

export const createProject = async (project: NewProject): Promise<PostProjectResponse> => {
  const response: PostProjectResponse = {
    project: null,
    requestSucceeded: true,
  };
  try {
    const serverResponse: CreateProjectResponsePayload = (await axios.post(PROJECTS, project)).data;
    response.project = serverResponse.project;
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

const PROJECT = '/api/v1/projects/{id}';

type PutProjectResponse = {
  requestSucceeded: boolean;
};

export const updateProject = async (project: Project): Promise<PutProjectResponse> => {
  const response: PutProjectResponse = {
    requestSucceeded: true,
  };
  try {
    await axios.put(PROJECT.replace('{id}', project.id.toString()), project);
  } catch {
    response.requestSucceeded = false;
  }

  return response;
};

import axios from 'axios';

// TODO implement this
const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/projects`;

// TODO fix this, move it to it's own type file
export type Project = {
  id: number,
  organizationId: number,
  name: string,
};

// TODO WARNING THIS DOESN'T WORK
export const getProjects = async (): Promise<Project[]> => {
  const endpoint = `${BASE_URL}`;

  return (await axios.get(endpoint)).data.projects;
};

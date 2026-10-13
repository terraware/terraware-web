import { APIRequestContext, expect } from '@playwright/test';

const JSON_HEADERS = { Accept: 'application/json' };

const postJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.post(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `POST ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

export type SpeciesSeed = {
  scientificName: string;
  projectIndexes?: number[];
};

export type SeededProject = {
  id: number;
  name: string;
};

export type SeededOrganization = {
  id: number;
  name: string;
  projects: SeededProject[];
};

export type SeedOrganizationOptions = {
  /** Suffixed with a timestamp so reruns without a database reset don't collide. */
  name: string;
  projectNames?: string[];
  species: SpeciesSeed[];
};

/**
 * Creates an organization with no locations
 */
export const seedOrganization = async (
  request: APIRequestContext,
  { name, projectNames = [], species }: SeedOrganizationOptions
): Promise<SeededOrganization> => {
  const organizationName = `${name} ${Date.now()}`;
  const { organization } = await postJson<{ organization: { id: number } }>(request, '/api/v1/organizations', {
    name: organizationName,
    timeZone: 'Etc/UTC',
  });
  const organizationId: number = organization.id;

  const projectIds: number[] = [];
  for (const projectName of projectNames) {
    const { id } = await postJson<{ id: number }>(request, '/api/v1/projects', {
      name: projectName,
      organizationId,
    });
    projectIds.push(id);
  }

  for (const { scientificName, projectIndexes = [] } of species) {
    await postJson<{ id: number }>(request, '/api/v1/species', {
      organizationId,
      scientificName,
      projectIds: projectIndexes.map((index) => projectIds[index]),
    });
  }

  return {
    id: organizationId,
    name: organizationName,
    projects: projectNames.map((projectName, index) => ({ id: projectIds[index], name: projectName })),
  };
};

export const deleteOrganization = async (request: APIRequestContext, organizationId: number): Promise<void> => {
  const response = await request.delete(`/api/v1/organizations/${organizationId}`, { headers: JSON_HEADERS });
  expect(response.ok(), `Failed to delete organization ${organizationId}: ${response.status()}`).toBeTruthy();
};

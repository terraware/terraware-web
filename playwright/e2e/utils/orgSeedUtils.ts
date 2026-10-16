import { APIRequestContext, expect } from '@playwright/test';

const JSON_HEADERS = { Accept: 'application/json' };

const postJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.post(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `POST ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const putJson = async <T>(request: APIRequestContext, url: string, data: unknown): Promise<T> => {
  const response = await request.put(url, { headers: JSON_HEADERS, data });
  expect(response.ok(), `PUT ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const getJson = async <T>(request: APIRequestContext, url: string): Promise<T> => {
  const response = await request.get(url, { headers: JSON_HEADERS });
  expect(response.ok(), `GET ${url} failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  return (await response.json()) as T;
};

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];

const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
};

export type SpeciesSeed = {
  scientificName: string;
  projectIndexes?: number[];
};

export type SeededProject = {
  id: number;
  name: string;
};

export type SeededSpecies = {
  id: number;
  scientificName: string;
};

export type SeededOrganization = {
  id: number;
  name: string;
  projects: SeededProject[];
  species: SeededSpecies[];
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

  const seededSpecies: SeededSpecies[] = [];
  for (const { scientificName, projectIndexes = [] } of species) {
    const { id } = await postJson<{ id: number }>(request, '/api/v1/species', {
      organizationId,
      scientificName,
      projectIds: projectIndexes.map((index) => projectIds[index]),
    });
    seededSpecies.push({ id, scientificName });
  }

  return {
    id: organizationId,
    name: organizationName,
    projects: projectNames.map((projectName, index) => ({ id: projectIds[index], name: projectName })),
    species: seededSpecies,
  };
};

export const deleteOrganization = async (request: APIRequestContext, organizationId: number): Promise<void> => {
  const response = await request.delete(`/api/v1/organizations/${organizationId}`, { headers: JSON_HEADERS });
  expect(response.ok(), `Failed to delete organization ${organizationId}: ${response.status()}`).toBeTruthy();
};

type Polygon = { type: 'Polygon'; coordinates: number[][][] };

const rectangle = (west: number, south: number, east: number, north: number): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [west, south],
      [east, south],
      [east, north],
      [west, north],
      [west, south],
    ],
  ],
});

export type StratumSeed = {
  name: string;
  substrataNames: string[];
  initialPlantingDensity?: number;
  targetPlantDensity?: number;
};

export type SeededSubstratum = {
  id: number;
  name: string;
};

export type SeededStratum = {
  id: number;
  name: string;
  substrata: SeededSubstratum[];
};

export type SeededPlantingSite = {
  id: number;
  name: string;
  areaHa: number;
  strata: SeededStratum[];
};

export type SeedPlantingSiteOptions = {
  organizationId: number;
  name: string;
  strata: StratumSeed[];
  origin?: [number, number];
};

/**
 * Creates a planting site whose boundary is a square divided into a row of strata, each of which is
 * divided into a column of substrata.
 */
export const seedPlantingSite = async (
  request: APIRequestContext,
  { organizationId, name, strata, origin = [36.8, -1.3] }: SeedPlantingSiteOptions
): Promise<SeededPlantingSite> => {
  const [west, south] = origin;
  const size = 0.01;
  const stratumWidth = size / strata.length;

  const { id } = await postJson<{ id: number }>(request, '/api/v1/tracking/sites', {
    organizationId,
    name,
    timeZone: 'Etc/UTC',
    boundary: rectangle(west, south, west + size, south + size),
    strata: strata.map((stratum, stratumIndex) => {
      const stratumWest = west + stratumIndex * stratumWidth;
      const substratumHeight = size / stratum.substrataNames.length;
      return {
        name: stratum.name,
        initialPlantingDensity: stratum.initialPlantingDensity,
        targetPlantDensity: stratum.targetPlantDensity,
        boundary: rectangle(stratumWest, south, stratumWest + stratumWidth, south + size),
        substrata: stratum.substrataNames.map((substratumName, substratumIndex) => {
          const substratumSouth = south + substratumIndex * substratumHeight;
          return {
            name: substratumName,
            boundary: rectangle(
              stratumWest,
              substratumSouth,
              stratumWest + stratumWidth,
              substratumSouth + substratumHeight
            ),
          };
        }),
      };
    }),
  });

  const { site } = await getJson<{ site: SeededPlantingSite }>(
    request,
    `/api/v1/tracking/sites/${id}?depth=Substratum`
  );
  return site;
};

export const seedNursery = async (
  request: APIRequestContext,
  { organizationId, name }: { organizationId: number; name: string }
): Promise<number> => {
  const { id } = await postJson<{ id: number }>(request, '/api/v1/facilities', {
    organizationId,
    name,
    type: 'Nursery',
    timeZone: 'Etc/UTC',
  });
  return id;
};

export const seedReadyBatch = async (
  request: APIRequestContext,
  { facilityId, speciesId, readyQuantity }: { facilityId: number; speciesId: number; readyQuantity: number }
): Promise<void> => {
  await postJson(request, '/api/v1/nursery/batches', {
    facilityId,
    speciesId,
    addedDate: toIsoDate(new Date()),
    germinatingQuantity: 0,
    activeGrowthQuantity: 0,
    hardeningOffQuantity: 0,
    readyQuantity,
  });
};

export type SeededPlantingSeason = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
};

export type SeedPlantingSeasonOptions = {
  plantingSiteId: number;
  name: string;
  startDate?: string;
  endDate?: string;
};

export const seedPlantingSeason = async (
  request: APIRequestContext,
  { plantingSiteId, name, startDate = daysFromNow(-10), endDate = daysFromNow(60) }: SeedPlantingSeasonOptions
): Promise<SeededPlantingSeason> => {
  const { id } = await postJson<{ id: number }>(request, '/api/v1/planting-seasons', {
    plantingSiteId,
    name,
    startDate,
    endDate,
  });
  return { id, name, startDate, endDate };
};

export const seedSpeciesTarget = async (
  request: APIRequestContext,
  {
    plantingSeasonId,
    speciesId,
    substratumId,
    quantity,
  }: { plantingSeasonId: number; speciesId: number; substratumId: number; quantity: number }
): Promise<void> => {
  await putJson(request, `/api/v1/planting-seasons/${plantingSeasonId}/species-targets`, {
    speciesId,
    substratumId,
    quantity,
  });
};

export const seedSiteSpeciesTarget = async (
  request: APIRequestContext,
  {
    plantingSiteId,
    speciesId,
    stratumIds,
    targetPlants,
  }: { plantingSiteId: number; speciesId: number; stratumIds: number[]; targetPlants?: number }
): Promise<void> => {
  await putJson(request, `/api/v1/tracking/sites/${plantingSiteId}/speciesTargets/${speciesId}`, {
    stratumIds,
    targetPlants,
  });
};

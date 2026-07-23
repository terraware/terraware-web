import { APIRequestContext, expect } from '@playwright/test';

const ORGANIZATION_ID = 1;

const JSON_HEADERS = { Accept: 'application/json' };

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0];

export type ObservablePlantingSite = {
  plantingSiteId: number;
  plantingSiteName: string;
  substratumIds: number[];
};

export type CompletedPlot = {
  plotId: number;
  plotNumber: number;
  stratumName: string;
  livePlants: number;
  deadPlants: number;
  totalPlants: number;
  totalSpecies: number;
  conditions: string[];
  notes: string;
};

export const findObservablePlantingSite = async (
  request: APIRequestContext,
  organizationId: number = ORGANIZATION_ID
): Promise<ObservablePlantingSite> => {
  const response = await request.get('/api/v1/tracking/sites', {
    headers: JSON_HEADERS,
    params: { organizationId },
  });
  expect(response.ok()).toBeTruthy();
  const { sites } = await response.json();

  for (const site of sites ?? []) {
    const reportedResponse = await request.get(`/api/v1/tracking/sites/${site.id}/reportedPlants`, {
      headers: JSON_HEADERS,
    });
    if (!reportedResponse.ok()) {
      continue;
    }
    const { site: reported } = await reportedResponse.json();
    const substratumIds: number[] = (reported.strata ?? [])
      .flatMap((stratum: { substrata?: { id: number; totalPlants?: number }[] }) => stratum.substrata ?? [])
      .filter((substratum: { totalPlants?: number }) => (substratum.totalPlants ?? 0) > 0)
      .map((substratum: { id: number }) => substratum.id);
    if (substratumIds.length > 0) {
      return { plantingSiteId: site.id, plantingSiteName: site.name, substratumIds };
    }
  }

  throw new Error('No planting site with reported plants was found for the organization');
};

export const getFirstKnownSpeciesId = async (
  request: APIRequestContext,
  organizationId: number = ORGANIZATION_ID
): Promise<number> => {
  const response = await request.get('/api/v1/species', {
    headers: JSON_HEADERS,
    params: { organizationId },
  });
  expect(response.ok()).toBeTruthy();
  const { species } = await response.json();
  expect(species.length).toBeGreaterThan(0);
  return species[0].id;
};

export const scheduleObservation = async (
  request: APIRequestContext,
  { plantingSiteId, substratumIds }: { plantingSiteId: number; substratumIds: number[] }
): Promise<number> => {
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);

  const response = await request.post('/api/v1/tracking/observations', {
    headers: JSON_HEADERS,
    data: {
      plantingSiteId,
      startDate: toIsoDate(startDate),
      endDate: toIsoDate(endDate),
      requestedSubstratumIds: substratumIds,
    },
  });
  expect(response.ok()).toBeTruthy();
  const { id } = await response.json();
  return id;
};

export const startObservation = async (
  request: APIRequestContext,
  { observationId, plantingSiteId }: { observationId: number; plantingSiteId: number }
): Promise<void> => {
  const response = await request.post('/admin/startObservation', {
    form: { plantingSiteId: String(plantingSiteId), observationId: String(observationId) },
  });
  expect(response.ok()).toBeTruthy();
};

export const uploadObservationData = async (
  request: APIRequestContext,
  {
    observationId,
    speciesId,
    plotCount = 2,
    livePlants = 13,
    deadPlants = 4,
    conditions = ['FavorableWeather'],
    notes = 'Automated observation upload test',
  }: {
    observationId: number;
    speciesId: number;
    plotCount?: number;
    livePlants?: number;
    deadPlants?: number;
    conditions?: string[];
    notes?: string;
  }
): Promise<CompletedPlot[]> => {
  const plotsResponse = await request.get(`/api/v1/tracking/observations/${observationId}/plots`, {
    headers: JSON_HEADERS,
  });
  expect(plotsResponse.ok()).toBeTruthy();
  const { plots } = await plotsResponse.json();
  expect(plots.length).toBeGreaterThan(0);

  const gpsCoordinates = { type: 'Point', coordinates: [38.626, 15.69] };
  const buildPlant = (status: 'Live' | 'Dead') => ({
    certainty: 'Known',
    speciesId,
    status,
    gpsCoordinates,
  });
  const plants = [
    ...Array.from({ length: livePlants }, () => buildPlant('Live')),
    ...Array.from({ length: deadPlants }, () => buildPlant('Dead')),
  ];

  const completedPlots: CompletedPlot[] = [];
  for (const plot of plots.slice(0, plotCount)) {
    const claimResponse = await request.post(
      `/api/v1/tracking/observations/${observationId}/plots/${plot.plotId}/claim`
    );
    expect(claimResponse.ok()).toBeTruthy();

    const completeResponse = await request.post(`/api/v1/tracking/observations/${observationId}/plots/${plot.plotId}`, {
      headers: JSON_HEADERS,
      data: {
        conditions,
        observedTime: new Date().toISOString(),
        notes,
        lngFirst: true,
        plants,
      },
    });
    expect(completeResponse.ok()).toBeTruthy();

    completedPlots.push({
      plotId: plot.plotId,
      plotNumber: plot.plotNumber,
      stratumName: plot.stratumName,
      livePlants,
      deadPlants,
      totalPlants: livePlants + deadPlants,
      totalSpecies: livePlants > 0 ? 1 : 0,
      conditions,
      notes,
    });
  }

  return completedPlots;
};

export type AdHocObservation = {
  observationId: number;
  plotId: number;
  plotNumber: number;
  livePlants: number;
  deadPlants: number;
  totalPlants: number;
  totalSpecies: number;
  conditions: string[];
  notes: string;
};

export const uploadAdHocObservationData = async (
  request: APIRequestContext,
  {
    plantingSiteId,
    speciesId,
    livePlants = 13,
    deadPlants = 4,
    conditions = ['FavorableWeather'],
    notes = 'Automated ad-hoc observation upload test',
  }: {
    plantingSiteId: number;
    speciesId: number;
    livePlants?: number;
    deadPlants?: number;
    conditions?: string[];
    notes?: string;
  }
): Promise<AdHocObservation> => {
  const gpsCoordinates = { type: 'Point', coordinates: [38.626, 15.69] };
  const buildPlant = (status: 'Live' | 'Dead') => ({ certainty: 'Known', speciesId, status, gpsCoordinates });
  const plants = [
    ...Array.from({ length: livePlants }, () => buildPlant('Live')),
    ...Array.from({ length: deadPlants }, () => buildPlant('Dead')),
  ];

  const response = await request.post('/api/v1/tracking/observations/adHoc', {
    headers: JSON_HEADERS,
    data: {
      observationType: 'Monitoring',
      plantingSiteId,
      observedTime: new Date().toISOString(),
      swCorner: gpsCoordinates,
      conditions,
      notes,
      lngFirst: true,
      plants,
    },
  });
  expect(response.ok()).toBeTruthy();
  const { observationId, plotId } = await response.json();

  const resultsResponse = await request.get(`/api/v1/tracking/observations/${observationId}/results`, {
    headers: JSON_HEADERS,
    params: { depth: 'Plot' },
  });
  expect(resultsResponse.ok()).toBeTruthy();
  const { observation } = await resultsResponse.json();

  return {
    observationId,
    plotId,
    plotNumber: observation.adHocPlot.monitoringPlotNumber,
    livePlants,
    deadPlants,
    totalPlants: livePlants + deadPlants,
    totalSpecies: livePlants > 0 ? 1 : 0,
    conditions,
    notes,
  };
};

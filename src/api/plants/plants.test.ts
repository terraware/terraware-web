import axios from 'axios';
import { getPlants, getPlantSummariesByLayer, getPlantSummary, putPlant } from 'src/api/plants/plants';
import { Coordinate, Plant, PlantErrorByLayerId, PlantRequestError, PlantSummariesByLayerId } from 'src/types/Plant';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const TODAY = new Date(1989, 12, 13);
const ONE_WEEK_AGO = new Date(TODAY);
ONE_WEEK_AGO.setDate(ONE_WEEK_AGO.getDate() - 7);

const LAYER_ID = 100;
const FEATURE_ID = 10;
const PLANT: Plant = {
  featureId: FEATURE_ID,
  layerId: undefined,
  coordinates: {
    latitude: 45,
    longitude: 30,
  },
  notes: 'Some notes here',
  enteredTime: TODAY.toISOString(),
  speciesId: 101,
};

function suppressConsoleErrorOutput() {
  // Suppress console.error() calls so that the expected errors don't look like test failures.
  jest.spyOn(console, 'error').mockImplementation(() => {
    /* tslint:disable:no-empty */
  });
}

function mockIsAxiosError() {
  // Promise.reject() should show up as an axios error.
  mockedAxios.isAxiosError.mockReturnValue(true);
}

// Returns the number of axios.get failure variations that were mocked.
function mockAxiosGETFailures(): number {
  mockedAxios.get.mockImplementationOnce(() => {
    return Promise.reject({ response: { status: 400 } });
  });
  mockedAxios.get.mockImplementationOnce(() => {
    return Promise.reject({ response: { status: 500 } });
  });
  mockedAxios.get.mockImplementationOnce(() => {
    return Promise.reject({ request: { message: 'The server did not respond' } });
  });
  mockedAxios.get.mockImplementationOnce(() => {
    return Promise.reject({ message: 'Could not set up request. Malformed url.' });
  });

  return 4;
}

test('getPlants() correctly parses geom data into the client side Coordinate type', async () => {
  const coordinates: Coordinate[] = [
    { latitude: -45, longitude: 60 },
    { latitude: 40.7812, longitude: 73.9665 },
  ];
  mockedAxios.get.mockResolvedValue({
    data: {
      list: [
        {
          featureId: 10,
          layerId: LAYER_ID,
          geom: {
            coordinates: [coordinates[0].longitude, coordinates[0].latitude, 42],
          },
        },
        {
          featureId: 20,
          layerId: LAYER_ID,
          geom: {
            coordinates: [coordinates[1].longitude, coordinates[1].latitude, 11],
          },
        },
      ],
    },
  });

  const response = await getPlants(LAYER_ID);
  expect(response.layerId).toEqual(LAYER_ID);
  expect(
    response.plants.map((plant) => {
      return plant.coordinates;
    })
  ).toEqual(coordinates);
  expect(response.error).toEqual(null);
});

test('getPlants() returns correct error when server throws 404', async () => {
  suppressConsoleErrorOutput();

  mockedAxios.get.mockImplementation(() => {
    return Promise.reject({ response: { status: 404 } });
  });
  mockIsAxiosError();

  const response = await getPlants(LAYER_ID);
  expect(response.layerId).toEqual(LAYER_ID);
  expect(response.plants).toEqual([]);
  expect(response.error).toEqual(PlantRequestError.LayerIdNotFound);
});

test('getPlants() returns correct error for all non 404 errors', async () => {
  suppressConsoleErrorOutput();

  const numTimesAxiosWasMocked = mockAxiosGETFailures();
  mockIsAxiosError();

  for (let i = 0; i < numTimesAxiosWasMocked; i++) {
    const response = await getPlants(LAYER_ID);
    expect(response.layerId).toEqual(LAYER_ID);
    expect(response.plants).toEqual([]);
    expect(response.error).toEqual(PlantRequestError.RequestFailed);
  }
});

test('getPlantSummary() returns correct error when server throws 404', async () => {
  suppressConsoleErrorOutput();
  mockedAxios.get.mockImplementation(() => {
    return Promise.reject({ response: { status: 404 } });
  });
  mockIsAxiosError();

  const response = await getPlantSummary(LAYER_ID, TODAY);
  expect(response.layerId).toEqual(LAYER_ID);
  expect(response.summary).toEqual(null);
  expect(response.error).toEqual(PlantRequestError.LayerIdNotFound);
});

test('getPlantSummary() returns correct error for all non 404 errors', async () => {
  suppressConsoleErrorOutput();
  const numTimesAxiosWasMocked = mockAxiosGETFailures();
  mockIsAxiosError();

  for (let i = 0; i < numTimesAxiosWasMocked; i++) {
    const response = await getPlantSummary(LAYER_ID, TODAY);
    expect(response.layerId).toEqual(LAYER_ID);
    expect(response.summary).toEqual(null);
    expect(response.error).toEqual(PlantRequestError.RequestFailed);
  }
});

test('getPlantSummaries() returns this + last week summaries for all layers when no errors occurred', async () => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(TODAY);
  const expected: PlantSummariesByLayerId = new Map([
    [
      12,
      {
        lastWeek: [
          {
            speciesId: 1,
            numPlants: 8,
          },
          {
            speciesId: 2,
            numPlants: 2,
          },
        ],
        thisWeek: [
          {
            speciesId: 1,
            numPlants: 8,
          },
          {
            speciesId: 2,
            numPlants: 2,
          },
          {
            speciesId: 3,
            numPlants: 5,
          },
          {
            speciesId: 4,
            numPlants: 5,
          },
        ],
      },
    ],
    [
      13,
      {
        lastWeek: [],
        thisWeek: [
          {
            speciesId: 1,
            numPlants: 24,
          },
        ],
      },
    ],
  ]);

  let summary: { [key: string]: number }; // speciesId to count JSON
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('/list/summary/12')) {
      if (url.includes(ONE_WEEK_AGO.getDate().toString())) {
        summary = {
          '1': 8,
          '2': 2,
        };
      } else if (url.includes(TODAY.getDate().toString())) {
        summary = {
          '1': 8,
          '2': 2,
          '3': 5,
          '4': 5,
        };
      }
    } else if (url.includes('/list/summary/13')) {
      if (url.includes(ONE_WEEK_AGO.getDate().toString())) {
        summary = {};
      } else if (url.includes(TODAY.getDate().toString())) {
        summary = { '1': 24 };
      }
    }

    if (summary === undefined) {
      console.error('Axios mock called with an unexpected url');
      throw Error('Axios mock called with an unexpected url');
    }

    return Promise.resolve({
      data: {
        summary,
        status: 'ok',
      },
    });
  });

  await expect(getPlantSummariesByLayer([12, 13])).resolves.toEqual({
    plantSummariesByLayerId: expected,
    plantErrorByLayerId: new Map(),
  });
});

function mockListSummaryRejection(currLayerId: number, weekToReject: string) {
  expect(weekToReject === 'current' || weekToReject === 'last' || weekToReject === 'both').toEqual(true);
  jest.useFakeTimers('modern');
  jest.setSystemTime(TODAY);
  mockIsAxiosError();
  const rejectedResponse = { response: { status: 404 } };
  const resolvedResponse = {
    data: {
      summary: { '1': 10 },
      status: 'ok',
    },
  };

  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes(`list/summary/${currLayerId}`)) {
      if (url.includes(ONE_WEEK_AGO.getDate().toString())) {
        return weekToReject === 'last' || weekToReject === 'both' ? Promise.reject(rejectedResponse) : Promise.resolve(resolvedResponse);
      } else if (url.includes(TODAY.getDate().toString())) {
        return weekToReject === 'current' || weekToReject === 'both' ? Promise.reject(rejectedResponse) : Promise.resolve(resolvedResponse);
      }
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });
}

test('getPlantSummaries() never returns incomplete summary data (always returns both this AND last week summary)', async () => {
  // Mock axios response for current week only failed, last week only failed, and both weeks failed
  const failures = ['current', 'last', 'both'];
  for (const failure of failures) {
    mockListSummaryRejection(LAYER_ID, failure);
    await expect(getPlantSummariesByLayer([LAYER_ID])).resolves.toEqual({
      plantSummariesByLayerId: new Map(),
      plantErrorByLayerId: new Map([[LAYER_ID, PlantRequestError.LayerIdNotFound]]),
    });
  }
});

test('getPlantSummaries() returns plant summary data for some layers, even if others failed', async () => {
  const layerIds = [60, 70];
  const expectedPlantSummaries: PlantSummariesByLayerId = new Map([
    [
      70,
      {
        thisWeek: [
          {
            speciesId: 1,
            numPlants: 10,
          },
        ],
        lastWeek: [
          {
            speciesId: 1,
            numPlants: 10,
          },
        ],
      },
    ],
  ]);
  const expectedPlantSummaryErrors: PlantErrorByLayerId = new Map([[60, PlantRequestError.LayerIdNotFound]]);
  mockIsAxiosError();
  mockedAxios.get.mockImplementation((url: string) => {
    if (url.includes('list/summary/60')) {
      return Promise.reject({ response: { status: 404 } });
    } else if (url.includes('list/summary/70')) {
      return Promise.resolve({
        data: {
          summary: {
            '1': 10,
          },
          status: 'ok',
        },
      });
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });

  await expect(getPlantSummariesByLayer(layerIds)).resolves.toEqual({
    plantSummariesByLayerId: expectedPlantSummaries,
    plantErrorByLayerId: expectedPlantSummaryErrors,
  });
});

test('getPlantSummaries() returns empty summary maps when passed an empty list of layer ids', async () => {
  const result = await getPlantSummariesByLayer([]);
  expect(result).toEqual({
    plantSummariesByLayerId: new Map(),
    plantErrorByLayerId: new Map(),
  });
});

function mockPutFeaturesAndPlantsEndpoint(featureId: number, failedEndpoint?: string, httpFailureStatusCode: number = 404) {
  expect(failedEndpoint === undefined || failedEndpoint === 'plants' || failedEndpoint === 'features' || failedEndpoint === 'both').toEqual(true);

  if (failedEndpoint) {
    mockIsAxiosError();
  }

  mockedAxios.put.mockImplementation((url: string, requestData: any) => {
    if (url.includes(`features/${featureId}`)) {
      return failedEndpoint === 'features' || failedEndpoint === 'both'
        ? Promise.reject({ response: { status: httpFailureStatusCode } })
        : Promise.resolve({
            data: {
              feature: { ...requestData, id: featureId },
              status: 'ok',
            },
          });
    } else if (url.includes(`plants/${featureId}`)) {
      return failedEndpoint === 'plants' || failedEndpoint === 'both'
        ? Promise.reject({ response: { status: httpFailureStatusCode } })
        : Promise.resolve({
            data: {
              plant: { ...requestData, featureId },
              status: 'ok',
            },
          });
    }

    console.error('Axios mock called with an unexpected url');
    throw Error('Axios mock called with an unexpected url');
  });
}

test('putPlant() returns plant (and no errors) when we successfully updated plant and feature objects', async () => {
  mockPutFeaturesAndPlantsEndpoint(FEATURE_ID);
  await expect(putPlant(PLANT)).resolves.toEqual({
    plant: PLANT,
    error: null,
  });
});

test('putPlant() returns attempted update and error when any API write request fails', async () => {
  const failures = ['features', 'plants', 'both'];
  for (const failure of failures) {
    for (const status of [404, 500]) {
      mockPutFeaturesAndPlantsEndpoint(FEATURE_ID, 'features', status);
      await expect(putPlant(PLANT)).resolves.toEqual({
        plant: PLANT,
        error: status === 404 ? PlantRequestError.FeatureIdNotFound : PlantRequestError.RequestFailed,
      });
    }
  }
});

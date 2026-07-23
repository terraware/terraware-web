import { setHttpServiceMocks, clearHttpServiceMocks } from './HttpServiceMocks';
import SpeciesService from '../SpeciesService';

const SPECIES_LIST = [
  {
    id: 1,
    name: 'Species 1',
  },
];

const UPDATED_SPECIES = {
  id: 1,
  organizationId: 1,
  scientificName: 'New species',
  commonName: 'Common',
  createdTime: '2024-10-01T15:00:00Z',
  modifiedTime: '2024-10-01T15:00:00Z',
};

describe('Species service test', () => {
  beforeEach(() => {
    clearHttpServiceMocks();
  });

  test('get species should return the correct species', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          species: {
            id: 2,
            organizationId: 1,
            scientificName: 'Createad species',
          },
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { species } = await SpeciesService.getSpecies(1, 1);

    expect(species?.id).toEqual(2);
  });

  test('update species should succeed when no errors', async () => {
    setHttpServiceMocks({
      put: () =>
        Promise.resolve({
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { requestSucceeded } = await SpeciesService.updateSpecies(UPDATED_SPECIES, 1);

    expect(requestSucceeded).toEqual(true);
  });

  test('get all species should return a list of species', async () => {
    setHttpServiceMocks({
      get2: () =>
        Promise.resolve({
          data: {
            species: SPECIES_LIST
          },
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const response = await SpeciesService.getAllSpecies(1);

    expect(response.data?.species).toHaveLength(1);
  });

});

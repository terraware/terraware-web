import { setHttpServiceMocks, clearHttpServiceMocks } from './HttpServiceMocks';
import SpeciesService from '../SpeciesService';

const SPECIES_LIST = [
  {
    id: 1,
    name: 'Species 1',
  },
];

const SPECIES = {
  organizationId: 1,
  scientificName: 'New species',
};

const UPDATED_SPECIES = {
  id: 1,
  organizationId: 1,
  scientificName: 'New species',
  commonName: 'Common',
};

const SPECIES_DETAILS = {
  scientificName: 'Test',
  familyName: 'Constanza',
};

describe('Species service test', () => {
  beforeEach(() => {
    clearHttpServiceMocks();
  });

  test('post species should return the new id', async () => {
    setHttpServiceMocks({
      post: () =>
        Promise.resolve({
          data: { id: 1 },
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { speciesId } = await SpeciesService.createSpecies(SPECIES, 1);

    expect(speciesId).toEqual(1);
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

  test('delete species should succeed when no errors', async () => {
    setHttpServiceMocks({
      delete: () =>
        Promise.resolve({
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { requestSucceeded } = await SpeciesService.deleteSpecies(1, 1);

    expect(requestSucceeded).toEqual(true);
  });

  test('get all species should return a list of species', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          species: SPECIES_LIST,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { species } = await SpeciesService.getAllSpecies(1);

    expect(species).toHaveLength(1);
  });

  test('get species details should contain details', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          speciesDetails: SPECIES_DETAILS,
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { speciesDetails } = await SpeciesService.getSpeciesDetails('Test');

    expect(speciesDetails?.familyName).toBe('Constanza');
  });

  test('get species names should return empty list if search query has less than 2 characters', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          names: ['Species 1', 'Species 2'],
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { names } = await SpeciesService.getSpeciesNames('a');

    expect(names).toHaveLength(0);
  });

  test('get species names should return the list if search query has more than 1 characters', async () => {
    setHttpServiceMocks({
      get: () =>
        Promise.resolve({
          names: ['Species 1', 'Species 2'],
          requestSucceeded: true,
          statusCode: 200,
        }),
    });

    const { names } = await SpeciesService.getSpeciesNames('aa');

    expect(names).toHaveLength(2);
  });
});

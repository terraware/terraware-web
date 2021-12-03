import axios from 'axios';
import { createSpecies, getAllSpecies, updateSpecies } from './species';
import { SpeciesRequestError } from '../../types/Species';

jest.mock('axios');

function suppressConsoleErrorOutput() {
  // Suppress console.error() calls so that the expected errors don't look like test failures.
  jest.spyOn(console, 'error').mockImplementation(() => {
    /* tslint:disable:no-empty */
  });
}

test('getAllSpecies() handles axios errors', async () => {
  axios.get.mockRejectedValue({ response: { status: 500 } });
  suppressConsoleErrorOutput();
  await expect(getAllSpecies()).resolves.toEqual({ speciesById: new Map(), requestSucceeded: false });
});

test('createSpecies() handles axios errors', async () => {
  axios.post.mockRejectedValue({ response: { status: 500 } });
  suppressConsoleErrorOutput();
  const speciesName = 'Koa';
  await expect(createSpecies(speciesName)).resolves.toEqual({
    species: null,
    error: SpeciesRequestError.RequestFailed,
  });
});

test('updateSpecies() handles axios errors', async () => {
  axios.put.mockRejectedValue({ response: { status: 500 } });
  suppressConsoleErrorOutput();
  const species = { id: 123, name: 'Ohia' };
  await expect(updateSpecies(species)).resolves.toEqual({ species: species, requestSucceeded: false });
});

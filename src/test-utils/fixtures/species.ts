import { Species } from 'src/types/Species';

export const buildSpecies = (overrides: Partial<Species> = {}): Species => ({
  id: 1,
  scientificName: 'Kokia drynarioides',
  commonName: 'Hawaii tree cotton',
  createdTime: '2026-01-01T00:00:00Z',
  modifiedTime: '2026-01-01T00:00:00Z',
  projects: [],
  ...overrides,
});

/**
 * A small deterministic list, useful for table and filter tests where the exact names matter less
 * than having a stable, alphabetically unsorted set to sort.
 */
export const buildSpeciesList = (): Species[] => [
  buildSpecies({ id: 1, scientificName: 'Metrosideros polymorpha', commonName: 'ʻŌhiʻa lehua' }),
  buildSpecies({ id: 2, scientificName: 'Acacia koa', commonName: 'Koa' }),
  buildSpecies({ id: 3, scientificName: 'Kokia drynarioides', commonName: 'Hawaii tree cotton' }),
];

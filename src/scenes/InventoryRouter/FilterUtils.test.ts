import { buildSpecies } from 'src/test-utils';

import { getNurseryDeleteSpeciesIds } from './FilterUtils';

const species = [
  buildSpecies({ id: 11, scientificName: 'Acacia koa' }),
  buildSpecies({ id: 22, scientificName: 'Metrosideros polymorpha' }),
];

describe('nursery deletion species scope', () => {
  it('restricts deletion to the species selected in the visible column filter', () => {
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species)).toEqual([11]);
  });

  it('intersects the column filter with server-side species filters', () => {
    expect(getNurseryDeleteSpeciesIds(['Acacia koa', 'Metrosideros polymorpha'], species, [22])).toEqual([22]);
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species, [22])).toEqual([]);
  });

  it.each([undefined, null, '', []])(
    'preserves the server-side filter when the column filter is cleared (%s)',
    (value) => {
      expect(getNurseryDeleteSpeciesIds(value, species, [22])).toEqual([22]);
      expect(getNurseryDeleteSpeciesIds(value, species)).toBeUndefined();
      expect(getNurseryDeleteSpeciesIds(value, species, [])).toBeUndefined();
    }
  );

  it('does not broaden deletion when a selected species cannot be resolved', () => {
    expect(getNurseryDeleteSpeciesIds('Unknown species', species)).toEqual([]);
    expect(getNurseryDeleteSpeciesIds('Acacia koa', [])).toEqual([]);
  });

  it('resolves an active column filter even when the server-side filter is empty', () => {
    expect(getNurseryDeleteSpeciesIds('Acacia koa', species, [])).toEqual([11]);
  });
});

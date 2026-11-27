import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import { findCustomPurposeByName, normalizeCustomPurposeName } from 'src/utils/withdrawalCustomPurposes';

const customPurpose = (id: number, name: string, isArchived = false): WithdrawalCustomPurposePayload => ({
  id,
  isArchived,
  name,
});

describe('normalizeCustomPurposeName', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeCustomPurposeName('  Sale  ')).toBe('sale');
  });

  it('lowercases the name', () => {
    expect(normalizeCustomPurposeName('SALE')).toBe('sale');
  });

  it('strips accents', () => {
    expect(normalizeCustomPurposeName('Sále')).toBe('sale');
  });

  it('normalizes case, accent and whitespace variants of the same name identically', () => {
    const normalized = ['Sale', ' sale ', 'Sále', '\tSÁLE\n'].map(normalizeCustomPurposeName);
    expect(new Set(normalized)).toEqual(new Set(['sale']));
  });

  it('keeps inner whitespace and punctuation', () => {
    expect(normalizeCustomPurposeName('  Donación de Árboles  ')).toBe('donacion de arboles');
  });

  it('returns an empty string for a name that is only whitespace', () => {
    expect(normalizeCustomPurposeName('   ')).toBe('');
    expect(normalizeCustomPurposeName('')).toBe('');
  });
});

describe('findCustomPurposeByName', () => {
  const sale = customPurpose(1, 'Sale');
  const donation = customPurpose(2, 'Donación');
  const archivedResearch = customPurpose(3, 'Research', true);
  const customPurposes = [sale, donation, archivedResearch];

  it('matches an exact name', () => {
    expect(findCustomPurposeByName(customPurposes, 'Sale')).toBe(sale);
  });

  it('matches regardless of case', () => {
    expect(findCustomPurposeByName(customPurposes, 'sALE')).toBe(sale);
  });

  it('matches regardless of surrounding whitespace', () => {
    expect(findCustomPurposeByName(customPurposes, '  Sale  ')).toBe(sale);
  });

  it('matches regardless of accents', () => {
    expect(findCustomPurposeByName(customPurposes, 'Sále')).toBe(sale);
    expect(findCustomPurposeByName(customPurposes, 'donacion')).toBe(donation);
  });

  it('matches a saved name that has accents when searching without them', () => {
    expect(findCustomPurposeByName([donation], ' DONACION ')).toBe(donation);
  });

  it('includes archived purposes', () => {
    expect(findCustomPurposeByName(customPurposes, ' research ')).toBe(archivedResearch);
  });

  it('returns undefined for a name that does not match', () => {
    expect(findCustomPurposeByName(customPurposes, 'Giveaway')).toBeUndefined();
  });

  it('does not match on a partial name', () => {
    expect(findCustomPurposeByName(customPurposes, 'Sal')).toBeUndefined();
    expect(findCustomPurposeByName(customPurposes, 'Sales')).toBeUndefined();
  });

  it('returns undefined for an empty or whitespace-only name', () => {
    expect(findCustomPurposeByName(customPurposes, '')).toBeUndefined();
    expect(findCustomPurposeByName(customPurposes, '   ')).toBeUndefined();
  });

  it('returns undefined when a purpose has a blank name and the searched name is empty', () => {
    expect(findCustomPurposeByName([customPurpose(4, '  ')], '  ')).toBeUndefined();
  });

  it('returns undefined when the list is empty', () => {
    expect(findCustomPurposeByName([], 'Sale')).toBeUndefined();
  });

  it('returns the first match when several purposes normalize the same', () => {
    const duplicate = customPurpose(5, ' sale ');
    expect(findCustomPurposeByName([sale, duplicate], 'SALE')).toBe(sale);
  });
});

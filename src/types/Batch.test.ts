import strings from 'src/strings';
import { getBatchAccessions, purposeLabel } from 'src/types/Batch';

describe('getBatchAccessions', () => {
  it('prefers the canonical accessions array', () => {
    expect(
      getBatchAccessions({
        accessions: [
          { accessionId: 1, accessionNumber: 'ACC-001' },
          { accessionId: 2, accessionNumber: 'ACC-002' },
        ],
        // Deprecated singular fields are ignored when the array is populated.
        accessionId: 99,
        accessionNumber: 'ACC-099',
      })
    ).toEqual([
      { accessionId: 1, accessionNumber: 'ACC-001' },
      { accessionId: 2, accessionNumber: 'ACC-002' },
    ]);
  });

  it('drops array entries without an accessionId', () => {
    expect(
      getBatchAccessions({
        accessions: [{ accessionId: 1, accessionNumber: 'ACC-001' }, { accessionNumber: 'ACC-002' }],
      })
    ).toEqual([{ accessionId: 1, accessionNumber: 'ACC-001' }]);
  });

  it('falls back to the deprecated singular fields when the array is empty', () => {
    expect(getBatchAccessions({ accessions: [], accessionId: 7, accessionNumber: 'ACC-007' })).toEqual([
      { accessionId: 7, accessionNumber: 'ACC-007' },
    ]);
  });

  it('falls back to the singular fields when the array is absent', () => {
    expect(getBatchAccessions({ accessionId: 7, accessionNumber: 'ACC-007' })).toEqual([
      { accessionId: 7, accessionNumber: 'ACC-007' },
    ]);
  });

  it('keeps a singular accessionId even without an accessionNumber', () => {
    expect(getBatchAccessions({ accessionId: 7 })).toEqual([{ accessionId: 7, accessionNumber: undefined }]);
  });

  it('returns an empty array when the batch has no accession', () => {
    expect(getBatchAccessions({})).toEqual([]);
    expect(getBatchAccessions({ accessions: [] })).toEqual([]);
  });
});

describe('purposeLabel', () => {
  it('returns the Other label with the custom purpose name for an Other withdrawal', () => {
    expect(purposeLabel('Other', 'Sale')).toBe(strings.formatString(strings.OTHER_COLON_X, 'Sale'));
  });

  it('does not translate the custom purpose name', () => {
    expect(purposeLabel('Other', 'Donación')).toContain('Donación');
  });

  it('returns the plain Other label when there is no custom purpose', () => {
    expect(purposeLabel('Other')).toBe(strings.OTHER);
  });

  it('returns the plain Other label when the custom purpose is an empty string', () => {
    expect(purposeLabel('Other', '')).toBe(strings.OTHER);
  });

  it('labels the other purposes', () => {
    expect(purposeLabel('Out Plant')).toBe(strings.PLANTING);
    expect(purposeLabel('Nursery Transfer')).toBe(strings.NURSERY_TRANSFER);
    expect(purposeLabel('Dead')).toBe(strings.DEAD);
    expect(purposeLabel('Undo')).toBe(strings.UNDO_WITHDRAWAL);
  });

  it('ignores the custom purpose for the other purposes', () => {
    expect(purposeLabel('Out Plant', 'Sale')).toBe(strings.PLANTING);
    expect(purposeLabel('Nursery Transfer', 'Sale')).toBe(strings.NURSERY_TRANSFER);
    expect(purposeLabel('Dead', 'Sale')).toBe(strings.DEAD);
    expect(purposeLabel('Undo', 'Sale')).toBe(strings.UNDO_WITHDRAWAL);
  });
});

import { getBatchAccessions } from 'src/types/Batch';

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

import { TABLES } from 'src/types/Tables';

const findDuplicates = (values: string[]) => values.filter((value, index) => values.indexOf(value) !== index);

describe('TABLES', () => {
  it('has a unique stableId for every table', () => {
    expect(findDuplicates(Object.values(TABLES).map((table) => table.stableId))).toEqual([]);
  });

  it('has a unique storageKey for every table', () => {
    expect(findDuplicates(Object.values(TABLES).map((table) => table.storageKey))).toEqual([]);
  });
});

import { FiltersType, denormalizeValue, filtersEqual } from './useQueryFilters';

describe('filtersEqual', () => {
  it('should make sure the query filters and filters are considered equal even if there are some slight mismatches', () => {
    let filterValue: FiltersType = {
      facilityIds: [1, 2, 3],
      projectIds: [6, 7, 8],
      showEmptyBatches: ['true'],
    };

    let queryFilterValue: FiltersType = {
      facilityIds: [1, 2, 3],
      projectIds: [6, 7, 8],
    };

    // Missing showEmptyBatches
    expect(filtersEqual(filterValue, queryFilterValue)).toBeFalsy();

    filterValue = {
      facilityIds: [1, 2, 3],
      projectIds: [6, 7, 8],
      showEmptyBatches: ['true'],
    };

    queryFilterValue = {
      facilityIds: ['1', '2', 3],
      projectIds: [6, 7, 8],
      showEmptyBatches: ['true'],
    };

    // Number strings and equivalent numbers are considered equal
    expect(filtersEqual(filterValue, queryFilterValue)).toBeTruthy();

    filterValue = {
      facilityIds: [1, 2, 3],
      projectIds: [6, 7, 8],
      showEmptyBatches: ['true'],
    };

    queryFilterValue = {
      facilityIds: ['1', 2],
      projectIds: [6, 7, 8],
      showEmptyBatches: ['true'],
    };

    // Nested array values must match
    expect(filtersEqual(filterValue, queryFilterValue)).toBeFalsy();

    filterValue = {
      facilityIds: [],
      projectIds: [6, 7, 8],
    };

    queryFilterValue = {
      projectIds: [6, 7, 8],
    };

    // An empty array is considered equal if the query filters do not have any value
    expect(filtersEqual(filterValue, queryFilterValue)).toBeTruthy();
  });
});

describe('denormalizeValue', () => {
  it('should denormalize values as expected', () => {
    // String array of numbers
    expect(denormalizeValue('1,2,3')).toEqual([1, 2, 3]);
    // Even one number should become an array
    expect(denormalizeValue('1')).toEqual([1]);

    // String booleans
    expect(denormalizeValue('false')).toEqual(false);
    expect(denormalizeValue('true')).toEqual(true);

    // Text strings
    expect(denormalizeValue('filterValue1,filterValue2')).toEqual(['filterValue1', 'filterValue2']);
    expect(denormalizeValue('filterValue')).toEqual(['filterValue']);

    // Empty values
    expect(denormalizeValue('')).toEqual(null);
    expect(denormalizeValue('null')).toEqual(null);
  });
});

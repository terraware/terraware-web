import { SearchNodePayload } from 'src/types/Search';
import { SearchOrderConfig, searchAndSort, splitTrigrams } from 'src/utils/searchAndSort';

type MockResult = {
  category?: string;
  id?: number;
  name?: string;
  numberField?: number;
  numberFieldAsString?: string;
  projectName?: string;
  status?: string;
};

describe('splitTrigrams', () => {
  it('should split a string into trigrams in the same way postgres does', () => {
    const catTrigrams = [' c', ' ca', 'cat', 'at '];
    expect(splitTrigrams('cat')).toEqual(catTrigrams);

    const fooBarTrigrams = [' f', ' fo', 'foo', 'oo ', ' b', ' ba', 'bar', 'ar '];
    expect(splitTrigrams('foo|bar')).toEqual(fooBarTrigrams);
  });
});

describe('searchAndSort', () => {
  it('should return the results in the same order if no search or sort are provided', () => {
    const results: MockResult[] = [
      {
        category: 'Legal Eligibility',
        id: 1,
        name: 'Incorporation Documents',
        numberField: 2,
        numberFieldAsString: '7',
        projectName: 'Omega Project',
        status: 'Rejected',
      },
      {
        category: 'Financial Viability',
        id: 9,
        name: 'Budget',
        numberField: 0,
        numberFieldAsString: '2',
        projectName: 'Omega Project',
        status: 'Not Submitted',
      },
      {
        category: 'GIS',
        id: 3,
        name: 'A Document',
        numberField: 3,
        numberFieldAsString: '1',
        projectName: 'Another Project',
        status: 'Submitted',
      },
    ];

    expect(searchAndSort(results)).toEqual(results);
  });

  it('should filter the results as expected - or with fuzzy search filter', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        projectName: 'Project 1',
      },
      {
        name: 'Budget',
        projectName: 'Corpotrees',
      },
      {
        name: 'A Document',
        projectName: 'Project 1',
      },
    ];

    const searchValue = 'corpot';

    const search: SearchNodePayload = {
      operation: 'or',
      children: [
        {
          operation: 'field',
          field: 'name',
          type: 'Fuzzy',
          values: [searchValue],
        },
        {
          operation: 'field',
          field: 'projectName',
          type: 'Fuzzy',
          values: [searchValue],
        },
      ],
    };

    const filteredResults: MockResult[] = [
      {
        name: 'Incorporation Documents',
        projectName: 'Project 1',
      },
      {
        name: 'Budget',
        projectName: 'Corpotrees',
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - or with exact search filter', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        projectName: 'Project 1',
      },
      {
        name: 'Budget',
        projectName: 'Corpotrees',
      },
      {
        name: 'A Document',
        projectName: 'Project 1',
      },
    ];

    const searchValue = 'corpot';

    const search: SearchNodePayload = {
      operation: 'or',
      children: [
        {
          operation: 'field',
          field: 'name',
          type: 'Exact',
          values: [searchValue],
        },
        {
          operation: 'field',
          field: 'projectName',
          type: 'Exact',
          values: [searchValue],
        },
      ],
    };

    const filteredResults: MockResult[] = [
      {
        name: 'Budget',
        projectName: 'Corpotrees',
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - not filter - string', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        status: 'Rejected',
      },
      {
        name: 'Budget',
        projectName: 'Submitted',
      },
      {
        name: 'A Document',
        projectName: 'Submitted',
      },
    ];

    const search: SearchNodePayload = {
      operation: 'not',
      child: {
        operation: 'field',
        field: 'status',
        type: 'Exact',
        values: ['Rejected'],
      },
    };

    const filteredResults: MockResult[] = [
      {
        name: 'Budget',
        projectName: 'Submitted',
      },
      {
        name: 'A Document',
        projectName: 'Submitted',
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - not filter - number', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        id: 1,
      },
      {
        name: 'Budget',
        id: 2,
      },
      {
        name: 'A Document',
        id: 3,
      },
    ];

    const search: SearchNodePayload = {
      operation: 'not',
      child: {
        operation: 'field',
        field: 'id',
        type: 'Exact',
        values: ['1'],
      },
    };

    const filteredResults: MockResult[] = [
      {
        name: 'Budget',
        id: 2,
      },
      {
        name: 'A Document',
        id: 3,
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - and filter with multiselect', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        status: 'Rejected',
        category: 'GIS',
      },
      {
        name: 'Budget',
        status: 'Submitted',
        category: 'GIS',
      },
      {
        name: 'A Document',
        status: 'Submitted',
        category: 'Legal',
      },
    ];

    const search: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'status',
          type: 'Exact',
          values: ['Submitted'],
        },
        {
          operation: 'field',
          field: 'category',
          type: 'Exact',
          values: ['GIS', 'Legal'],
        },
      ],
    };

    const filteredResults: MockResult[] = [
      {
        name: 'Budget',
        status: 'Submitted',
        category: 'GIS',
      },
      {
        name: 'A Document',
        status: 'Submitted',
        category: 'Legal',
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - complex filter with sorting', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        status: 'Rejected',
        category: 'GIS',
        projectName: 'Project 1',
      },
      {
        name: 'Budget',
        status: 'Submitted',
        category: 'GIS',
        projectName: 'Corpotrees',
      },
      {
        name: 'A Document',
        status: 'Submitted',
        category: 'Legal',
        projectName: 'Corpotrees',
      },
    ];

    const searchValue = 'corpot';
    const statusMultiSelect = ['Submitted'];
    const categoryMultiSelect = ['GIS', 'Legal'];
    const searchOrderConfig: SearchOrderConfig = {
      locale: 'en',
      sortOrder: {
        field: 'name',
        direction: 'Ascending',
      },
      numberFields: ['id', 'numberField', 'numberFieldAsString'],
    };

    const search: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'or',
          children: [
            {
              operation: 'field',
              field: 'name',
              type: 'Fuzzy',
              values: [searchValue],
            },
            {
              operation: 'field',
              field: 'projectName',
              type: 'Fuzzy',
              values: [searchValue],
            },
          ],
        },
        {
          operation: 'field',
          field: 'status',
          type: 'Exact',
          values: statusMultiSelect,
        },
        {
          operation: 'field',
          field: 'category',
          type: 'Exact',
          values: categoryMultiSelect,
        },
      ],
    };

    const filteredResults: MockResult[] = [
      {
        name: 'A Document',
        status: 'Submitted',
        category: 'Legal',
        projectName: 'Corpotrees',
      },
      {
        name: 'Budget',
        status: 'Submitted',
        category: 'GIS',
        projectName: 'Corpotrees',
      },
    ];

    expect(searchAndSort(results, search, searchOrderConfig)).toEqual(filteredResults);
  });

  it('should sort the results as expected for a string field', () => {
    const searchOrderConfig: SearchOrderConfig = {
      locale: 'en',
      sortOrder: {
        field: 'name',
        direction: 'Ascending',
      },
      numberFields: ['id', 'numberField', 'numberFieldAsString'],
    };

    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
      },
      {
        name: 'Budget',
      },
      {
        name: 'A Document',
      },
    ];

    const sortedResultsAscending: MockResult[] = [
      {
        name: 'A Document',
      },
      {
        name: 'Budget',
      },
      {
        name: 'Incorporation Documents',
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsAscending);

    searchOrderConfig.sortOrder.direction = 'Descending';
    const sortedResultsDescending: MockResult[] = [
      {
        name: 'Incorporation Documents',
      },
      {
        name: 'Budget',
      },
      {
        name: 'A Document',
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsDescending);
  });

  it('should sort the results as expected for a number field', () => {
    const searchOrderConfig: SearchOrderConfig = {
      locale: 'en',
      sortOrder: {
        field: 'numberField',
        direction: 'Ascending',
      },
      numberFields: ['numberField', 'numberFieldAsString'],
    };

    const results: MockResult[] = [
      {
        numberField: 7,
      },
      {
        numberField: 1,
      },
      {
        numberField: 3,
      },
    ];

    const sortedResultsAscending: MockResult[] = [
      {
        numberField: 1,
      },
      {
        numberField: 3,
      },
      {
        numberField: 7,
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsAscending);

    searchOrderConfig.sortOrder.direction = 'Descending';
    const sortedResultsDescending: MockResult[] = [
      {
        numberField: 7,
      },
      {
        numberField: 3,
      },
      {
        numberField: 1,
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsDescending);
  });

  it('should sort the results as expected for a number field that is a string in the result', () => {
    const searchOrderConfig: SearchOrderConfig = {
      locale: 'en',
      sortOrder: {
        field: 'numberFieldAsString',
        direction: 'Ascending',
      },
      numberFields: ['numberField', 'numberFieldAsString'],
    };

    const results: MockResult[] = [
      {
        numberFieldAsString: '7',
      },
      {
        numberFieldAsString: '1',
      },
      {
        numberFieldAsString: '3',
      },
    ];

    const sortedResultsAscending: MockResult[] = [
      {
        numberFieldAsString: '1',
      },
      {
        numberFieldAsString: '3',
      },
      {
        numberFieldAsString: '7',
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsAscending);

    searchOrderConfig.sortOrder.direction = 'Descending';
    const sortedResultsDescending: MockResult[] = [
      {
        numberFieldAsString: '7',
      },
      {
        numberFieldAsString: '3',
      },
      {
        numberFieldAsString: '1',
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsDescending);
  });
});

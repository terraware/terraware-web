import { SearchNodePayload } from 'src/types/Search';
import {
  SearchNodeModifyConfig,
  SearchOrderConfig,
  modifySearchNode,
  searchAndSort,
  splitTrigrams,
  trigramWordSimilarity,
} from 'src/utils/searchAndSort';

type MockResult = {
  category?: string;
  id?: number;
  name?: string;
  numberField?: number;
  'numberField(raw)'?: number;
  numberFieldAsString?: string;
  projectName?: string;
  status?: string;
};

describe('splitTrigrams', () => {
  it('should split a string into trigrams in the same way postgres does', () => {
    /**
     * select show_trgm('cat');
     *         show_trgm
     * -------------------------
     * {'  c',' ca','at ',cat}
     */
    expect(splitTrigrams('cat')).toEqual(new Set(['  c', ' ca', 'at ', 'cat']));

    /**
     * select show_trgm('foo|bar');
     *                   show_trgm
     * -----------------------------------------------
     * {'  b','  f',' ba',' fo','ar ',bar,foo,'oo '}
     */
    expect(splitTrigrams('foo|bar')).toEqual(new Set(['  b','  f',' ba',' fo','ar ','bar','foo','oo ']));

    /**
     * select show_trgm('olyolyoxenfree');
     *                           show_trgm
     * -------------------------------------------------------------
     * {'  o',' ol','ee ',enf,fre,lyo,nfr,oly,oxe,ree,xen,yol,yox}
     */
    expect(splitTrigrams('olyolyoxenfree')).toEqual(new Set(['  o',' ol','ee ','enf','fre','lyo','nfr','oly','oxe','ree','xen','yol','yox']));

    /**
     * select show_trgm('sam');
     *         show_trgm
     * -------------------------
     * {'  s',' sa','am ',sam}
     */
    expect(splitTrigrams('sam')).toEqual(new Set(['  s',' sa','am ','sam']));
  });
});

describe('trigramWordSimilarity', () => {
  it('should calculate the trigram word similarity same way postgres does', () => {
    /**
     * SELECT word_similarity('sam', 'sampson road');
     *  word_similarity
     * -----------------
     *            0.75
     */
    expect(trigramWordSimilarity('sam', 'sampson')).toEqual(0.75);

    /**
     * SELECT word_similarity('sampson', 'sam');
     * word_similarity
     * -----------------
     *           0.375
     */
    expect(trigramWordSimilarity('sampson', 'sam')).toEqual(0.375);

    /**
     * SELECT word_similarity('andro', 'project andromeda');
     * word_similarity
     * -----------------
     *       0.8333333
     */
    expect(trigramWordSimilarity('andro', 'project andromeda')).toEqual(0.8333333333333334);

    /**
     * I was unable to make this work exactly like postgres. I spent way too long trying to get to
     * 3/11 matching trigrams when there are 12 unique trigrams, and 15 trigrams total for the two
     * words. There is likely something I am missing in the underlying postgres implementation. I
     * spent some time reading it, trying to understand where I was going wrong, but my C skills
     * are non-existent. Hopefully this implementation is 'close enough' to work. If we need closer
     * parity to the BE Search API, we should implement the API there instead of doing the fuzzy
     * search here.
     */
    /**
     * SELECT word_similarity('pronect', 'pripro');
     * word_similarity
     * -----------------
     *       0.27272728
     */
    /**
     * SELECT UNNEST(show_trgm('pronect')) INTERSECT SELECT UNNEST(show_trgm('pripro'));
     * unnest
     * --------
     *   pr
     *   p
     * pro
     * (3 rows)
     *
     * SELECT UNNEST(show_trgm('pronect')) union SELECT UNNEST(show_trgm('pripro'));
     * unnest
     * --------
     *   p
     * ipr
     * ron
     * pri
     * pro
     * nec
     *   pr
     * rip
     * ct
     * ro
     * one
     * ect
     * (12 rows)
     */
    expect(trigramWordSimilarity('pronect', 'pripro')).toEqual(0.375);
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

  it('should filter the results as expected - or with fuzzy search filter - single letter', () => {
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

    const searchValue = 'p';

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
      {
        name: 'A Document',
        projectName: 'Project 1',
      },
    ];

    expect(searchAndSort(results, search)).toEqual(filteredResults);
  });

  it('should filter the results as expected - or with fuzzy search filter - fuzzy similarity', () => {
    const results: MockResult[] = [
      {
        name: 'Incorporation Documents',
        // This project should match because it is similar enough to the search term
        projectName: 'Project 1',
      },
      {
        name: 'Budget',
        projectName: 'Corpotrees',
      },
      {
        name: 'A Document',
        // This project has matching trigrams, but is below the similarity threshold
        projectName: 'Pripr',
      },
    ];

    const searchValue = 'pronect';

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

  it('should sort the results as expected for a number field - test fallback from `$field(raw)` to `$field` to `0`', () => {
    const searchOrderConfig: SearchOrderConfig = {
      locale: 'en',
      sortOrder: {
        field: 'numberField',
        direction: 'Ascending',
      },
      numberFields: ['numberField'],
    };

    const results: MockResult[] = [
      // Falls back to `numberField(raw)`
      {
        id: 1,
        'numberField(raw)': 7,
      },
      // Falls back to `numberField(raw)`
      {
        id: 2,
        'numberField(raw)': 2,
      },
      // Falls back to `numberField`
      {
        id: 3,
        numberField: 1,
      },
      // Falls back to 0
      {
        id: 4,
      },
    ];

    const sortedResultsAscending: MockResult[] = [
      {
        id: 4,
      },
      {
        id: 3,
        numberField: 1,
      },
      {
        id: 2,
        'numberField(raw)': 2,
      },
      {
        id: 1,
        'numberField(raw)': 7,
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsAscending);

    searchOrderConfig.sortOrder.direction = 'Descending';
    const sortedResultsDescending: MockResult[] = [
      {
        id: 1,
        'numberField(raw)': 7,
      },
      {
        id: 2,
        'numberField(raw)': 2,
      },
      {
        id: 3,
        numberField: 1,
      },
      {
        id: 4,
      },
    ];

    expect(searchAndSort(results, undefined, searchOrderConfig)).toEqual(sortedResultsDescending);
  });
});

describe('modifySearchNode', () => {
  it('modifies nested search nodes as expected - with condition and append operation', () => {
    const search: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'and',
          children: [
            {
              field: 'status',
              operation: 'field',
              type: 'Exact',
              values: ['In Review'],
            },
          ],
        },
      ],
    };

    const modifyStatus: SearchNodeModifyConfig = {
      field: 'status',
      operation: 'APPEND',
      values: ['Needs Translation'],
      condition: (values) => values.includes('In Review'),
    };

    const expectedSearch: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'and',
          children: [
            {
              field: 'status',
              operation: 'field',
              type: 'Exact',
              values: ['In Review', 'Needs Translation'],
            },
          ],
        },
      ],
    };

    expect(modifySearchNode(modifyStatus, search)).toEqual(expectedSearch);
  });

  it('modifies nested search nodes as expected - no condition and replace operation', () => {
    const search: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'and',
          child: {
            field: 'status',
            operation: 'field',
            type: 'Exact',
            values: ['Ignore field 1', 'Ignore field 2'],
          },
        },
      ],
    };

    const modifyStatus: SearchNodeModifyConfig = {
      field: 'status',
      operation: 'REPLACE',
      values: ['User Visible Field'],
    };

    const expectedSearch: SearchNodePayload = {
      operation: 'and',
      children: [
        {
          operation: 'and',
          child: {
            field: 'status',
            operation: 'field',
            type: 'Exact',
            values: ['User Visible Field'],
          },
        },
      ],
    };

    expect(modifySearchNode(modifyStatus, search)).toEqual(expectedSearch);
  });
});

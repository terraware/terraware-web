import { rstest } from '@rstest/core';

import './observations';

type QueryDefinition = {
  query: (ids: number[]) => {
    body: {
      prefix: string;
      search: unknown;
    };
  };
};

const definitions = rstest.hoisted(() => ({}) as Record<string, QueryDefinition>);

rstest.mock('../baseApi', () => ({
  baseApi: {
    injectEndpoints: ({
      endpoints,
    }: {
      endpoints: (build: {
        query: (definition: QueryDefinition) => QueryDefinition;
      }) => Record<string, QueryDefinition>;
    }) => {
      Object.assign(definitions, endpoints({ query: (definition) => definition }));
      return {};
    },
  },
}));

describe('observation plot CSV query', () => {
  test('includes selected observations of every type without exporting unselected observations', () => {
    const query = definitions.exportBiomassPlotsCsv.query([11, 7, 24]);

    expect(query.body.prefix).toBe('observationPlots');
    expect(query.body.search).toEqual({
      operation: 'field',
      type: 'Exact',
      field: 'observation_id',
      values: ['11', '7', '24'],
    });
  });
});

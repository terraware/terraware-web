import { rstest } from '@rstest/core';

import './observations';

type QueryDefinition = {
  query: (ids: number[]) => {
    body: {
      prefix: string;
      search: unknown;
      sortOrder: { field: string; direction?: string }[];
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

describe('CSV plot sorting', () => {
  test('sorts plot CSV rows by plot number descending', () => {
    expect(definitions.exportBiomassPlotsCsv.query([1]).body.sortOrder).toEqual([
      { field: 'monitoringPlot_plotNumber', direction: 'Descending' },
    ]);
  });

  test('groups trees by descending plot number while retaining species, tree and trunk order', () => {
    expect(definitions.exportBiomassTreesShrubsCsv.query([1]).body.sortOrder).toEqual([
      { field: 'monitoringPlot_plotNumber', direction: 'Descending' },
      { field: 'biomassSpecies_name' },
      { field: 'treeNumber' },
      { field: 'trunkNumber' },
    ]);
  });

  test('groups species by descending plot number while retaining species and quadrat order', () => {
    expect(definitions.exportBiomassSpeciesCsv.query([1]).body.sortOrder).toEqual([
      { field: 'monitoringPlot_plotNumber', direction: 'Descending' },
      { field: 'name' },
      { field: 'quadratSpecies_position' },
    ]);
  });
});

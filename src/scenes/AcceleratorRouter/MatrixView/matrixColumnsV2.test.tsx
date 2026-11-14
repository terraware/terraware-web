import React from 'react';

import { rs } from '@rstest/core';
import { EditableTableV2 } from '@terraware/web-components';
import { screen } from '@testing-library/react';

import { renderWithProviders } from 'src/test-utils';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import { buildMatrixColumnsV2, matchesMatrixSelection } from './matrixColumnsV2';
import { project, variable } from './matrixTestUtils';

it('matches complete original option names, never fragments or rendered labels', () => {
  expect(matchesMatrixSelection(project, 'v', ['Forest, coastal'])).toBe(true);
  expect(matchesMatrixSelection(project, 'v', ['Forest'])).toBe(false);
  expect(matchesMatrixSelection(project, 'v', [])).toBe(true);
  expect(matchesMatrixSelection(project, 'missing', ['Forest'])).toBe(false);
  const columns = buildMatrixColumnsV2({
    variableIds: ['v'],
    variables: [
      {
        ...variable,
        type: 'Select',
        isMultiple: true,
        options: [{ id: 7, name: 'Forest, coastal', renderedText: 'Coastal forest' }],
      },
    ],
    countryNames: [],
    dateLocale: 'en',
    canEdit: false,
    save: rs.fn(),
  });
  expect(columns.find((column) => column.id === 'v')?.filterSelectOptions).toEqual(['Forest, coastal']);
  expect(columns.every((column) => column.enableEditing === false)).toBe(true);
});

it.each(['Number', 'Date'] as const)('preserves %s range filtering in the V2 table', (type) => {
  const definition: VariableUnion = { ...variable, type };
  const included = type === 'Number' ? { 'numberValue(raw)': 0 } : { dateValue: '2025-01-02' };
  const excluded = type === 'Number' ? { 'numberValue(raw)': 9 } : { dateValue: '2026-01-02' };
  const data = [included, excluded].map((value, index) => ({
    ...project,
    id: index + 1,
    acceleratorDetails_dealName: index ? 'Excluded' : 'Included',
    variables: [{ ...project.variables[0], type, values: [{ variableValueId: '3', ...value }] }],
  }));
  const columns = buildMatrixColumnsV2({
    variableIds: ['v'],
    variables: [definition],
    countryNames: [],
    dateLocale: 'en',
    canEdit: true,
    save: rs.fn(),
  });
  renderWithProviders(
    <EditableTableV2
      columns={columns}
      data={data}
      clearAllFiltersLabel='Clear'
      enableColumnFilters
      tableOptions={{
        initialState: {
          columnFilters: [{ id: 'v', value: type === 'Number' ? ['0', '0'] : ['2025-01-01', '2025-01-03'] }],
        },
      }}
    />
  );
  expect(screen.getByRole('cell', { name: 'Included' })).toBeInTheDocument();
  expect(screen.queryByRole('cell', { name: 'Excluded' })).not.toBeInTheDocument();
});

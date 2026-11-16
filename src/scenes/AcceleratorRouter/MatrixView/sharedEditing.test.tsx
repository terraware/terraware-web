import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { buildUser, captureRequests, mockGet, mockPost, renderWithProviders } from 'src/test-utils';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import MatrixView from './index';
import { MatrixRow } from './matrixValues';

const { featureEnabled } = rs.hoisted(() => ({ featureEnabled: rs.fn(() => false) }));
rs.mock('src/features', () => ({ useFeatureEnabled: featureEnabled }));
const variable: VariableUnion = {
  id: 2,
  stableId: 'v',
  name: 'Habitat',
  type: 'Select',
  isMultiple: true,
  internalOnly: false,
  isList: false,
  isRequired: false,
  options: [
    { id: 7, name: 'Forest, coastal', renderedText: 'Coastal forest' },
    { id: 8, name: 'Forest' },
  ],
};
const project: MatrixRow = {
  id: 1,
  name: 'Project',
  acceleratorDetails_dealName: 'Project',
  country_name: 'Brazil',
  internalUsers: [],
  variables: [
    {
      id: '2',
      stableId: 'v',
      variableName: 'Habitat',
      type: 'Select',
      values: [{ variableValueId: '3', options: [{ id: '7', name: 'Forest, coastal', position: '0' }] }],
    },
  ],
};

describe.each([false])('shared Matrix editing (V2: %s)', (enabled) => {
  const setup = (definition: VariableUnion = variable, row = project, filter?: string | unknown[]) => {
    localStorage.clear();
    featureEnabled.mockReturnValue(enabled);
    localStorage.setItem('matrixView-columnVisibility', JSON.stringify({ v: true }));
    if (filter) {
      localStorage.setItem(
        'matrixView_columnFilters',
        JSON.stringify([{ id: 'v', value: Array.isArray(filter) ? filter : [filter] }])
      );
    }
    const currentUser = buildUser({ globalRoles: ['Super-Admin'] });
    mockGet('/api/v1/users/me', { user: currentUser });
    mockGet('/api/v1/users/me/preferences', { preferences: {} });
    mockGet('/api/v1/users/me/savedTableViews', { views: [] });
    mockGet('/api/v1/document-producer/variables', { variables: [definition] });
    const control = {
      ...project,
      id: 2,
      name: 'Control',
      acceleratorDetails_dealName: 'Control',
      variables: [
        {
          ...project.variables[0],
          values: [{ variableValueId: '4', options: [{ id: '8', name: 'Forest', position: '1' }] }],
        },
      ],
    };
    mockPost('/api/v1/search', { results: typeof filter === 'string' ? [row, control] : [row] });
    const requests = captureRequests('post', '/api/v1/document-producer/projects/1/values');
    return { ...renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } }), requests };
  };

  it('preserves comma-containing selections and saves original multi-select IDs', async () => {
    const { user, requests } = setup();
    await user.dblClick(await screen.findByRole('cell', { name: 'Forest, coastal' }));
    await user.click(screen.getByRole('combobox', { name: strings.SELECT_OPTIONS }));
    expect(screen.getByRole('checkbox', { name: 'Coastal forest' })).toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Forest' }));
    await user.click(screen.getByRole('cell', { name: 'Project' }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      operations: [
        { operation: 'Update', valueId: 3, existingValueId: 3, value: { type: 'Select', optionIds: [7, 8] } },
      ],
      updateStatuses: false,
    });
  });

  it.each([true, false])('saves single-select IDs with an existing value: %s', async (existing) => {
    const { user, requests } = setup(
      { ...variable, isMultiple: false },
      existing ? project : { ...project, variables: [] }
    );
    await screen.findByRole('columnheader', { name: /Habitat/ });
    const row = await screen.findByRole('row', { name: /^Project(?:\s|$)/ });
    const cell = within(row).getAllByRole('cell').at(-1)!;
    await user.dblClick(cell);
    const select = within(cell).getByRole('combobox');
    if (existing) {
      expect(select).toHaveTextContent('Coastal forest');
    } else {
      expect(cell.querySelector('input')).toHaveValue('');
    }
    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Forest' }));
    await user.click(screen.getByRole('cell', { name: 'Project' }));
    await waitFor(() => expect(requests).toHaveLength(1));
    expect((await requests[0].json()).operations).toEqual([
      {
        ...(existing
          ? { operation: 'Update', valueId: 3, existingValueId: 3 }
          : { operation: 'Append', variableId: 2 }),
        value: { type: 'Select', optionIds: [8] },
      },
    ]);
  });

  it.each([true, false])(
    'keeps zero and chooses a numeric editor even with an existing value: %s',
    async (existing) => {
      const definition: VariableUnion = {
        id: 2,
        stableId: 'v',
        name: 'Habitat',
        type: 'Number',
        internalOnly: false,
        isList: false,
        isRequired: false,
        decimalPlaces: 0,
      };
      const numeric = {
        ...project,
        variables: existing
          ? [{ ...project.variables[0], type: 'Number', values: [{ variableValueId: '3', 'numberValue(raw)': 0 }] }]
          : [],
      };
      const { user, requests } = setup(definition, numeric);
      await screen.findByRole('columnheader', { name: /Habitat/ });
      const row = await screen.findByRole('row', { name: /^Project(?:\s|$)/ });
      const cell = within(row).getAllByRole('cell').at(-1)!;
      expect(cell).toHaveTextContent(existing ? '0' : '');
      await user.dblClick(cell);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveDisplayValue(existing ? '0' : '');
      await user.clear(input);
      await user.type(input, existing ? '4{Enter}' : '0{Enter}');
      await waitFor(() => expect(requests).toHaveLength(1));
      expect((await requests[0].json()).operations).toEqual([
        {
          ...(existing
            ? { operation: 'Update', valueId: 3, existingValueId: 3 }
            : { operation: 'Append', variableId: 2 }),
          value: { type: 'Number', numberValue: existing ? 4 : 0 },
        },
      ]);
    }
  );

  it.each(['Forest, coastal', 'Forest'])('restores full original-name filters: %s', async (name) => {
    const { user } = setup(variable, project, name);
    const full = name === 'Forest, coastal';
    await screen.findByRole('cell', { name: full ? 'Project' : 'Control' });
    expect(screen.queryByRole('cell', { name: full ? 'Control' : 'Project' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.CLEAR_ALL_FILTERS }));
    expect(await screen.findByRole('cell', { name: 'Project' })).toBeVisible();
    expect(await screen.findByRole('cell', { name: 'Control' })).toBeVisible();
  });

  it.each(['Number', 'Date'] as const)('restores persisted %s ranges in the shared columns', async (type) => {
    const base = { id: 2, stableId: 'v', name: 'Habitat', internalOnly: false, isList: false, isRequired: false };
    const definition: VariableUnion = type === 'Number' ? { ...base, type, decimalPlaces: 0 } : { ...base, type };
    const values = type === 'Number' ? { 'numberValue(raw)': 0 } : { dateValue: '2026-01-01T12:00:00Z' };
    setup(
      definition,
      { ...project, variables: [{ ...project.variables[0], type, values: [{ variableValueId: '3', ...values }] }] },
      type === 'Number' ? [null, 0] : ['2026-01-01', '2026-01-01']
    );
    expect(await screen.findByRole('cell', { name: 'Project' })).toBeVisible();
  });
});

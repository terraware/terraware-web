import React from 'react';

import { rs } from '@rstest/core';
import { getTableSettings } from '@terraware/web-components';
import { screen } from '@testing-library/react';
import { useMaterialReactTable } from 'material-react-table';

import { ProjectsWithVariablesSearchResult } from 'src/queries/search/projectsWithVariables';
import { renderWithProviders } from 'src/test-utils';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import ColumnsModal from './ColumnsModal';

rs.mock('src/hooks/useDeliverablesWithOverdue', () => ({ default: () => ({ deliverables: [] }) }));

it('pins and unpins the correct stable ID when variables share a display name', async () => {
  const variables: VariableUnion[] = [1, 2].map((id) => ({
    id,
    stableId: `v${id}`,
    name: 'Same name',
    type: 'Text',
    textType: 'SingleLine',
    internalOnly: false,
    isList: false,
    isRequired: false,
  }));
  const Harness = () => {
    const table = useMaterialReactTable<ProjectsWithVariablesSearchResult>({
      columns: variables.map((v) => ({ id: v.stableId, header: v.name })),
      data: [],
      enableColumnPinning: true,
      initialState: { columnPinning: { left: ['v1'] } },
    });
    return (
      <>
        <ColumnsModal allVariables={variables} onClose={rs.fn()} onSave={rs.fn()} table={table} />
        <output data-testid='pinning'>{JSON.stringify(getTableSettings(table).columnPinning)}</output>
      </>
    );
  };
  const { user } = renderWithProviders(<Harness />);
  await user.click(await screen.findByRole('button', { name: 'Pin to left' }));
  expect(screen.getByTestId('pinning')).toHaveTextContent(JSON.stringify({ left: ['v1', 'v2'], right: [] }));
  await user.click(screen.getAllByRole('button', { name: 'Unpin column' })[1]);
  expect(screen.getByTestId('pinning')).toHaveTextContent(JSON.stringify({ left: ['v1'], right: [] }));
});

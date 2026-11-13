import React from 'react';

import { rs } from '@rstest/core';
import { screen } from '@testing-library/react';

import { ViewTable } from 'src/components/common/CurrentView/viewTable';
import { renderWithProviders } from 'src/test-utils';
import { VariableUnion } from 'src/types/documentProducer/Variable';

import ColumnsModal from './ColumnsModal';

rs.mock('src/hooks/useDeliverablesWithOverdue', () => ({ default: () => ({ deliverables: [] }) }));

it('pins the selected stable ID when two variables share a name', async () => {
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
  const pin = rs.fn();
  const settings = {
    columnFilters: [],
    columnOrder: ['v1', 'v2'],
    columnPinning: { left: ['v1'] },
    columnVisibility: {},
    globalFilter: '',
    sorting: [],
  };
  const table: ViewTable = {
    getSettings: () => settings,
    getInitialSettings: () => settings,
    getColumns: () =>
      variables.map((v) => ({ id: v.stableId, header: v.name, isVisible: true, isPinned: v.stableId === 'v1' })),
    getVisibleColumnsInDisplayOrder: () => [],
    setColumnPinning: pin,
    setColumnFilters: rs.fn(),
    setColumnOrder: rs.fn(),
    setColumnVisibility: rs.fn(),
    setGlobalFilter: rs.fn(),
    setSorting: rs.fn(),
  };
  const { user } = renderWithProviders(
    <ColumnsModal allVariables={variables} onClose={rs.fn()} onSave={rs.fn()} table={table} />
  );
  await user.click(await screen.findByRole('button', { name: 'Pin to left' }));
  expect(pin).toHaveBeenCalledWith({ left: ['v1', 'v2'], right: [] });
  await user.click(screen.getByRole('button', { name: 'Unpin column' }));
  expect(pin).toHaveBeenLastCalledWith({ left: [], right: [] });
});

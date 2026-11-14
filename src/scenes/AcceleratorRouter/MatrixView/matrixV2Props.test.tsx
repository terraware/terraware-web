import React from 'react';

import { rs } from '@rstest/core';
import { EditableTableV2 } from '@terraware/web-components';
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { mockGet, renderWithProviders } from 'src/test-utils';

import { buildMatrixV2Props } from './matrixV2Props';

it('keeps custom column management and the V2 filter control reachable', async () => {
  mockGet('/api/v1/users/me/savedTableViews', { views: [] });
  const openColumns = rs.fn();
  const props = buildMatrixV2Props({
    columns: [{ id: 'id', header: 'ID', accessorKey: 'id', filterVariant: 'text' }],
    data: [],
    isMobile: false,
    tableOptions: {},
    view: {},
    controls: {
      showColumnsModal: false,
      onColumnsClick: openColumns,
      onColumnsClose: rs.fn(),
      onColumnsSelected: rs.fn(),
    },
  });
  const { user } = renderWithProviders(<EditableTableV2 {...props} />);
  await user.click(screen.getByRole('button', { name: strings.MANAGE_COLUMNS }));
  expect(openColumns).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('textbox', { name: 'Filter: ID' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));
  expect(screen.getByRole('textbox', { name: 'Filter: ID' })).toBeInTheDocument();
});

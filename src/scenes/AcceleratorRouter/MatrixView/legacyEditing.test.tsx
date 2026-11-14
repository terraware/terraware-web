import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import MatrixView from './index';
import { setupMatrixTest } from './matrixTestUtils';

it('keeps comma-containing selections intact through legacy editing and updates the existing value', async () => {
  const { user: currentUser, requests } = setupMatrixTest();
  const { user } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await user.dblClick(await screen.findByRole('cell', { name: 'Forest, coastal' }));
  await user.click(screen.getByRole('combobox', { name: strings.SELECT_OPTIONS }));
  expect(screen.getByRole('checkbox', { name: 'Forest, coastal' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Forest' }));
  await user.click(screen.getByRole('button', { name: strings.DONE }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(await requests[0].json()).toEqual({
    operations: [{ operation: 'Update', valueId: 3, existingValueId: 3, value: { type: 'Select', optionIds: [7, 8] } }],
    updateStatuses: false,
  });
});

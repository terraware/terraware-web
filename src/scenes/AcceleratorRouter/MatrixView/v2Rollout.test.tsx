import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import MatrixView from './index';
import { setupMatrixTest } from './matrixTestUtils';

const waitForV2 = () => screen.findByRole('button', { name: 'Column actions: Habitat' });

it('uses the enabled V2 path and saves original option IDs with the editor button Enter key', async () => {
  const { user: currentUser, requests } = setupMatrixTest({ enabled: true });
  const { user } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await waitForV2();
  await user.dblClick(await screen.findByRole('cell', { name: 'Forest, coastal' }));
  await user.click(screen.getByRole('combobox', { name: strings.SELECT_OPTIONS }));
  expect(screen.getByRole('checkbox', { name: 'Forest, coastal' })).toBeChecked();
  await user.click(screen.getByRole('checkbox', { name: 'Forest' }));
  screen.getByRole('button', { name: strings.DONE }).focus();
  await user.keyboard('{Enter}');
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(await requests[0].json()).toEqual({
    operations: [{ operation: 'Update', valueId: 3, existingValueId: 3, value: { type: 'Select', optionIds: [7, 8] } }],
    updateStatuses: false,
  });
});

it('does not offer V2 editing without matrix-update permission', async () => {
  const { user: currentUser } = setupMatrixTest({ enabled: true, canEdit: false });
  const { user } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await waitForV2();
  await user.dblClick(await screen.findByRole('cell', { name: 'Forest, coastal' }));
  expect(screen.queryByRole('combobox', { name: strings.SELECT_OPTIONS })).not.toBeInTheDocument();
});

it('retains a failed V2 edit and its selected IDs', async () => {
  const { user: currentUser, requests } = setupMatrixTest({ enabled: true, failSave: true });
  const { user } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await waitForV2();
  await user.dblClick(await screen.findByRole('cell', { name: 'Forest, coastal' }));
  await user.click(screen.getByRole('combobox', { name: strings.SELECT_OPTIONS }));
  await user.click(screen.getByRole('button', { name: strings.DONE }));
  expect((await screen.findAllByText(strings.GENERIC_ERROR)).length).toBeGreaterThan(0);
  expect(screen.getByRole('checkbox', { name: 'Forest, coastal' })).toBeChecked();
  expect(requests).toHaveLength(1);
});

it('renders the V2 headers when no projects match', async () => {
  const { user } = setupMatrixTest({ enabled: true, empty: true });
  renderWithProviders(<MatrixView />, { currentUser: { user } });
  await waitForV2();
  expect(screen.queryByRole('cell', { name: 'Forest, coastal' })).not.toBeInTheDocument();
});

it.each(['Forest, coastal', 'Forest'])('restores full-name filters and public pinning: %s', async (name) => {
  const { user: currentUser } = setupMatrixTest({ enabled: true });
  const pinning = { left: ['projectName', 'v'], right: [] };
  localStorage.setItem('matrixView-columnPinning', JSON.stringify(pinning));
  localStorage.setItem('matrixView_columnFilters', JSON.stringify([{ id: 'v', value: [name] }]));
  const { user } = renderWithProviders(<MatrixView />, { currentUser: { user: currentUser } });
  await waitForV2();
  if (name === 'Forest, coastal') {
    const row = await screen.findByRole('row', { name: /Project.*Forest, coastal/ });
    expect(
      within(row)
        .getAllByRole('cell')
        .slice(0, 2)
        .every((cell) => cell.dataset.pinned === 'true')
    ).toBe(true);
  } else {
    expect(screen.queryByRole('cell', { name: 'Forest, coastal' })).not.toBeInTheDocument();
  }
  await user.click(await screen.findByRole('button', { name: strings.CLEAR_ALL_FILTERS }));
  expect(await screen.findByRole('cell', { name: 'Forest, coastal' })).toBeInTheDocument();
  await waitFor(() => expect(JSON.parse(localStorage.getItem('matrixView_columnFilters')!)).toEqual([]));
  expect(JSON.parse(localStorage.getItem('matrixView-columnPinning')!)).toEqual(pinning);
});

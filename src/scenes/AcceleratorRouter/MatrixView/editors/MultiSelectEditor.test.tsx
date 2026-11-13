import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import MultiSelectEditor from './MultiSelectEditor';

const options = [
  { label: 'Forest, coastal', value: '7' },
  { label: 'Forest', value: '8' },
];

it.each([{ value: [] }, { value: ['7'] }])('toggles full option labels and saves IDs from %j', async ({ value }) => {
  const save = rs.fn().mockResolvedValue(undefined);
  const cancel = rs.fn();
  const { user } = renderWithProviders(
    <MultiSelectEditor value={value} options={options} save={save} cancel={cancel} />
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('checkbox', { name: 'Forest, coastal' }));
  expect(screen.getByRole('checkbox', { name: 'Forest' })).not.toBeChecked();
  await user.click(screen.getByRole('button', { name: strings.DONE }));
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith(value.length ? [] : ['7']);
  expect(cancel).toHaveBeenCalledTimes(1);
});

it('retains selected IDs after failure and allows retry', async () => {
  const save = rs.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
  const cancel = rs.fn();
  const { user } = renderWithProviders(
    <MultiSelectEditor value={['7']} options={options} save={save} cancel={cancel} />
  );
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('button', { name: strings.DONE }));
  expect(await screen.findByRole('alert')).toHaveTextContent(strings.GENERIC_ERROR);
  expect(screen.getByRole('checkbox', { name: 'Forest, coastal' })).toBeChecked();
  expect(cancel).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: strings.DONE }));
  await waitFor(() => expect(cancel).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenLastCalledWith(['7']);
});

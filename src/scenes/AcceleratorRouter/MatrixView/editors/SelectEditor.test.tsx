import React from 'react';

import { rs } from '@rstest/core';
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import SelectEditor from './SelectEditor';

it.each(['Forest, coastal', strings.NONE])('saves the option ID, not its display label: %s', async (label) => {
  const save = rs.fn().mockResolvedValue(undefined);
  const { user } = renderWithProviders(
    <SelectEditor
      value='7'
      options={[
        { value: '7', label: 'Original' },
        { value: '9', label: 'Forest, coastal' },
      ]}
      save={save}
      cancel={rs.fn()}
    />
  );
  expect(screen.getByRole('combobox')).toHaveTextContent('Original');
  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: label }));
  await user.tab();
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith(label === strings.NONE ? '' : '9');
});

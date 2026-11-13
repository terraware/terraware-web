import React from 'react';

import { rs } from '@rstest/core';
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import TextEditor from './TextEditor';

it.each(['updated', ''])('saves %j once across Enter and blur', async (value) => {
  const save = rs.fn().mockResolvedValue(undefined);
  const cancel = rs.fn();
  const { user } = renderWithProviders(<TextEditor value='original' save={save} cancel={cancel} />);
  await user.clear(screen.getByRole('textbox'));
  if (value) {
    await user.type(screen.getByRole('textbox'), value);
  }
  await user.keyboard('{Enter}');
  await user.tab();
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith(value);
  expect(cancel).toHaveBeenCalledTimes(1);
});

it('retains a failed edit for retry and cancels without another save', async () => {
  const save = rs.fn().mockRejectedValue(new Error('offline'));
  const cancel = rs.fn();
  const { user } = renderWithProviders(<TextEditor value='retained' save={save} cancel={cancel} />);
  await user.keyboard('{Enter}');
  expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('retained');
  expect(cancel).not.toHaveBeenCalled();
  await user.keyboard('{Escape}');
  await user.tab();
  expect(save).toHaveBeenCalledTimes(1);
  expect(cancel).toHaveBeenCalledTimes(1);
});

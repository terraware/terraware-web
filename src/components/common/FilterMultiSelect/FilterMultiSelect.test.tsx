import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import FilterMultiSelect from '.';

test('Apply calls onConfirm with selection', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  render(
    <FilterMultiSelect
      label='Test'
      initialSelection={[1, 2]}
      onCancel={onCancel}
      onConfirm={onConfirm}
      options={[1, 2, 3]}
      renderOption={(id) => `${id}`}
    />
  );

  // should see only the option 1 and 3 pills
  expect(screen.queryByText('1')).toBeInTheDocument();
  expect(screen.queryByText('2')).not.toBeInTheDocument();
  expect(screen.queryByText('3')).toBeInTheDocument();

  // remove pill 1
  const removeButtons = screen.getAllByLabelText('remove');
  expect(removeButtons.length).toBe(2);
  fireEvent.click(removeButtons[0]);

  // should see only the option 3 pill
  expect(screen.queryByText('1')).not.toBeInTheDocument();
  expect(screen.queryByText('2')).not.toBeInTheDocument();
  expect(screen.queryByText('3')).toBeInTheDocument();

  // click the apply button
  const applyButton = screen.getByText('Apply');
  fireEvent.click(applyButton);

  // onConfirm should have been called with [3]
  expect(onCancel).not.toBeCalled();
  expect(onConfirm).toBeCalledWith([3]);
});

test('Cancel calls onCancel with selection', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  render(
    <FilterMultiSelect
      label='Test'
      initialSelection={[2]}
      onCancel={onCancel}
      onConfirm={onConfirm}
      options={[1, 2, 3]}
      renderOption={(id) => `${id}`}
    />
  );

  // should see only the option 2 pill
  expect(screen.queryByText('1')).not.toBeInTheDocument();
  expect(screen.queryByText('2')).toBeInTheDocument();
  expect(screen.queryByText('3')).not.toBeInTheDocument();

  // add option 3
  const dropdown = screen.getByLabelText('show-options');
  fireEvent.click(dropdown);
  const option = screen.getByText('3');
  fireEvent.click(option);

  // should see only the options 2 and 3 pills
  expect(screen.queryByText('1')).not.toBeInTheDocument();
  expect(screen.queryByText('2')).toBeInTheDocument();
  expect(screen.queryByText('3')).toBeInTheDocument();

  // click the cancel button
  const cancelButton = screen.getByText('Cancel');
  fireEvent.click(cancelButton);

  // onConfirm should have been called with [2, 3]
  expect(onCancel).toBeCalledWith([2, 3]);
  expect(onConfirm).not.toBeCalled();
});

test('Reset clears the selection but calls no callbacks', () => {
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  render(
    <FilterMultiSelect
      label='Test'
      initialSelection={[1, 2]}
      onCancel={onCancel}
      onConfirm={onConfirm}
      options={[1, 2, 3]}
      renderOption={(id) => `${id}`}
    />
  );

  // should see only the option 2 pill
  expect(screen.queryByText('1')).toBeInTheDocument();
  expect(screen.queryByText('2')).toBeInTheDocument();
  expect(screen.queryByText('3')).not.toBeInTheDocument();

  // click the Reset button
  const resetButton = screen.getByText('Reset');
  fireEvent.click(resetButton);

  // should see no pills, and onCancel and onConfirm aren't called
  expect(screen.queryByText('1')).not.toBeInTheDocument();
  expect(screen.queryByText('2')).not.toBeInTheDocument();
  expect(screen.queryByText('3')).not.toBeInTheDocument();
  expect(onCancel).not.toBeCalled();
  expect(onConfirm).not.toBeCalled();
});

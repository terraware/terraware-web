import React from 'react';
import { MockProxy, mock } from 'jest-mock-extended';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import strings from 'src/strings';
import PlantFilterBar from './PlantFilterBar';
import {PlantSearchOptions} from '../../../types/Plant';
import {isNullOrUndefined} from 'util';

const speciesNames = ['Common Mango', 'Hayden Mango', 'Ice Cream Mango'];
const onApplyFilters: MockProxy<() => void> = mock();
const onClearFilters: MockProxy<() => void> = mock();

beforeEach(() => {
  (onApplyFilters as jest.Mock).mockReset();
  (onClearFilters as jest.Mock).mockReset();
});

function getStartingDateInput(): HTMLInputElement {
  return screen.getByLabelText(strings.FROM) as HTMLInputElement;
}

function getCalendarInput(): HTMLInputElement {

}

function getCalendarButton(): HTMLButtonElement {

}


function getEndingDateInput(): HTMLInputElement {
  return screen.getByLabelText(strings.TO) as HTMLInputElement;
}

function getSpeciesInput(): HTMLInputElement {
  return screen.getByLabelText(strings.SPECIES) as HTMLInputElement;
}

function getNotesInput(): HTMLInputElement {
  return screen.getByRole('searchbox', {name: strings.NOTES}) as HTMLInputElement;
}

test('Renders without existing filters', () => {
  render(
    <PlantFilterBar
      speciesNames={speciesNames}
      filters={undefined}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
    />,
  );
  // All filters should be empty.
  expect(getStartingDateInput().value).toEqual('');
  expect(getEndingDateInput().value).toEqual('');
  expect(within(getSpeciesInput()).getByRole('input')).toHaveDisplayValue('');
  expect(getNotesInput().value).toEqual(undefined);

  // Species options should be correct.
  userEvent.click(getSpeciesInput());
  const speciesList = screen.getByRole('listbox', {name: strings.SPECIES});
  speciesNames.forEach((name) => {
    within(speciesList).getByText(name);
  });
});

test(`Renders with existing filters`, () => {
  const filters: PlantSearchOptions = {
    speciesName: speciesNames[0],
    minEnteredTime: '11/01/2021',
    maxEnteredTime: '11/07/2021',
    notes: 'some notes',
  };

  render(
    <PlantFilterBar
      speciesNames={speciesNames}
      filters={filters}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
    />,
  );

  expect(getStartingDateInput().value).toEqual(filters.minEnteredTime);
  expect(getSpeciesInput()).toHaveTextContent(filters.speciesName!);
  within(getNotesInput()).getByDisplayValue(filters.notes!);

  const notesInput = screen.getByPlaceholderText(strings.NOTES) as HTMLInputElement;
  expect(notesInput.value).toEqual(filters.notes);
  userEvent.clear(notesInput);
  expect(notesInput.value).toEqual('');

});
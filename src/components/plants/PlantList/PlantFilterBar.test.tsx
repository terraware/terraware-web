import React from 'react';
import { MockProxy, mock } from 'jest-mock-extended';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import strings from 'src/strings';
import { PlantSearchOptions } from 'src/types/Plant';
import PlantFilterBar from './PlantFilterBar';

const speciesNames = ['Common Mango', 'Hayden Mango', 'Ice Cream Mango'];
const onApplyFilters: MockProxy<() => void> = mock();
const onClearFilters: MockProxy<() => void> = mock();

beforeEach(() => {
  (onApplyFilters as jest.Mock).mockReset();
  (onClearFilters as jest.Mock).mockReset();
});

function getSpeciesInput(): HTMLInputElement {
  return screen.getByLabelText(strings.SPECIES) as HTMLInputElement;
}

function getNotesInput(): HTMLInputElement {
  return screen.getByRole('searchbox', { name: strings.NOTES }) as HTMLInputElement;
}

test('Renders without existing filters', () => {
  render(
    <PlantFilterBar
      speciesNames={speciesNames}
      filters={undefined}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
    />
  );

  // Species options should be correct.
  userEvent.click(getSpeciesInput());
  const speciesList = screen.getByRole('listbox', { name: strings.SPECIES });
  speciesNames.forEach((name) => {
    within(speciesList).getByText(name);
  });
});

test(`Renders with existing filters`, () => {
  const filters: PlantSearchOptions = {
    speciesName: speciesNames[0],
    minEnteredTime: undefined,
    maxEnteredTime: undefined,
    notes: 'some notes',
  };

  render(
    <PlantFilterBar
      speciesNames={speciesNames}
      filters={filters}
      onApplyFilters={onApplyFilters}
      onClearFilters={onClearFilters}
    />
  );

  expect(getSpeciesInput()).toHaveTextContent(filters.speciesName!);
  within(getNotesInput()).getByDisplayValue(filters.notes!);
});

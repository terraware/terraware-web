import React, { type JSX } from 'react';

import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';

export type InventoryFiltersType = {
  facilityIds?: number[];
  // Allows for the "No Project" filter (also known as "not present" filter, IE the field is not present)
  projectIds?: (number | null)[];
  speciesIds?: number[];
  subLocationsIds?: number[];
};

type InventoryFiltersBooleanType = {
  // Has to match up with SearchNodePayload['values']
  showEmptyBatches?: (string | null)[];
  showEmptySpecies?: (string | null)[];
};

export type InventoryFiltersUnion = InventoryFiltersType & InventoryFiltersBooleanType;

type InventoryFilterProps = {
  disabled?: boolean;
  filterKey: keyof InventoryFiltersType;
  filters: InventoryFiltersType;
  label: string;
  notPresentFilterLabel?: string;
  notPresentFilterShown?: boolean;
  options: number[];
  renderOption: (id: string | number) => string;
  setFilters: (f: InventoryFiltersType) => void;
};

export default function InventoryFilter(props: InventoryFilterProps): JSX.Element {
  const {
    disabled,
    filterKey,
    filters,
    label,
    notPresentFilterLabel,
    notPresentFilterShown,
    options,
    renderOption,
    setFilters,
  } = props;

  return (
    <FilterMultiSelectContainer<InventoryFiltersType>
      disabled={disabled}
      filterKey={filterKey}
      filters={filters}
      label={label}
      options={options}
      notPresentFilterLabel={notPresentFilterLabel}
      notPresentFilterShown={notPresentFilterShown}
      renderOption={renderOption}
      setFilters={setFilters}
    />
  );
}

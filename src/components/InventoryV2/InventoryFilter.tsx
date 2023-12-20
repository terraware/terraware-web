import React from 'react';
import FilterMultiSelectContainer from 'src/components/common/FilterMultiSelectContainer';

export type InventoryFiltersType = {
  facilityIds?: number[];
  projectIds?: number[];
  speciesIds?: number[];
  subLocationsIds?: number[];
};

type InventoryFiltersBooleanType = {
  // Has to match up with SearchNodePayload['values']
  showEmptyBatches?: (string | null)[];
};

export type InventoryFiltersUnion = InventoryFiltersType & InventoryFiltersBooleanType;

type InventoryFilterProps = {
  filters: InventoryFiltersType;
  setFilters: (f: InventoryFiltersType) => void;
  label: string;
  disabled?: boolean;
  filterKey: keyof InventoryFiltersType;
  options: number[];
  renderOption: (id: number) => string;
};

export default function InventoryFilter(props: InventoryFilterProps): JSX.Element {
  const { filters, setFilters, label, disabled, filterKey, options, renderOption } = props;

  return (
    <FilterMultiSelectContainer<InventoryFiltersType>
      filters={filters}
      setFilters={setFilters}
      label={label}
      filterKey={filterKey}
      options={options}
      renderOption={renderOption}
      disabled={disabled}
    />
  );
}

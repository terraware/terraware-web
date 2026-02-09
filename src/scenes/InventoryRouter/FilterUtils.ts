import React from 'react';

import { InventoryFiltersType } from 'src/scenes/InventoryRouter/InventoryFilter';
import { Organization } from 'src/types/Organization';
import { SearchNodePayload, SearchResponseElement } from 'src/types/Search';
import { getAllNurseries } from 'src/utils/organization';

export const getNurseryName = (facilityId: number, organization: Organization) => {
  const found = getAllNurseries(organization).find((n) => n.id.toString() === facilityId.toString());
  if (found) {
    return found.name;
  }
  return '';
};

export const removeFilter = (id: number, setFilters: React.Dispatch<React.SetStateAction<InventoryFiltersType>>) => {
  setFilters((prev) => {
    const { facilityIds } = prev;
    return {
      facilityIds: facilityIds?.filter((val) => val !== id) || [],
    };
  });
};

// This is necessary because the Batch type is not hydrated as expected when it comes back within a search response
export const isBatchEmpty = (batch: SearchResponseElement): boolean => {
  return (
    Number(batch['readyQuantity(raw)']) +
      Number(batch['activeGrowthQuantity(raw)']) +
      Number(batch['hardeningOffQuantity(raw)']) +
      Number(batch['germinatingQuantity(raw)']) ===
    0
  );
};

export const isSpeciesEmpty = (species: SearchResponseElement): boolean => {
  return !species.inventory;
};

export const convertFilterGroupToMap = (filterGroupFilters: Record<string, SearchNodePayload>): InventoryFiltersType =>
  Object.keys(filterGroupFilters).reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: filterGroupFilters[curr].values,
    }),
    {} as InventoryFiltersType
  );

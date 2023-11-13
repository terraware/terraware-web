import React from 'react';
import { Organization } from 'src/types/Organization';
import { getAllNurseries } from 'src/utils/organization';
import { InventoryFiltersType } from './InventoryFiltersPopover';

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

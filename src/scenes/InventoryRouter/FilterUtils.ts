import { Organization } from 'src/types/Organization';
import { SearchResponseElement } from 'src/types/Search';
import { Species } from 'src/types/Species';
import { getAllNurseries } from 'src/utils/organization';

export const getNurseryName = (facilityId: number, organization: Organization) => {
  const found = getAllNurseries(organization).find((n) => n.id.toString() === facilityId.toString());
  if (found) {
    return found.name;
  }
  return '';
};

const getActiveFilterNames = (columnFilter: unknown) =>
  (Array.isArray(columnFilter) ? columnFilter : [columnFilter]).filter(
    (name) => name !== undefined && name !== null && name !== ''
  );

export const getNurseryDeleteSpeciesIds = (
  columnFilter: unknown,
  species: Species[],
  speciesIds?: number[]
): number[] | undefined => {
  const activeNames = getActiveFilterNames(columnFilter);
  if (activeNames.length === 0) {
    return speciesIds?.length ? speciesIds : undefined;
  }
  return species
    .filter((s) => activeNames.includes(s.scientificName) && (!speciesIds?.length || speciesIds.includes(s.id)))
    .map((s) => s.id);
};

export const getSpeciesDeleteFacilityIds = (
  columnFilter: unknown,
  organization: Organization,
  facilityIds?: number[]
): number[] | undefined => {
  const activeNames = getActiveFilterNames(columnFilter);
  if (activeNames.length === 0) {
    return facilityIds?.length ? facilityIds : undefined;
  }
  return getAllNurseries(organization)
    .filter((n) => activeNames.includes(n.name) && (!facilityIds?.length || facilityIds.includes(n.id)))
    .map((n) => n.id);
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

export const isNurseryEmpty = (nursery: SearchResponseElement): boolean => {
  return Number(nursery['totalQuantity(raw)']) === 0 && Number(nursery['germinatingQuantity(raw)']) === 0;
};

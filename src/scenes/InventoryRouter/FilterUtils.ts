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

export const getNurseryDeleteSpeciesIds = (
  columnFilter: unknown,
  species: Species[],
  speciesIds?: number[]
): number[] | undefined => {
  const names = Array.isArray(columnFilter) ? columnFilter : [columnFilter];
  const activeNames = names.filter((name) => name !== undefined && name !== null && name !== '');
  if (activeNames.length === 0) {
    return speciesIds?.length ? speciesIds : undefined;
  }
  return species
    .filter((s) => activeNames.includes(s.scientificName) && (!speciesIds?.length || speciesIds.includes(s.id)))
    .map((s) => s.id);
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

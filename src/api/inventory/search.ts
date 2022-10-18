import { search } from 'src/api/search/search';

const getSearchPayload = (speciesId: number | string, organizationId: number | string, count: number) => {
  return {
    prefix: 'inventories',
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          values: [organizationId.toString()],
        },
        {
          operation: 'field',
          field: 'species_id',
          values: [speciesId.toString()],
        },
      ],
    },
    fields: [
      'species_id',
      'species_scientificName',
      'species_commonName',
      'facilityInventories.facility_id',
      'facilityInventories.facility_name',
      'germinatingQuantity',
      'notReadyQuantity',
      'readyQuantity',
      'totalQuantity',
    ],
    sortOrder: [
      {
        field: 'species_scientificName',
      },
      {
        field: 'facilityInventories.facility_name',
      },
    ],
    count,
  };
};

type FacilityInventory = {
  facility_id: number;
  facility_name: string;
};

export type SpeciesInventory = {
  species_id: number;
  species_scientificName: string;
  species_commonName: string;
  germinatingQuantity: number;
  notReadyQuantity: number;
  readyQuantity: number;
  totalQuantity: number;
  facilityInventories: FacilityInventory[];
};

export async function searchInventory(
  speciesId: number | string,
  organizationId: number | string,
  count: number
): Promise<SpeciesInventory | null> {
  const response: unknown[] | null = await search(getSearchPayload(speciesId, organizationId, count));
  if (response?.length) {
    return response[0] as SpeciesInventory;
  }
  return null;
}

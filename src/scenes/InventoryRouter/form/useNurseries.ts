import { useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { Facility } from 'src/types/Facility';
import { getAllNurseries } from 'src/utils/organization';

export const useNurseries = (record?: { facilityId?: number }) => {
  const { selectedOrganization } = useOrganization();

  const availableNurseries = useMemo<Facility[]>(
    () => (selectedOrganization ? getAllNurseries(selectedOrganization) : []),
    [selectedOrganization]
  );

  const facilityId = record?.facilityId;
  const selectedNursery = useMemo<Facility | undefined>(
    () =>
      availableNurseries && facilityId ? availableNurseries.find((nursery) => nursery.id === facilityId) : undefined,
    [availableNurseries, facilityId]
  );

  return { availableNurseries, selectedNursery };
};

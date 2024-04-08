import { useCallback, useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { Facility } from 'src/types/Facility';
import { getAllNurseries } from 'src/utils/organization';

export const useNurseries = (record?: { facilityId?: number }) => {
  const { selectedOrganization } = useOrganization();

  const [availableNurseries, setAvailableNurseries] = useState<Facility[]>();
  const [selectedNursery, setSelectedNursery] = useState<Facility>();

  const initNurseries = useCallback(() => {
    setAvailableNurseries(getAllNurseries(selectedOrganization));
  }, [selectedOrganization]);

  useEffect(() => {
    if (availableNurseries && record?.facilityId) {
      setSelectedNursery(availableNurseries.find((nursery) => nursery.id === record.facilityId));
    }
  }, [availableNurseries, record?.facilityId]);

  useEffect(() => {
    if (!availableNurseries) {
      initNurseries();
    }
  }, [availableNurseries, initNurseries]);

  return { availableNurseries, selectedNursery };
};

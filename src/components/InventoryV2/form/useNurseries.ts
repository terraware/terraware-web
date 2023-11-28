import { useCallback, useEffect, useState } from 'react';
import { useOrganization } from 'src/providers';
import { getAllNurseries } from 'src/utils/organization';
import { Facility } from 'src/types/Facility';

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

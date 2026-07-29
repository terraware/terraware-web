import { useEffect } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyCountAllBatchesQuery } from 'src/queries/search/batches';

export const useOrganizationHasBatches = (): boolean | undefined => {
  const { selectedOrganization } = useOrganization();
  const [countAllBatches, { currentData: batchCount }] = useLazyCountAllBatchesQuery();

  useEffect(() => {
    if (selectedOrganization) {
      void countAllBatches(selectedOrganization.id, true);
    }
  }, [countAllBatches, selectedOrganization]);

  return batchCount === undefined ? undefined : batchCount > 0;
};

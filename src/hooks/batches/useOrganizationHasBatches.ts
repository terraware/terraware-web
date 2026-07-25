import { useEffect } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyCountAllBatchesQuery } from 'src/queries/search/batches';

/**
 * Whether the selected organization has any seedling batches, or undefined until that is known.
 *
 * This is what separates "no inventory yet", which shows the onboarding page, from a search that
 * happened to match nothing.
 */
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

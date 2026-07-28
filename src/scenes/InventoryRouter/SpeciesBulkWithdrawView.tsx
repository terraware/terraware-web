import React, { type JSX, useEffect, useState } from 'react';

import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import { useLazyListBatchIdsForSpeciesQuery } from 'src/queries/search/batches';
import useQuery from 'src/utils/useQuery';

export default function SpeciesBulkWithdrawView(): JSX.Element | null {
  const { selectedOrganization } = useOrganization();
  const [speciesIds, setSpeciesIds] = useState<number[]>();
  const [source, setSource] = useState<string | null>();
  const navigate = useSyncNavigate();
  const query = useQuery();

  const [listBatchIdsForSpecies, { currentData: batchIds, isSuccess }] = useLazyListBatchIdsForSpeciesQuery();

  useEffect(() => {
    if (selectedOrganization && speciesIds) {
      void listBatchIdsForSpecies({ organizationId: selectedOrganization.id, speciesIds }, true);
    }
  }, [listBatchIdsForSpecies, selectedOrganization, speciesIds]);

  useEffect(() => {
    if (query.getAll('speciesId').length > 0) {
      setSpeciesIds(query.getAll('speciesId').map(Number));
      setSource(query.get('source'));
    } else {
      // return to inventory page if we came here from some bad url (no valid species)
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  }, [query, navigate]);

  useEffect(() => {
    if (isSuccess && !batchIds?.length) {
      // return to inventory page if we came here from some bad url (no valid species)
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  }, [batchIds, isSuccess, navigate]);

  return batchIds?.length ? <BatchWithdrawFlow batchIds={batchIds} sourcePage={source || undefined} /> : null;
}

import React, { type JSX, useEffect, useState } from 'react';

import BatchWithdrawFlow from 'src/components/BatchWithdrawFlow';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers';
import { NurseryBatchService } from 'src/services';
import useQuery from 'src/utils/useQuery';

type SpeciesBulkWithdrawViewComponentProps = {
  withdrawalCreatedCallback?: () => void;
};
export default function SpeciesBulkWithdrawView(props: SpeciesBulkWithdrawViewComponentProps): JSX.Element | null {
  const { selectedOrganization } = useOrganization();
  const { withdrawalCreatedCallback } = props;
  const [speciesIds, setSpeciesIds] = useState<string[]>();
  const [batchIds, setBatchIds] = useState<string[]>();
  const [source, setSource] = useState<string | null>();
  const navigate = useSyncNavigate();
  const query = useQuery();

  useEffect(() => {
    if (query.getAll('speciesId').length > 0) {
      setSpeciesIds(query.getAll('speciesId'));
      setSource(query.get('source'));
    } else {
      // return to inventory page if we came here from some bad url (no valid species)
      navigate({ pathname: APP_PATHS.INVENTORY });
    }
  }, [query, navigate]);

  useEffect(() => {
    const populateResults = async () => {
      if (speciesIds && selectedOrganization) {
        const searchResponse = await NurseryBatchService.getBatchIdsForSpecies(
          selectedOrganization.id,
          speciesIds.map((id) => Number(id))
        );
        const ids = searchResponse?.map((sr) => sr.id as string);
        if (ids?.length) {
          setBatchIds(ids);
        } else {
          // return to inventory page if we came here from some bad url (no valid species)
          navigate({ pathname: APP_PATHS.INVENTORY });
        }
      }
    };

    void populateResults();
  }, [speciesIds, navigate, selectedOrganization]);

  return batchIds ? (
    <BatchWithdrawFlow
      batchIds={batchIds}
      sourcePage={source || undefined}
      withdrawalCreatedCallback={withdrawalCreatedCallback}
    />
  ) : null;
}

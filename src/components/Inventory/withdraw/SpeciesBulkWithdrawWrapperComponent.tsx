import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { NurseryBatchService } from 'src/services';
import useQuery from 'src/utils/useQuery';
import BatchWithdrawFlow from './BatchWithdrawFlow';
import { APP_PATHS } from 'src/constants';

type SpeciesBulkWithdrawWrapperComponentProps = {
  withdrawalCreatedCallback?: () => void;
};
export default function SpeciesBulkWithdrawWrapperComponent(
  props: SpeciesBulkWithdrawWrapperComponentProps
): JSX.Element | null {
  const { withdrawalCreatedCallback } = props;
  const [speciesIds, setSpeciesIds] = useState<string[]>();
  const [batchIds, setBatchIds] = useState<string[]>();
  const [source, setSource] = useState<string | null>();
  const history = useHistory();
  const query = useQuery();

  useEffect(() => {
    if (query.getAll('speciesId').length > 0) {
      setSpeciesIds(query.getAll('speciesId'));
      setSource(query.get('source'));
    } else {
      // return to inventory page if we came here from some bad url (no valid species)
      history.push({ pathname: APP_PATHS.INVENTORY });
    }
  }, [query, history]);

  useEffect(() => {
    const populateResults = async () => {
      if (speciesIds) {
        const searchResponse = await NurseryBatchService.getBatchesForSpecies(speciesIds.map((id) => Number(id)));
        const ids = searchResponse?.map((sr) => sr.id as string);
        if (ids?.length) {
          setBatchIds(ids);
        } else {
          // return to inventory page if we came here from some bad url (no valid species)
          history.push({ pathname: APP_PATHS.INVENTORY });
        }
      }
    };

    populateResults();
  }, [speciesIds, history]);

  return batchIds ? (
    <BatchWithdrawFlow
      batchIds={batchIds}
      sourcePage={source || undefined}
      withdrawalCreatedCallback={withdrawalCreatedCallback}
    />
  ) : null;
}

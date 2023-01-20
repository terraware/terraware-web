import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { search } from 'src/api/search';
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
        const searchResponse = await search({
          prefix: 'batches',
          search: {
            operation: 'and',
            children: [
              {
                operation: 'field',
                field: 'species_id',
                values: speciesIds,
              },
            ],
          },
          fields: ['id'],
          count: 1000,
        });
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

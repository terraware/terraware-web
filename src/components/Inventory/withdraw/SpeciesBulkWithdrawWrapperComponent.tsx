import React, { useEffect, useState } from 'react';
import { search } from 'src/api/search';
import { ServerOrganization } from 'src/types/Organization';
import useQuery from 'src/utils/useQuery';
import BatchWithdrawFlow from './BatchWithdrawFlow';

type SpeciesBulkWithdrawWrapperComponentProps = {
  organization: ServerOrganization;
};
export default function SpeciesBulkWithdrawWrapperComponent(
  props: SpeciesBulkWithdrawWrapperComponentProps
): JSX.Element | null {
  const { organization } = props;
  const [speciesIds, setSpeciesIds] = useState<string[]>();
  const [batchIds, setBatchIds] = useState<string[]>();
  const query = useQuery();

  useEffect(() => {
    if (query.getAll('speciesId').length > 0) {
      setSpeciesIds(query.getAll('speciesId'));
    }
  }, [query]);

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
        if (ids) {
          setBatchIds(ids);
        }
      }
    };

    populateResults();
  }, [speciesIds]);

  return batchIds ? <BatchWithdrawFlow batchIds={batchIds} organization={organization} /> : null;
}

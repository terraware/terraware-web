import React, { useEffect, useState } from 'react';
import { search } from 'src/api/search';
import { ServerOrganization } from 'src/types/Organization';
import BatchWithdrawFlow from './BatchWithdrawFlow';

type SpeciesBulkComponentProps = {
  organization: ServerOrganization;
  speciesIds: string[];
};
export default function SpeciesBulkComponent(props: SpeciesBulkComponentProps): JSX.Element | null {
  const { organization, speciesIds } = props;
  const [batchesIds, setBatchesIds] = useState<string[]>();

  useEffect(() => {
    const populateResults = async () => {
      const searchResponse = await search({
        prefix: 'batches',
        search: {
          operation: 'and',
          children: [
            {
              operation: 'field',
              field: 'species_id',
              values: [speciesIds.join(',')],
            },
          ],
        },
        fields: ['id'],
        count: 1000,
      });
      const ids = searchResponse?.map((sr) => sr.id as string);
      if (ids) {
        setBatchesIds(ids);
      }
    };

    populateResults();
  }, [speciesIds]);

  return batchesIds ? <BatchWithdrawFlow batchesIds={batchesIds} organization={organization} /> : null;
}

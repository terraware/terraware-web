import React, { useEffect, useState } from 'react';
import { ServerOrganization } from 'src/types/Organization';
import useQuery from 'src/utils/useQuery';
import SpeciesBulkComponent from './SpeciesBulkComponent';
import BatchesBulkComponent from './BatchesBulkComponent';

type BulkWithdrawProps = {
  organization: ServerOrganization;
};
export default function BulkWithdraw(props: BulkWithdrawProps): JSX.Element | null {
  const query = useQuery();
  const { organization } = props;
  const [speciesIds, setSpeciesIds] = useState<string[]>();
  const [batchesIds, setBatchesIds] = useState<string[]>();

  useEffect(() => {
    if (query.getAll('speciesId').length > 0) {
      setSpeciesIds(query.getAll('speciesId'));
    } else if (query.getAll('batchId').length > 0) {
      setBatchesIds(query.getAll('batchId'));
    }
  }, [query]);

  return speciesIds && speciesIds?.length > 0 ? (
    <SpeciesBulkComponent organization={organization} speciesIds={speciesIds} />
  ) : batchesIds && batchesIds.length > 0 ? (
    <BatchesBulkComponent organization={organization} batchesIds={batchesIds} />
  ) : null;
}

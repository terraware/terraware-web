import { useEffect, useState } from 'react';

import { api as accessionsV2Api } from 'src/queries/generated/accessionsV2';
import { useAppDispatch } from 'src/redux/store';
import { Accession } from 'src/types/Accession';

import { AccessionWithdrawInfo } from './types';

const toWithdrawInfo = (accession: Accession): AccessionWithdrawInfo => ({
  id: accession.id,
  accessionNumber: accession.accessionNumber,
  speciesId: accession.speciesId,
  scientificName: accession.speciesScientificName ?? '',
  commonName: accession.speciesCommonName,
  facilityId: accession.facilityId,
  receivedDate: accession.receivedDate,
  remainingQuantity: accession.remainingQuantity,
  estimatedCount: accession.estimatedCount,
  estimatedWeight: accession.estimatedWeight,
  subsetWeight: accession.subsetWeight,
  subsetCount: accession.subsetCount,
});

type LoadResult = {
  key: string;
  accessions?: AccessionWithdrawInfo[];
  isError: boolean;
};

/**
 * Loads full, typed accessions for the given ids. The list-table search rows do not carry
 * remainingQuantity/subsetWeight/subsetCount, so the withdrawal flow fetches each accession via the
 * getAccession endpoint (reusing the RTK Query cache). Returns undefined while a request is in
 * flight, and isError when it fails.
 */
const useAccessionsByIds = (accessionIds: number[]): { accessions?: AccessionWithdrawInfo[]; isError: boolean } => {
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<LoadResult>({ key: '', isError: false });

  // Key on the ids' contents, not the array reference (which changes every render), and read the
  // ids back from the key so the effect's dependency list stays complete.
  const idsKey = accessionIds.join(',');

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',').map(Number) : [];
    const subscriptions = ids.map((id) => dispatch(accessionsV2Api.endpoints.getAccession.initiate(id)));

    let cancelled = false;
    Promise.all(subscriptions.map((sub) => sub.unwrap()))
      .then((responses) => {
        if (!cancelled) {
          setResult({
            key: idsKey,
            accessions: responses.map((response) => toWithdrawInfo(response.accession)),
            isError: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ key: idsKey, accessions: undefined, isError: true });
        }
      });

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [dispatch, idsKey]);

  const settled = result.key === idsKey;
  return { accessions: settled ? result.accessions : undefined, isError: settled ? result.isError : false };
};

export default useAccessionsByIds;

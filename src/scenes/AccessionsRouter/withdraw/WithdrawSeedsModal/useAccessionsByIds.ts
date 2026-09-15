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

const useAccessionsByIds = (accessionIds: number[]): { accessions?: AccessionWithdrawInfo[]; isError: boolean } => {
  const dispatch = useAppDispatch();
  const [accessions, setAccessions] = useState<AccessionWithdrawInfo[]>();
  const [isError, setIsError] = useState(false);

  const idsKey = [...accessionIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
    setIsError(false);

    if (accessionIds.length === 0) {
      setAccessions([]);
      return;
    }

    let cancelled = false;
    setAccessions(undefined);

    const subscriptions = accessionIds.map((id) => dispatch(accessionsV2Api.endpoints.getAccession.initiate(id)));

    Promise.all(subscriptions.map((sub) => sub.unwrap()))
      .then((responses) => {
        if (!cancelled) {
          setAccessions(responses.map((response) => toWithdrawInfo(response.accession)));
        }
      })
      .catch(() => {
        // Surface the failure instead of silently resolving to an empty list, which would leave
        // the modal rendering nothing while its parent still considers it open.
        if (!cancelled) {
          setIsError(true);
        }
      });

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
    // idsKey is the stable proxy for the accessionIds contents.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, idsKey]);

  return { accessions, isError };
};

export default useAccessionsByIds;

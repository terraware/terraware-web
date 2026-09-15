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

const useAccessionsByIds = (accessionIds: number[]): { accessions?: AccessionWithdrawInfo[] } => {
  const dispatch = useAppDispatch();
  const [accessions, setAccessions] = useState<AccessionWithdrawInfo[]>();

  const idsKey = [...accessionIds].sort((a, b) => a - b).join(',');

  useEffect(() => {
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
        if (!cancelled) {
          setAccessions([]);
        }
      });

    return () => {
      cancelled = true;
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [dispatch, idsKey]);

  return { accessions };
};

export default useAccessionsByIds;

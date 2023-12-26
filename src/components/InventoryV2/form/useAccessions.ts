import { useEffect, useMemo, useState } from 'react';
import { useOrganization } from 'src/providers';
import { requestAccessions, SearchResponseAccession } from 'src/redux/features/accessions/accessionsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectAccessions } from 'src/redux/features/accessions/accessionsSelectors';

export const useAccessions = (record?: { accessionId?: number }, speciesId?: number, excludeUsedUp?: boolean) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const accessionsResponseData = useAppSelector(selectAccessions(selectedOrganization.id, speciesId));
  const availableAccessions = useMemo(
    () => (accessionsResponseData && accessionsResponseData.accessions) || [],
    [accessionsResponseData]
  );

  const [selectedAccession, setSelectedAccession] = useState<SearchResponseAccession>();

  useEffect(() => {
    if (availableAccessions && record?.accessionId) {
      setSelectedAccession(
        availableAccessions.find((accession: SearchResponseAccession) => accession.id === `${record.accessionId}`)
      );
    }
  }, [availableAccessions, record?.accessionId]);

  useEffect(() => {
    void dispatch(requestAccessions(selectedOrganization.id, speciesId));
  }, [dispatch, selectedOrganization, speciesId]);

  return { availableAccessions, selectedAccession };
};

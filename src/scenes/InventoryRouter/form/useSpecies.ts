import { useEffect, useState } from 'react';

import { useOrganization } from 'src/providers';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Species } from 'src/types/Species';

let requestDispatched = false;

export const useSpecies = (record?: { speciesId?: number }) => {
  const { selectedOrganization } = useOrganization();
  const dispatch = useAppDispatch();

  const [availableSpecies, setAvailableSpecies] = useState<Species[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();

  const speciesResponse = useAppSelector(selectSpecies(selectedOrganization.id));

  useEffect(() => {
    if (speciesResponse?.data?.species && !availableSpecies) {
      setAvailableSpecies([...speciesResponse?.data?.species]);
    }
  }, [speciesResponse?.data?.species, availableSpecies]);

  useEffect(() => {
    if (availableSpecies && record?.speciesId) {
      setSelectedSpecies(availableSpecies.find((singleSpecies) => singleSpecies.id === record.speciesId));
    }
  }, [availableSpecies, record?.speciesId]);

  useEffect(() => {
    if (!availableSpecies && !requestDispatched && selectedOrganization.id !== -1) {
      requestDispatched = true;
      void dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [selectedOrganization.id, availableSpecies, requestDispatched, dispatch]);

  return { availableSpecies, selectedSpecies };
};

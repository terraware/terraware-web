import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useOrganization } from 'src/providers/hooks';
import { requestListInUseSpecies, requestListSpecies } from 'src/redux/features/species/speciesAsyncThunks';
import { selectSpeciesInUseListRequest, selectSpeciesListRequest } from 'src/redux/features/species/speciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Species } from 'src/types/Species';

import { SpeciesContext, SpeciesData } from './SpeciesContext';

export type Props = {
  children: React.ReactNode;
};

const SpeciesProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const [speciesRequestId, setSpeciesRequestId] = useState<string>('');
  const [inUseSpeciesRequestId, setInUseSpeciesRequestId] = useState<string>('');

  const speciesResponse = useAppSelector(selectSpeciesListRequest(speciesRequestId));
  const inUseSpeciesResponse = useAppSelector(selectSpeciesInUseListRequest(inUseSpeciesRequestId));

  const [species, setSpecies] = useState<Species[]>([]);
  const [inUseSpecies, setInUseSpecies] = useState<Species[]>([]);

  const reload = useCallback(() => {
    const speciesRequest = dispatch(requestListSpecies(selectedOrganization.id));
    const inUseSpeciesRequest = dispatch(requestListInUseSpecies(selectedOrganization.id));

    setSpeciesRequestId(speciesRequest.requestId);
    setInUseSpeciesRequestId(inUseSpeciesRequest.requestId);
  }, [dispatch, selectedOrganization, setSpeciesRequestId, setInUseSpeciesRequestId]);

  // Do a reload if organization changes
  useEffect(() => {
    reload();
  }, [selectedOrganization]);

  useEffect(() => {
    if (speciesResponse?.status === 'success') {
      setSpecies(speciesResponse.data ?? []);
    }
  }, [speciesResponse, setSpecies]);

  useEffect(() => {
    if (inUseSpeciesResponse?.status === 'success') {
      setInUseSpecies(inUseSpeciesResponse.data ?? []);
    }
  }, [inUseSpeciesResponse, setInUseSpecies]);

  const speciesData = useMemo(
    (): SpeciesData => ({
      species,
      inUseSpecies,
      reload,
    }),
    [species, inUseSpecies, reload]
  );

  return <SpeciesContext.Provider value={speciesData}>{children}</SpeciesContext.Provider>;
};

export default SpeciesProvider;

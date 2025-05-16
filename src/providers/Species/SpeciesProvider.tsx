import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useOrganization } from 'src/providers/hooks';
import { requestListSpecies } from 'src/redux/features/species/speciesAsyncThunks';
import { selectSpeciesListRequest } from 'src/redux/features/species/speciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Species } from 'src/types/Species';

import { usePlantingSiteData } from '../Tracking/PlantingSiteContext';
import { SpeciesContext, SpeciesData } from './SpeciesContext';

export type Props = {
  children: React.ReactNode;
};

const SpeciesProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const [speciesRequestId, setSpeciesRequestId] = useState<string>('');
  const [inUseSpeciesRequestId, setInUseSpeciesRequestId] = useState<string>('');

  const speciesResponse = useAppSelector(selectSpeciesListRequest(speciesRequestId));
  const inUseSpeciesResponse = useAppSelector(selectSpeciesListRequest(inUseSpeciesRequestId));

  const [species, setSpecies] = useState<Species[]>([]);
  const [inUseSpecies, setInUseSpecies] = useState<Species[]>([]);
  const { acceleratorOrganizationId } = usePlantingSiteData();

  const reload = useCallback(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId ?? selectedOrganization.id : selectedOrganization.id;
    const speciesRequest = dispatch(requestListSpecies({ organizationId: orgId }));
    const inUseSpeciesRequest = dispatch(requestListSpecies({ organizationId: orgId, inUse: true }));

    setSpeciesRequestId(speciesRequest.requestId);
    setInUseSpeciesRequestId(inUseSpeciesRequest.requestId);
  }, [
    dispatch,
    selectedOrganization,
    setSpeciesRequestId,
    setInUseSpeciesRequestId,
    isAcceleratorRoute,
    acceleratorOrganizationId,
  ]);

  // Do a reload if organization changes
  useEffect(() => {
    reload();
  }, [selectedOrganization, acceleratorOrganizationId]);

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

import React, { useCallback, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useListPlantingSitesQuery } from 'src/queries/generated/plantingSites';

import { useOrganization } from '../hooks';
import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { selectedOrganization } = useOrganization();

  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();

  const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization?.id;

  const plantingSitesQuery = useListPlantingSitesQuery(
    { organizationId: orgId!, full: true, includeZones: false },
    { skip: !orgId }
  );
  const setSelectedPlantingSite = useCallback((plantingSiteId?: number) => {
    setSelectedPlantingSiteId((prev) => (prev !== plantingSiteId ? plantingSiteId : prev));
  }, []);

  const { refetch: refetchSites } = plantingSitesQuery;

  const reload = useCallback(() => {
    void refetchSites();
  }, [refetchSites]);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      selectedPlantingSiteId,
      setAcceleratorOrganizationId,
      setSelectedPlantingSite,
      reload,
    }),
    [acceleratorOrganizationId, selectedPlantingSiteId, setAcceleratorOrganizationId, setSelectedPlantingSite, reload]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

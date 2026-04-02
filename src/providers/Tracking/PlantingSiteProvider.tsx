import React, { useCallback, useMemo, useState } from 'react';

import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();

  const setSelectedPlantingSite = useCallback((plantingSiteId?: number) => {
    setSelectedPlantingSiteId((prev) => (prev !== plantingSiteId ? plantingSiteId : prev));
  }, []);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      selectedPlantingSiteId,
      setAcceleratorOrganizationId,
      setSelectedPlantingSite,
    }),
    [acceleratorOrganizationId, selectedPlantingSiteId, setAcceleratorOrganizationId, setSelectedPlantingSite]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

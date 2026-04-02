import React, { useCallback, useMemo, useState } from 'react';

import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number>();

  const setSelectedPlantingSite = useCallback((plantingSiteId?: number) => {
    setSelectedPlantingSiteId((prev) => (prev !== plantingSiteId ? plantingSiteId : prev));
  }, []);

  const value = useMemo(
    (): PlantingSiteData => ({
      selectedPlantingSiteId,
      setSelectedPlantingSite,
    }),
    [selectedPlantingSiteId, setSelectedPlantingSite]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

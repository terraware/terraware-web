import React, { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';

const PlantsDashboardRouter = () => {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { setSelectedPlantingSite } = usePlantingSiteData();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      setSelectedPlantingSite(siteId);
    }
  }, [plantingSiteId, setSelectedPlantingSite]);

  return (
    <Routes>
      <Route path='/*' element={<PlantsDashboardView />} />
      <Route path={'/:plantingSiteId'} element={<PlantsDashboardView />} />
    </Routes>
  );
};

export default PlantsDashboardRouter;

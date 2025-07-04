import React, { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';

const PlantsDashboardRouter = () => {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { setSelectedPlantingSite } = usePlantingSiteData();
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    if (!isNaN(siteId)) {
      setSelectedPlantingSite(siteId);
    }
  }, [plantingSiteId, setSelectedPlantingSite]);

  return (
    <Routes>
      <Route path='/*' element={<PlantsDashboardView organizationId={selectedOrganization?.id} />} />
      <Route path={'/:plantingSiteId'} element={<PlantsDashboardView organizationId={selectedOrganization?.id} />} />
    </Routes>
  );
};

export default PlantsDashboardRouter;

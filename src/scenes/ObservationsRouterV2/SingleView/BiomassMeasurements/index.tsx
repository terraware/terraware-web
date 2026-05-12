import React, { type JSX, useEffect } from 'react';
import { Route, Routes, useSearchParams } from 'react-router';

import MonitoringPlotEditPhotos from '../PlantMonitoring/MonitoringPlot/MonitoringPlotEditPhotos';
import BiomassMeasurementsDetails from './BiomassMeasurementsDetails';

const BiomassMeasurementsView = (): JSX.Element => {
  const [, setSearchParams] = useSearchParams();

  useEffect(() => {
    setSearchParams(
      (prev) => {
        if (prev.get('type') === 'biomass') {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.set('type', 'biomass');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  return (
    <Routes>
      <Route path={'/plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
      <Route path={'/*'} element={<BiomassMeasurementsDetails />} />
    </Routes>
  );
};

export default BiomassMeasurementsView;

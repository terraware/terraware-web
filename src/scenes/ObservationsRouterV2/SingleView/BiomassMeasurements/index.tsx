import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import MonitoringPlotEditPhotos from '../PlantMonitoring/MonitoringPlot/MonitoringPlotEditPhotos';
import BiomassMeasurementsDetails from './BiomassMeasurementsDetails';

const BiomassMeasurementsView = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
      <Route path={'/*'} element={<BiomassMeasurementsDetails />} />
    </Routes>
  );
};

export default BiomassMeasurementsView;

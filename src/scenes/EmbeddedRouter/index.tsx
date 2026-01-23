import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import VirtualMonitoringPlotPage from '../ObservationsRouterV2/SingleView/PlantMonitoring/MonitoringPlot/VirtualMonitoringPlotPage';

const EmbeddedRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/embed/observations/:observationId/plot/:plotId/virtual'} element={<VirtualMonitoringPlotPage />} />
    </Routes>
  );
};

export default EmbeddedRouter;
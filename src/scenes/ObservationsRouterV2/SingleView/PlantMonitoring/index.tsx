import React, { type JSX, useMemo } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { useGetObservationResultsQuery } from 'src/queries/generated/observations';

import MonitoringPlotDetails from './MonitoringPlot';
import MonitoringPlotEditPhotos from './MonitoringPlot/MonitoringPlotEditPhotos';
import VirtualMonitoringPlotPage from './MonitoringPlot/VirtualMonitoringPlotPage';
import SiteDetails from './Site';
import StratumDetails from './Stratum';

const PlantMonitoringView = (): JSX.Element => {
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetObservationResultsQuery({
    observationId,
  });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  if (observationResultsLoading || !results) {
    return <BusySpinner />;
  }

  if (results.isAdHoc) {
    return (
      <Routes>
        <Route path={'plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
        <Route path={'/*'} element={<MonitoringPlotDetails />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path={'/stratum/:stratumName/plot/:monitoringPlotId/virtual/:fileId'}
        element={<VirtualMonitoringPlotPage />}
      />
      <Route path={'/stratum/:stratumName/plot/:monitoringPlotId'} element={<MonitoringPlotDetails />} />
      <Route path={'/stratum/:stratumName/plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
      <Route path={'/stratum/:stratumName'} element={<StratumDetails />} />
      <Route path={'/*'} element={<SiteDetails />} />
    </Routes>
  );
};

export default PlantMonitoringView;

import React, { type JSX, useEffect } from 'react';
import { Route, Routes, useSearchParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import MonitoringPlotEditPhotos from '../PlantMonitoring/MonitoringPlot/MonitoringPlotEditPhotos';
import BiomassMeasurementsDetails from './BiomassMeasurementsDetails';
import BiomassSiteDetails from './Site';
import BiomassStratumDetails from './Stratum';
import useBiomassPlot from './useBiomassPlot';

const BiomassMeasurementsView = (): JSX.Element => {
  const [, setSearchParams] = useSearchParams();
  const { results } = useBiomassPlot();

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

  if (!results) {
    return <BusySpinner />;
  }

  if (results.isAdHoc) {
    return (
      <Routes>
        <Route path={'/plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
        <Route path={'/*'} element={<BiomassMeasurementsDetails />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path={'/stratum/:stratumName/plot/:monitoringPlotId'} element={<BiomassMeasurementsDetails />} />
      <Route path={'/stratum/:stratumName/plot/:monitoringPlotId/photos'} element={<MonitoringPlotEditPhotos />} />
      <Route path={'/stratum/:stratumName'} element={<BiomassStratumDetails />} />
      <Route path={'/*'} element={<BiomassSiteDetails />} />
    </Routes>
  );
};

export default BiomassMeasurementsView;

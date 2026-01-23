import React from 'react';
import { useParams } from 'react-router';

import Application from 'src/components/GaussianSplat/Application';

import VirtualMonitoringPlot from './VirtualMonitoringPlot';

const VirtualMonitoringPlotPage = () => {
  const { observationId, plotId } = useParams<{
    observationId: string;
    plotId: string;
  }>();

  return (
    <Application style={{ width: '100%', height: '100%' }}>
      <VirtualMonitoringPlot observationId={observationId} monitoringPlotId={plotId} />
    </Application>
  );
};

export default VirtualMonitoringPlotPage;

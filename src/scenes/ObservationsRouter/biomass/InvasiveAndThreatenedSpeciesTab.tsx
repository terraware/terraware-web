import React from 'react';

import Card from 'src/components/common/Card';
import QuadratComponent from 'src/scenes/ObservationsRouter/biomass/QuadratComponent';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

type InvasiveAndThreatenedSpeciesTabProps = {
  monitoringPlot: ObservationMonitoringPlotResultsPayload | undefined;
};

const InvasiveAndThreatenedSpeciesTab = ({ monitoringPlot }: InvasiveAndThreatenedSpeciesTabProps) => {
  return (
    <Card radius='24px'>
      <QuadratComponent quadrat='Northwest' monitoringPlot={monitoringPlot} />
      <QuadratComponent quadrat='Northeast' monitoringPlot={monitoringPlot} />
      <QuadratComponent quadrat='Southwest' monitoringPlot={monitoringPlot} />
      <QuadratComponent quadrat='Southeast' monitoringPlot={monitoringPlot} />
    </Card>
  );
};

export default InvasiveAndThreatenedSpeciesTab;

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Card } from '@mui/material';

import Page from 'src/components/Page';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { ObservationMonitoringPlotResultsPayload } from 'src/types/Observations';

const MonitoringPlotEditPhotos = () => {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    plantingZoneName: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);
  const observationId = Number(params.observationId);
  const plantingZoneName = params.plantingZoneName;
  const monitoringPlotId = Number(params.monitoringPlotId);

  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();

  const { plantingSite, adHocObservationResults, observationResults } = usePlantingSiteData();

  const result = useMemo(() => {
    if (!Number.isNaN(observationId)) {
      return (
        observationResults?.find((_result) => _result.observationId === observationId) ??
        adHocObservationResults?.find((_result) => _result.observationId === observationId)
      );
    }
  }, [adHocObservationResults, observationId, observationResults]);

  useEffect(() => {
    if (result) {
      result.plantingZones.forEach((zone) =>
        zone.plantingSubzones.forEach((subzone) =>
          subzone.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setMonitoringPlotResult(plot);
              return;
            }
          })
        )
      );
    }
  }, [result, monitoringPlotId]);

  return (
    <Page title={monitoringPlotResult?.monitoringPlotName}>
      <Card />
    </Page>
  );
};

export default MonitoringPlotEditPhotos;

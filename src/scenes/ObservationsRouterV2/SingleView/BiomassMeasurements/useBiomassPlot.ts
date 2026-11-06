import { useMemo } from 'react';
import { useParams } from 'react-router';

import { useGetOneObservationResults } from 'src/hooks/observations';

const useBiomassPlot = () => {
  const params = useParams<{ monitoringPlotId?: string; observationId: string }>();
  const observationId = Number(params.observationId);
  const monitoringPlotId = params.monitoringPlotId === undefined ? undefined : Number(params.monitoringPlotId);

  const { data: observationResultsResponse } = useGetOneObservationResults({ observationId });
  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const monitoringPlot = useMemo(() => {
    if (results?.adHocPlot) {
      return results.adHocPlot;
    }
    if (monitoringPlotId === undefined) {
      return undefined;
    }
    return results?.strata
      .flatMap((stratum) => stratum.substrata.flatMap((substratum) => substratum.monitoringPlots))
      .find((plot) => plot.monitoringPlotId === monitoringPlotId);
  }, [monitoringPlotId, results]);

  const biomassMeasurement = useMemo(
    () => monitoringPlot?.biomassMeasurements ?? results?.biomassMeasurements,
    [monitoringPlot?.biomassMeasurements, results?.biomassMeasurements]
  );

  return { biomassMeasurement, monitoringPlot, observationId, results };
};

export default useBiomassPlot;

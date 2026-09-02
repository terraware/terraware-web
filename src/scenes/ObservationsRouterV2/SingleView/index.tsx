import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';

import BiomassMeasurementsView from './BiomassMeasurements';
import PlantMonitoringView from './PlantMonitoring';

const ObservationSingleView = (): JSX.Element => {
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const [, setSearchParams] = useSearchParams();

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetOneObservationResults({
    observationId,
  });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  const plantingSiteId = results?.plantingSiteId;
  useEffect(() => {
    if (plantingSiteId === undefined) {
      return;
    }
    setSearchParams(
      (prev) => {
        if (prev.get('plantingSiteId') === plantingSiteId.toString()) {
          return prev;
        }
        const nextParams = new URLSearchParams(prev);
        nextParams.set('plantingSiteId', plantingSiteId.toString());
        return nextParams;
      },
      { replace: true }
    );
  }, [plantingSiteId, setSearchParams]);

  if (observationResultsLoading || !results) {
    return <BusySpinner />;
  }

  if (results.type === 'Biomass Measurements') {
    return <BiomassMeasurementsView />;
  } else {
    return <PlantMonitoringView />;
  }
};

export default ObservationSingleView;

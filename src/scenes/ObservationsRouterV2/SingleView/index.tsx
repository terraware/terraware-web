import React, { type JSX, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { useGetOneObservationResults } from 'src/hooks/observations';

import BiomassMeasurementsView from './BiomassMeasurements';
import PlantMonitoringView from './PlantMonitoring';

const ObservationSingleView = (): JSX.Element => {
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const [searchParams, setSearchParams] = useSearchParams();

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetOneObservationResults({
    observationId,
  });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

  useEffect(() => {
    const plantingSiteId = results?.plantingSiteId;
    if (plantingSiteId === undefined) {
      return;
    }
    if (searchParams.get('plantingSiteId') !== plantingSiteId.toString()) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('plantingSiteId', plantingSiteId.toString());
      setSearchParams(nextParams, { replace: true });
    }
  }, [results?.plantingSiteId, searchParams, setSearchParams]);

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

import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { useGetObservationResultsQuery } from 'src/queries/generated/observations';

import BiomassMeasurementsView from './BiomassMeasurements';
import PlantMonitoringView from './PlantMonitoring';

const ObservationSingleView = (): JSX.Element => {
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const { data: observationResultsResponse, isLoading: observationResultsLoading } = useGetObservationResultsQuery({
    observationId,
  });

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);

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

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  selectPlantingSiteObservationResultsRequest,
  selectPlantingSiteObservationsRequest,
} from 'src/redux/features/observations/observationsSelectors';
import {
  requestPlantingSiteObservationResults,
  requestPlantingSiteObservations,
} from 'src/redux/features/observations/observationsThunks';
import { selectOnePlantingSite, selectPlantingSiteReportedPlants } from 'src/redux/features/tracking/trackingSelectors';
import { requestOnePlantingSite, requestPlantingSiteReportedPlants } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSite, PlantingSiteReportedPlants } from 'src/types/Tracking';

const usePlantingSite = (plantingSiteId: number) => {
  const dispatch = useAppDispatch();
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const [siteRequestId, setSiteRequestId] = useState<string>('');
  const [observationsRequestId, setObservationsRequestId] = useState<string>('');
  const [resultsRequestId, setResultsRequestId] = useState<string>('');
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');

  const [observations, setObservations] = useState<Observation[]>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>();
  const [reportedPlants, setReportedPlants] = useState<PlantingSiteReportedPlants>();

  const siteResponse = useAppSelector(selectOnePlantingSite(siteRequestId));
  const observationsResponse = useAppSelector(selectPlantingSiteObservationsRequest(observationsRequestId));
  const resultsResponse = useAppSelector(selectPlantingSiteObservationResultsRequest(resultsRequestId));
  const reportedPlantsResponse = useAppSelector(selectPlantingSiteReportedPlants(reportedPlantsRequestId));

  const reload = useCallback(() => {
    const request = dispatch(requestOnePlantingSite(plantingSiteId));
    setSiteRequestId(request.requestId);
  }, [dispatch, plantingSiteId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (plantingSite && plantingSite.id !== -1) {
      const observationsRequest = dispatch(requestPlantingSiteObservations({ plantingSiteId: plantingSite.id }));
      const resultsRequest = dispatch(requestPlantingSiteObservationResults({ plantingSiteId: plantingSite.id }));
      const reportedPlantsRequest = dispatch(requestPlantingSiteReportedPlants(plantingSite.id));
      setObservationsRequestId(observationsRequest.requestId);
      setResultsRequestId(resultsRequest.requestId);
      setReportedPlantsRequestId(reportedPlantsRequest.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (siteResponse?.status === 'success') {
      setPlantingSite(siteResponse.data);
    }
  }, [siteResponse]);

  useEffect(() => {
    if (observationsResponse?.status === 'success') {
      setObservations(observationsResponse.data ?? []);
    }
  }, [observationsResponse]);

  useEffect(() => {
    if (resultsResponse?.status === 'success') {
      setObservationResults(resultsResponse.data ?? []);
    }
  }, [resultsResponse]);

  useEffect(() => {
    if (reportedPlantsResponse?.status === 'success') {
      setReportedPlants(reportedPlantsResponse.data);
    }
  }, [reportedPlantsResponse]);

  const isLoading = useMemo(() => {
    return (
      siteResponse?.status === 'pending' ||
      observationsResponse?.status === 'pending' ||
      resultsResponse?.status === 'pending' ||
      reportedPlantsResponse?.status === 'pending'
    );
  }, [observationsResponse?.status, reportedPlantsResponse?.status, resultsResponse?.status, siteResponse?.status]);

  const latestResult = useMemo(() => {
    return observationResults?.find(
      (result) =>
        (result.state === 'Completed' || result.state === 'Abandoned') &&
        result.isAdHoc === false &&
        result.type === 'Monitoring'
    );
  }, [observationResults]);

  const latestObservation = useMemo(() => {
    return observations?.find(
      (observation) =>
        (observation.state === 'Completed' || observation.state === 'Abandoned') &&
        observation.isAdHoc === false &&
        observation.type === 'Monitoring'
    );
  }, [observations]);

  const value = useMemo(
    () => ({
      plantingSite,
      plantingSiteReportedPlants: reportedPlants,
      observations,
      observationResults,
      latestObservation,
      latestResult,
      isLoading,
      reload,
    }),
    [plantingSite, reportedPlants, observations, observationResults, latestObservation, latestResult, isLoading, reload]
  );

  return value;
};

export default usePlantingSite;

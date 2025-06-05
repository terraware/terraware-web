import { useCallback, useEffect, useMemo, useState } from 'react';

import { useOrganization } from 'src/providers';
import {
  selectOrganizationAdHocObservationResultsRequest,
  selectOrganizationAdHocObservationsRequest,
  selectOrganizationObservationResultsRequest,
  selectOrganizationObservationsRequest,
} from 'src/redux/features/observations/observationsSelectors';
import {
  requestOrganizationAdHocObservationResults,
  requestOrganizationAdHocObservations,
  requestOrganizationObservationResults,
  requestOrganizationObservations,
} from 'src/redux/features/observations/observationsThunks';
import {
  selectOrganizationReportedPlants,
  selectPlantingSiteList,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  requestListPlantingSites,
  requestOrganizationReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Observation, ObservationResultsPayload } from 'src/types/Observations';
import { PlantingSiteReportedPlants } from 'src/types/PlantingSite';
import { PlantingSite } from 'src/types/Tracking';

export const useOrgTracking = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>([]);
  const [adHocObservations, setAdHocObservations] = useState<Observation[]>([]);
  const [adHocObservationResults, setAdHocObservationResults] = useState<ObservationResultsPayload[]>([]);
  const [reportedPlants, setReportedPlants] = useState<PlantingSiteReportedPlants[]>([]);

  const [plantingSitesRequestId, setPlantingSitesRequestId] = useState<string>('');
  const [adHocObservationsRequestId, setAdHocObservationsRequestId] = useState<string>('');
  const [adHocResultsRequestId, setAdHocResultsRequestId] = useState<string>('');
  const [observationsRequestId, setObservationsRequestId] = useState<string>('');
  const [resultsRequestId, setResultsRequestId] = useState<string>('');
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');

  const plantingSitesResponse = useAppSelector(selectPlantingSiteList(plantingSitesRequestId));
  const adHocObservationsResponse = useAppSelector(
    selectOrganizationAdHocObservationsRequest(adHocObservationsRequestId)
  );
  const adHocResultsResponse = useAppSelector(selectOrganizationAdHocObservationResultsRequest(adHocResultsRequestId));
  const observationsResponse = useAppSelector(selectOrganizationObservationsRequest(observationsRequestId));
  const resultsResponse = useAppSelector(selectOrganizationObservationResultsRequest(resultsRequestId));
  const reportedPlantsResponse = useAppSelector(selectOrganizationReportedPlants(reportedPlantsRequestId));

  const reload = useCallback(() => {
    if (!selectedOrganization) return;

    const plantingSitesRequest = dispatch(requestListPlantingSites(selectedOrganization.id));
    const observationsRequest = dispatch(requestOrganizationObservations({ organizationId: selectedOrganization.id }));
    const resultsRequest = dispatch(requestOrganizationObservationResults({ organizationId: selectedOrganization.id }));
    const adHocObservationsRequest = dispatch(
      requestOrganizationAdHocObservations({ organizationId: selectedOrganization.id })
    );
    const adHocResultsRequest = dispatch(
      requestOrganizationAdHocObservationResults({ organizationId: selectedOrganization.id })
    );
    const reportedPlantsRequest = dispatch(requestOrganizationReportedPlants(selectedOrganization.id));

    setPlantingSitesRequestId(plantingSitesRequest.requestId);
    setObservationsRequestId(observationsRequest.requestId);
    setResultsRequestId(resultsRequest.requestId);
    setAdHocObservationsRequestId(adHocObservationsRequest.requestId);
    setAdHocResultsRequestId(adHocResultsRequest.requestId);
    setReportedPlantsRequestId(reportedPlantsRequest.requestId);
  }, [dispatch, selectedOrganization]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (plantingSitesResponse?.status === 'success') {
      setPlantingSites(plantingSitesResponse.data ?? []);
    }
  }, [plantingSitesResponse]);

  useEffect(() => {
    if (adHocObservationsResponse?.status === 'success') {
      setAdHocObservations(adHocObservationsResponse.data ?? []);
    }
  }, [adHocObservationsResponse]);

  useEffect(() => {
    if (adHocResultsResponse?.status === 'success') {
      setAdHocObservationResults(adHocResultsResponse.data ?? []);
    }
  }, [adHocResultsResponse]);

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
      setReportedPlants(reportedPlantsResponse.data ?? []);
    }
  }, [reportedPlantsResponse]);

  return useMemo(
    () => ({
      plantingSites,
      observations,
      observationResults,
      adHocObservations,
      adHocObservationResults,
      reload,
      reportedPlants,
    }),
    [
      plantingSites,
      observations,
      observationResults,
      adHocObservations,
      adHocObservationResults,
      reload,
      reportedPlants,
    ]
  );
};

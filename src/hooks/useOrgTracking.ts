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

export const useOrgTracking = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

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
    if (!selectedOrganization) {
      return;
    }

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

  const plantingSites = useMemo(
    () => (plantingSitesResponse?.status === 'success' ? plantingSitesResponse.data ?? [] : []),
    [plantingSitesResponse]
  );

  const adHocObservations = useMemo(
    () => (adHocObservationsResponse?.status === 'success' ? adHocObservationsResponse.data ?? [] : []),
    [adHocObservationsResponse]
  );

  const adHocObservationResults = useMemo(
    () => (adHocResultsResponse?.status === 'success' ? adHocResultsResponse.data ?? [] : []),
    [adHocResultsResponse]
  );

  const observations = useMemo(
    () => (observationsResponse?.status === 'success' ? observationsResponse.data ?? [] : []),
    [observationsResponse]
  );

  const observationResults = useMemo(
    () => (resultsResponse?.status === 'success' ? resultsResponse.data ?? [] : []),
    [resultsResponse]
  );

  const reportedPlants = useMemo(
    () => (reportedPlantsResponse?.status === 'success' ? reportedPlantsResponse.data ?? [] : []),
    [reportedPlantsResponse]
  );

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

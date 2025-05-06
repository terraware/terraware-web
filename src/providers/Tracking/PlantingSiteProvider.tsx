import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import {
  selectPlantingSiteAdHocObservationResultsRequest,
  selectPlantingSiteAdHocObservationsRequest,
  selectPlantingSiteObservationResultsRequest,
  selectPlantingSiteObservationSummaries,
  selectPlantingSiteObservationsRequest,
} from 'src/redux/features/observations/observationsSelectors';
import {
  requestPlantingSiteAdHocObservationResults,
  requestPlantingSiteAdHocObservations,
  requestPlantingSiteObservationResults,
  requestPlantingSiteObservationSummaries,
  requestPlantingSiteObservations,
} from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { Observation, ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite } from 'src/types/Tracking';

import { useOrganization } from '../hooks';
import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  const { selectedOrganization } = useOrganization();
  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [plantingSite, _setSelectedPlantingSite] = useState<PlantingSite>();
  const plantingSitesResults = useAppSelector(selectPlantingSites);
  const [observationsRequestId, setObservationsRequestId] = useState<string>('');
  const [resultsRequestId, setResultsRequestId] = useState<string>('');
  const [adHocObservationsRequestId, setAdHocObservationsRequestId] = useState<string>('');
  const [adHocResultsRequestId, setAdHocResultsRequestId] = useState<string>('');
  const [summariesRequestId, setSummariesRequestId] = useState<string>('');

  const [observations, setObservations] = useState<Observation[]>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>();
  const [observationSummaries, setObservationSummaries] = useState<ObservationSummary[]>();
  const [adHocObservations, setAdHocObservations] = useState<Observation[]>();
  const [adHocObservationResults, setAdHocObservationResults] = useState<ObservationResultsPayload[]>();

  const observationsResponse = useAppSelector(selectPlantingSiteObservationsRequest(observationsRequestId));
  const resultsResponse = useAppSelector(selectPlantingSiteObservationResultsRequest(resultsRequestId));
  const adHocObservationsResponse = useAppSelector(
    selectPlantingSiteAdHocObservationsRequest(adHocObservationsRequestId)
  );
  const adHocResultsResponse = useAppSelector(selectPlantingSiteAdHocObservationResultsRequest(adHocResultsRequestId));
  const summariesResponse = useAppSelector(selectPlantingSiteObservationSummaries(summariesRequestId));

  useEffect(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization.id;
    if (orgId) {
      void dispatch(requestPlantingSites(orgId));
      _setSelectedPlantingSite(undefined);
    }
  }, [isAcceleratorRoute, acceleratorOrganizationId, selectedOrganization]);

  const allPlantingSites = useMemo(() => plantingSitesResults ?? [], [plantingSitesResults]);

  // Function to select a planting site
  const setSelectedPlantingSite = useCallback(
    (plantingSiteId: number) => {
      const foundSite = allPlantingSites.find((site) => site.id === plantingSiteId);
      _setSelectedPlantingSite(foundSite);
    },
    [allPlantingSites]
  );

  useEffect(() => {
    if (plantingSite) {
      const observationsRequest = dispatch(requestPlantingSiteObservations({ plantingSiteId: plantingSite.id }));
      const resultsRequest = dispatch(requestPlantingSiteObservationResults({ plantingSiteId: plantingSite.id }));
      const adHocObservationsRequest = dispatch(
        requestPlantingSiteAdHocObservations({ plantingSiteId: plantingSite.id })
      );
      const adHocResultsRequest = dispatch(
        requestPlantingSiteAdHocObservationResults({ plantingSiteId: plantingSite.id })
      );
      const summariesRequest = dispatch(requestPlantingSiteObservationSummaries(plantingSite.id));
      setObservationsRequestId(observationsRequest.requestId);
      setResultsRequestId(resultsRequest.requestId);
      setAdHocObservationsRequestId(adHocObservationsRequest.requestId);
      setAdHocResultsRequestId(adHocResultsRequest.requestId);
      setSummariesRequestId(summariesRequest.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (observationsResponse) {
      if (observationsResponse.status === 'success') {
        setObservations(observationsResponse.data ?? []);
      }
    }
  }, [observationsResponse]);

  useEffect(() => {
    if (resultsResponse) {
      if (resultsResponse.status === 'success') {
        setObservationResults(resultsResponse.data ?? []);
      }
    }
  }, [resultsResponse]);

  useEffect(() => {
    if (adHocObservationsResponse) {
      if (adHocObservationsResponse.status === 'success') {
        setAdHocObservations(adHocObservationsResponse.data ?? []);
      }
    }
  }, [adHocObservationsResponse]);

  useEffect(() => {
    if (adHocResultsResponse) {
      if (adHocResultsResponse.status === 'success') {
        setAdHocObservationResults(adHocResultsResponse.data ?? []);
      }
    }
  }, [adHocResultsResponse]);

  useEffect(() => {
    if (summariesResponse) {
      if (summariesResponse.status === 'success') {
        setObservationSummaries(summariesResponse.data ?? []);
      }
    }
  }, [summariesResponse]);

  const latestObservation = useMemo(() => {
    return observationResults?.find(
      (result) =>
        (result.state === 'Completed' || result.state === 'Abandoned') &&
        result.isAdHoc === false &&
        result.type === 'Monitoring'
    );
  }, [observationResults]);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      plantingSiteHistories: [],
      adHocObservations,
      adHocObservationResults,
      observations,
      observationResults,
      observationSummaries,
      setSelectedPlantingSite,
      latestObservation,
    }),
    [
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      adHocObservations,
      adHocObservationResults,
      observationSummaries,
      observations,
      observationResults,
      setSelectedPlantingSite,
      latestObservation,
    ]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

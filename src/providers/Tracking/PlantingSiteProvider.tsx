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
import { selectPlantingSiteHistories, selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { requestListPlantingSiteHistories, requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Observation, ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory } from 'src/types/Tracking';

import { useLocalization, useOrganization } from '../hooks';
import { PlantingSiteContext, PlantingSiteData } from './PlantingSiteContext';

export type Props = {
  children: React.ReactNode;
};

const PlantingSiteProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { activeLocale } = useLocalization();

  const { selectedOrganization } = useOrganization();
  const [acceleratorOrganizationId, setAcceleratorOrganizationId] = useState<number>();
  const [plantingSite, _setSelectedPlantingSite] = useState<PlantingSite>();
  const plantingSitesResults = useAppSelector(selectPlantingSites);
  const [observationsRequestId, setObservationsRequestId] = useState<string>('');
  const [resultsRequestId, setResultsRequestId] = useState<string>('');
  const [adHocObservationsRequestId, setAdHocObservationsRequestId] = useState<string>('');
  const [adHocResultsRequestId, setAdHocResultsRequestId] = useState<string>('');
  const [summariesRequestId, setSummariesRequestId] = useState<string>('');
  const [historiesRequestId, setHistoriesRequestId] = useState<string>('');

  const [observations, setObservations] = useState<Observation[]>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>();
  const [observationSummaries, setObservationSummaries] = useState<ObservationSummary[]>();
  const [adHocObservations, setAdHocObservations] = useState<Observation[]>();
  const [adHocObservationResults, setAdHocObservationResults] = useState<ObservationResultsPayload[]>();
  const [histories, setHistories] = useState<PlantingSiteHistory[]>();

  const observationsResponse = useAppSelector(selectPlantingSiteObservationsRequest(observationsRequestId));
  const resultsResponse = useAppSelector(selectPlantingSiteObservationResultsRequest(resultsRequestId));
  const adHocObservationsResponse = useAppSelector(
    selectPlantingSiteAdHocObservationsRequest(adHocObservationsRequestId)
  );
  const adHocResultsResponse = useAppSelector(selectPlantingSiteAdHocObservationResultsRequest(adHocResultsRequestId));
  const summariesResponse = useAppSelector(selectPlantingSiteObservationSummaries(summariesRequestId));
  const historiesResponse = useAppSelector(selectPlantingSiteHistories(historiesRequestId));

  const allSitesOption = useMemo(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization.id;
    if (activeLocale && orgId) {
      return {
        name: strings.ALL_PLANTING_SITES,
        id: -1,
        organizationId: orgId,
        plantingSeasons: [],
      };
    }
  }, [activeLocale, isAcceleratorRoute, acceleratorOrganizationId, selectedOrganization]);

  useEffect(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization.id;
    if (orgId) {
      void dispatch(requestPlantingSites(orgId));
      _setSelectedPlantingSite(undefined);
    }
  }, [dispatch, isAcceleratorRoute, acceleratorOrganizationId, selectedOrganization, _setSelectedPlantingSite]);

  const allPlantingSites = useMemo(
    () => (plantingSitesResults && allSitesOption ? [...plantingSitesResults, allSitesOption] : []),
    [plantingSitesResults]
  );

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
      const historiesRequest = dispatch(requestListPlantingSiteHistories(plantingSite.id));
      setObservationsRequestId(observationsRequest.requestId);
      setResultsRequestId(resultsRequest.requestId);
      setAdHocObservationsRequestId(adHocObservationsRequest.requestId);
      setAdHocResultsRequestId(adHocResultsRequest.requestId);
      setSummariesRequestId(summariesRequest.requestId);
      setHistoriesRequestId(historiesRequest.requestId);
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

  useEffect(() => {
    if (historiesResponse) {
      if (historiesResponse.status === 'success') {
        setHistories(historiesResponse.data ?? []);
      }
    }
  }, [historiesResponse]);

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
      plantingSiteHistories: histories,
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
      histories,
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

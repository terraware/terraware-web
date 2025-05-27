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
import {
  selectPlantingSiteHistories,
  selectPlantingSiteReportedPlants,
  selectPlantingSites,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  requestListPlantingSiteHistories,
  requestPlantingSiteReportedPlants,
  requestPlantingSites,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { Observation, ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite, PlantingSiteHistory, PlantingSiteReportedPlants } from 'src/types/Tracking';

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
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');

  const [observations, setObservations] = useState<Observation[]>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>();
  const [observationSummaries, setObservationSummaries] = useState<ObservationSummary[]>();
  const [adHocObservations, setAdHocObservations] = useState<Observation[]>();
  const [adHocObservationResults, setAdHocObservationResults] = useState<ObservationResultsPayload[]>();
  const [histories, setHistories] = useState<PlantingSiteHistory[]>();
  const [reportedPlants, setReportedPlants] = useState<PlantingSiteReportedPlants>();

  const observationsResponse = useAppSelector(selectPlantingSiteObservationsRequest(observationsRequestId));
  const resultsResponse = useAppSelector(selectPlantingSiteObservationResultsRequest(resultsRequestId));
  const adHocObservationsResponse = useAppSelector(
    selectPlantingSiteAdHocObservationsRequest(adHocObservationsRequestId)
  );
  const adHocResultsResponse = useAppSelector(selectPlantingSiteAdHocObservationResultsRequest(adHocResultsRequestId));
  const summariesResponse = useAppSelector(selectPlantingSiteObservationSummaries(summariesRequestId));
  const historiesResponse = useAppSelector(selectPlantingSiteHistories(historiesRequestId));
  const reportedPlantsResponse = useAppSelector(selectPlantingSiteReportedPlants(reportedPlantsRequestId));

  const allSitesOption = useMemo(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization.id;
    if (activeLocale && orgId) {
      return {
        name: strings.ALL_PLANTING_SITES,
        id: -1,
        adHocPlots: [],
        organizationId: orgId,
        plantingSeasons: [],
      };
    }
  }, [activeLocale, isAcceleratorRoute, acceleratorOrganizationId, selectedOrganization]);

  const reload = useCallback(() => {
    const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization.id;
    if (orgId) {
      void dispatch(requestPlantingSites(orgId));
      _setSelectedPlantingSite(undefined);
    }
  }, [acceleratorOrganizationId, dispatch, isAcceleratorRoute, selectedOrganization.id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const allPlantingSites = useMemo(
    () => (plantingSitesResults && allSitesOption ? [...plantingSitesResults, allSitesOption] : []),
    [allSitesOption, plantingSitesResults]
  );

  // Function to select a planting site
  const setSelectedPlantingSite = useCallback(
    (plantingSiteId: number) => {
      const foundSite = allPlantingSites.find((site) => site.id === plantingSiteId);
      if (plantingSite !== foundSite) {
        _setSelectedPlantingSite(foundSite);
        setObservations(undefined);
        setObservationResults(undefined);
        setObservationSummaries(undefined);
        setAdHocObservations(undefined);
        setAdHocObservationResults(undefined);
        setHistories(undefined);
        setReportedPlants(undefined);
      }
    },
    [allPlantingSites, plantingSite]
  );

  useEffect(() => {
    if (plantingSite && plantingSite.id !== -1) {
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
      const reportedPlantsRequest = dispatch(requestPlantingSiteReportedPlants(plantingSite.id));
      setObservationsRequestId(observationsRequest.requestId);
      setResultsRequestId(resultsRequest.requestId);
      setAdHocObservationsRequestId(adHocObservationsRequest.requestId);
      setAdHocResultsRequestId(adHocResultsRequest.requestId);
      setSummariesRequestId(summariesRequest.requestId);
      setHistoriesRequestId(historiesRequest.requestId);
      setReportedPlantsRequestId(reportedPlantsRequest.requestId);
    }
  }, [dispatch, plantingSite]);

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
    if (summariesResponse?.status === 'success') {
      setObservationSummaries(summariesResponse.data ?? []);
    }
  }, [summariesResponse]);

  useEffect(() => {
    if (historiesResponse?.status === 'success') {
      setHistories(historiesResponse.data ?? []);
    }
  }, [historiesResponse]);

  useEffect(() => {
    if (reportedPlantsResponse?.status === 'success') {
      setReportedPlants(reportedPlantsResponse.data);
    }
  }, [reportedPlantsResponse]);

  const isLoading = useMemo(() => {
    return (
      observationsResponse?.status === 'pending' ||
      resultsResponse?.status === 'pending' ||
      adHocObservationsResponse?.status === 'pending' ||
      adHocResultsResponse?.status === 'pending' ||
      summariesResponse?.status === 'pending' ||
      historiesResponse?.status === 'pending' ||
      reportedPlantsResponse?.status === 'pending'
    );
  }, [
    adHocObservationsResponse?.status,
    adHocResultsResponse?.status,
    historiesResponse?.status,
    observationsResponse?.status,
    reportedPlantsResponse?.status,
    resultsResponse?.status,
    summariesResponse?.status,
  ]);

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

  const currentObservation = useMemo(() => {
    return observations?.find(
      (observation) =>
        observation.state === 'InProgress' && observation.isAdHoc === false && observation.type === 'Monitoring'
    );
  }, [observations]);

  const nextObservation = useMemo(() => {
    return observations?.find(
      (observation) =>
        observation.state === 'Upcoming' && observation.isAdHoc === false && observation.type === 'Monitoring'
    );
  }, [observations]);

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      plantingSiteReportedPlants: reportedPlants,
      plantingSiteHistories: histories,
      adHocObservations,
      adHocObservationResults,
      observations,
      observationResults,
      observationSummaries,
      setSelectedPlantingSite,
      currentObservation,
      latestObservation,
      nextObservation,
      latestResult,
      isLoading,
      isInitiated: plantingSitesResults !== undefined,
      reload,
    }),
    [
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      reportedPlants,
      histories,
      adHocObservations,
      adHocObservationResults,
      observationSummaries,
      observations,
      observationResults,
      setSelectedPlantingSite,
      currentObservation,
      latestObservation,
      nextObservation,
      latestResult,
      isLoading,
      plantingSitesResults,
      reload,
    ]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

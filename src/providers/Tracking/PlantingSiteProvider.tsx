import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import {
  selectPlantingSiteObservationResultsRequest,
  selectPlantingSiteObservationSummaries,
} from 'src/redux/features/observations/observationsSelectors';
import {
  requestPlantingSiteObservationResults,
  requestPlantingSiteObservationSummaries,
} from 'src/redux/features/observations/observationsThunks';
import {
  selectPlantingSiteList,
  selectPlantingSiteReportedPlants,
} from 'src/redux/features/tracking/trackingSelectors';
import {
  requestListPlantingSites,
  requestPlantingSiteReportedPlants,
} from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ObservationResultsPayload, ObservationSummary } from 'src/types/Observations';
import { PlantingSite, PlantingSiteReportedPlants } from 'src/types/Tracking';

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
  const [plantingSite, setPlantingSite] = useState<PlantingSite>();

  const [plantingSitesRequestId, setPlantingSitesRequestId] = useState<string>('');
  const [resultsRequestId, setResultsRequestId] = useState<string>('');
  const [summariesRequestId, setSummariesRequestId] = useState<string>('');
  const [reportedPlantsRequestId, setReportedPlantsRequestId] = useState<string>('');

  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>();
  const [observationResults, setObservationResults] = useState<ObservationResultsPayload[]>();
  const [observationSummaries, setObservationSummaries] = useState<ObservationSummary[]>();
  const [reportedPlants, setReportedPlants] = useState<PlantingSiteReportedPlants>();
  const [previousOrgId, setPreviousOrgId] = useState<number>(-1);

  const plantingSitesResponse = useAppSelector(selectPlantingSiteList(plantingSitesRequestId));
  const resultsResponse = useAppSelector(selectPlantingSiteObservationResultsRequest(resultsRequestId));
  const summariesResponse = useAppSelector(selectPlantingSiteObservationSummaries(summariesRequestId));
  const reportedPlantsResponse = useAppSelector(selectPlantingSiteReportedPlants(reportedPlantsRequestId));

  const orgId = isAcceleratorRoute ? acceleratorOrganizationId : selectedOrganization?.id;

  const allSitesOption = useMemo(() => {
    if (activeLocale && orgId) {
      return {
        name: strings.ALL_PLANTING_SITES,
        id: -1,
        adHocPlots: [],
        organizationId: orgId,
        plantingSeasons: [],
      };
    }
  }, [activeLocale, orgId]);

  const reload = useCallback(() => {
    if (orgId && orgId !== previousOrgId) {
      const request = dispatch(requestListPlantingSites(orgId));
      setPlantingSitesRequestId(request.requestId);
      setPreviousOrgId(orgId);
    }
  }, [dispatch, orgId, previousOrgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  // Function to select a planting site
  const setSelectedPlantingSite = useCallback(
    (plantingSiteId?: number) => {
      let foundSite = plantingSites?.find((site) => site.id === plantingSiteId);
      if (plantingSiteId === -1 && (plantingSites?.length || 0) > 0) {
        foundSite = allSitesOption;
      }
      if (plantingSite !== foundSite) {
        setPlantingSite(foundSite);
        setObservationResults(undefined);
        setObservationSummaries(undefined);
        setReportedPlants(undefined);
      }
    },
    [plantingSites, plantingSite, allSitesOption]
  );

  useEffect(() => {
    if (plantingSite && plantingSite.id !== -1) {
      const resultsRequest = dispatch(requestPlantingSiteObservationResults({ plantingSiteId: plantingSite.id }));
      const summariesRequest = dispatch(requestPlantingSiteObservationSummaries(plantingSite.id));
      const reportedPlantsRequest = dispatch(requestPlantingSiteReportedPlants(plantingSite.id));
      setResultsRequestId(resultsRequest.requestId);
      setSummariesRequestId(summariesRequest.requestId);
      setReportedPlantsRequestId(reportedPlantsRequest.requestId);
    }
  }, [dispatch, plantingSite]);

  useEffect(() => {
    if (plantingSitesResponse?.status === 'success' && plantingSitesResponse.data) {
      setPlantingSites(plantingSitesResponse.data);

      // Look up already selected planting site
      if (plantingSite) {
        setSelectedPlantingSite(plantingSite?.id);
      }
    }
  }, [plantingSite, plantingSitesResponse, setSelectedPlantingSite]);

  useEffect(() => {
    if (resultsResponse?.status === 'success') {
      setObservationResults(resultsResponse.data ?? []);
    }
  }, [resultsResponse]);

  useEffect(() => {
    if (summariesResponse?.status === 'success') {
      setObservationSummaries(summariesResponse.data ?? []);
    }
  }, [summariesResponse]);

  useEffect(() => {
    if (reportedPlantsResponse?.status === 'success') {
      setReportedPlants(reportedPlantsResponse.data);
    }
  }, [reportedPlantsResponse]);

  const allPlantingSites = useMemo(
    () =>
      plantingSites && allSitesOption
        ? [...plantingSites, allSitesOption].toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        : [],
    [activeLocale, allSitesOption, plantingSites]
  );

  const isLoading = useMemo(() => {
    return (
      plantingSitesResponse?.status === 'pending' ||
      resultsResponse?.status === 'pending' ||
      summariesResponse?.status === 'pending' ||
      reportedPlantsResponse?.status === 'pending'
    );
  }, [
    plantingSitesResponse?.status,
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

  const value = useMemo(
    (): PlantingSiteData => ({
      acceleratorOrganizationId,
      setAcceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      plantingSiteReportedPlants: reportedPlants,
      observationSummaries,
      setSelectedPlantingSite,
      latestResult,
      isLoading,
      isInitiated: plantingSitesResponse?.status === 'success',
      reload,
    }),
    [
      acceleratorOrganizationId,
      allPlantingSites,
      plantingSite,
      reportedPlants,
      observationSummaries,
      setSelectedPlantingSite,
      latestResult,
      isLoading,
      plantingSitesResponse,
      reload,
    ]
  );

  return <PlantingSiteContext.Provider value={value}>{children}</PlantingSiteContext.Provider>;
};

export default PlantingSiteProvider;

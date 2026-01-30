import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs, Tooltip } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import strings from 'src/strings';
import {
  ObservationMonitoringPlotResultsPayload,
  ObservationSpeciesResults,
  ObservationStratumResultsPayload,
  ObservationSubstratumResultsPayload,
} from 'src/types/Observations';
import useStickyTabs from 'src/utils/useStickyTabs';

import ObservationDataTab from './ObservationDataTab';
import PhotosAndVideosTab from './PhotosAndVideosTab';

export default function ObservationMonitoringPlotDetails(): JSX.Element | undefined {
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
    stratumName: string;
    monitoringPlotId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId);
  const observationId = Number(params.observationId);
  const stratumName = params.stratumName;
  const monitoringPlotId = Number(params.monitoringPlotId);

  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { activeLocale } = useLocalization();

  const { species } = useSpeciesData();
  const { plantingSite, adHocObservationResults, observationResults } = usePlantingSiteData();
  const [stratumResult, setStratumResult] = useState<ObservationStratumResultsPayload>();
  const [substratumResult, setSubstratumResult] = useState<ObservationSubstratumResultsPayload>();
  const [monitoringPlotResult, setMonitoringPlotResult] = useState<ObservationMonitoringPlotResultsPayload>();

  const result = useMemo(() => {
    if (!Number.isNaN(observationId)) {
      return (
        observationResults?.find((_result) => _result.observationId === observationId) ??
        adHocObservationResults?.find((_result) => _result.observationId === observationId)
      );
    }
  }, [observationResults, adHocObservationResults, observationId]);

  const navigateToStratumDetails = useCallback(() => {
    if (stratumName) {
      navigate(
        APP_PATHS.OBSERVATION_STRATUM_DETAILS.replace(':plantingSiteId', plantingSiteId.toString())
          .replace(':observationId', Number(observationId).toString())
          .replace(':stratumName', encodeURIComponent(stratumName))
      );
    }
  }, [navigate, observationId, stratumName, plantingSiteId]);

  useEffect(() => {
    let plotFound = false;
    if (result) {
      result.strata.forEach((_stratum) =>
        _stratum.substrata.forEach((_substratum) =>
          _substratum.monitoringPlots.forEach((plot) => {
            if (plot.monitoringPlotId === monitoringPlotId) {
              setStratumResult(_stratum);
              setSubstratumResult(_substratum);
              setMonitoringPlotResult(plot);
              plotFound = true;
              return;
            }
          })
        )
      );
      if (!plotFound) {
        navigateToStratumDetails();
      }
    }
  }, [result, monitoringPlotId, navigateToStratumDetails]);

  const stratum = useMemo(() => {
    if (stratumResult) {
      return plantingSite?.strata?.find((_stratum) => _stratum.id === stratumResult.stratumId);
    }
  }, [plantingSite, stratumResult]);

  const substratum = useMemo(() => {
    if (substratumResult) {
      return stratum?.substrata?.find((_substratum) => _substratum.id === substratumResult.substratumId);
    }
  }, [stratum, substratumResult]);

  const monitoringPlotSpecies = useMemo((): ObservationSpeciesResults[] => {
    if (monitoringPlotResult) {
      return monitoringPlotResult.species.map((_species) => {
        if (_species.speciesId !== undefined) {
          const foundSpecies = species.find((candidate) => candidate.id === _species.speciesId);
          return {
            ..._species,
            speciesCommonName: foundSpecies?.commonName ?? '',
            speciesScientificName: foundSpecies?.scientificName ?? '',
          };
        } else {
          return {
            ..._species,
            speciesScientificName: _species.speciesName ?? '',
          };
        }
      });
    } else {
      return [];
    }
  }, [monitoringPlotResult, species]);

  const mainTitle = useMemo(() => {
    const swCoordinatesLat = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[0];
    const swCoordinatesLong = monitoringPlotResult?.boundary?.coordinates?.[0]?.[0]?.[1];

    return (
      <Box display='flex' alignItems={'end'}>
        <Typography fontSize='24px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {monitoringPlotResult?.monitoringPlotNumber.toString()}
        </Typography>
        <Tooltip
          placement='bottom'
          title={
            <Box>
              <Typography>
                {strings.STRATUM}: {stratum?.name}
              </Typography>
              <Typography>
                {strings.SUBSTRATUM}: {substratum?.name}
              </Typography>
              <Typography>
                {strings.PLOT_TYPE}:{' '}
                {monitoringPlotResult ? (monitoringPlotResult.isPermanent ? strings.PERMANENT : strings.TEMPORARY) : ''}
              </Typography>
              <Typography>
                {strings.LOCATION}: {swCoordinatesLat}, {swCoordinatesLong}
              </Typography>
            </Box>
          }
        >
          <Typography
            fontSize='16px'
            color={theme.palette.TwClrTxtBrand}
            fontWeight={400}
            paddingLeft={theme.spacing(1)}
          >
            {strings.PLOT_INFO}
          </Typography>
        </Tooltip>
      </Box>
    );
  }, [monitoringPlotResult, substratum?.name, stratum?.name, theme]);

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'observationData',
        label: strings.OBSERVATION_DATA,
        children: monitoringPlotResult ? (
          <ObservationDataTab
            monitoringPlot={monitoringPlotResult}
            species={monitoringPlotSpecies}
            observationId={observationId}
          />
        ) : null,
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: <PhotosAndVideosTab monitoringPlot={monitoringPlotResult} plantingSiteName={plantingSite?.name} />,
      },
    ];
  }, [activeLocale, monitoringPlotResult, monitoringPlotSpecies, observationId, plantingSite]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'assignedObservations',
  });

  if (!plantingSiteId || !observationId) {
    return undefined;
  }

  return (
    <DetailsPage
      title={mainTitle}
      plantingSiteId={Number(plantingSiteId)}
      observationId={Number(observationId)}
      stratumName={stratumName}
    >
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </DetailsPage>
  );
}

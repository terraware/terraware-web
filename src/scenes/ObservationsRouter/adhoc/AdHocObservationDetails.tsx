import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs, Tooltip } from '@terraware/web-components';
import _ from 'lodash';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { selectAdHocObservationResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import { useOnSaveMergedSpecies } from 'src/scenes/ObservationsRouter/common/useOnSaveMergedSpecies';
import strings from 'src/strings';
import { AdHocObservationResults } from 'src/types/Observations';
import useStickyTabs from 'src/utils/useStickyTabs';

import { exportAdHocObservationDetails } from '../exportAdHocObservations';
import ObservationDataTab from './ObservationDataTab';
import PhotosAndVideosTab from './PhotosAndVideosTab';

type AdHocObservationDetailsProps = {
  reload: () => void;
};

export default function AdHocObservationDetails(props: AdHocObservationDetailsProps): JSX.Element | undefined {
  const { reload } = props;
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
    monitoringPlotId: string;
  }>();
  const navigate = useSyncNavigate();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);
  const observation = allAdHocObservationResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );
  const { species } = useSpeciesData();

  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>([]);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const onCloseMatchSpeciesModal = useCallback(() => setShowMatchSpeciesModal(false), []);

  const monitoringPlot = useMemo(() => {
    const speciesToUse = observation?.adHocPlot?.species.map((sp) => {
      const foundSpecies = species.find((_species) => _species.id === sp.speciesId);
      return { ...sp, speciesScientificName: foundSpecies?.scientificName || sp.speciesName || '' };
    });

    return { ...observation?.adHocPlot, species: speciesToUse };
  }, [observation?.adHocPlot, species]);

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));

  const onMatchSpecies = useCallback(() => {
    setShowMatchSpeciesModal(true);
  }, []);

  const onExportData = useCallback(() => {
    if (observation && plantingSite) {
      void exportAdHocObservationDetails(
        {
          ...observation,
          plantingSiteName: plantingSite.name,
        } as AdHocObservationResults,
        plantingSite,
        species
      );
    }
  }, [observation, plantingSite, species]);

  const mainTitle = useMemo(() => {
    const swCoordinatesLat = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
    const swCoordinatesLong = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[1];

    return (
      <Box display='flex' alignItems={'end'}>
        <Typography fontSize='24px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {monitoringPlot?.monitoringPlotNumber?.toString() || ''}
        </Typography>
        <Tooltip
          placement='bottom'
          title={
            <Box>
              <Typography>
                {strings.PLOT_TYPE}: {strings.AD_HOC}
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
  }, [monitoringPlot, theme]);

  useEffect(() => {
    if (!monitoringPlot) {
      navigate(APP_PATHS.OBSERVATIONS);
    }
  }, [navigate, monitoringPlot]);

  useEffect(() => {
    const speciesWithNoIdMap = _.uniqBy(
      (monitoringPlot?.species || []).filter((sp) => !sp.speciesId),
      'speciesName'
    ).map((sp) => sp.speciesName || '');

    setUnrecognizedSpecies(speciesWithNoIdMap);
  }, [monitoringPlot]);

  const onSaveMergedSpecies = useOnSaveMergedSpecies({ observationId, reload, setShowMatchSpeciesModal });

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'observationData',
        label: strings.OBSERVATION_DATA,
        children: (
          <>
            {showMatchSpeciesModal && (
              <MatchSpeciesModal
                onClose={onCloseMatchSpeciesModal}
                onSave={onSaveMergedSpecies}
                unrecognizedSpecies={unrecognizedSpecies || []}
              />
            )}
            <ObservationDataTab
              monitoringPlot={monitoringPlot}
              species={monitoringPlot.species}
              type='adHoc'
              unrecognizedSpecies={unrecognizedSpecies}
              onExportData={onExportData}
              onMatchSpecies={onMatchSpecies}
              observationId={Number(observationId)}
            />
          </>
        ),
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: (
          <PhotosAndVideosTab
            monitoringPlot={observation?.adHocPlot}
            isCompleted={!!observation?.adHocPlot?.completedTime}
            plantingSiteName={plantingSite?.name}
          />
        ),
      },
    ];
  }, [
    activeLocale,
    monitoringPlot,
    observation,
    onCloseMatchSpeciesModal,
    onExportData,
    onMatchSpecies,
    onSaveMergedSpecies,
    showMatchSpeciesModal,
    unrecognizedSpecies,
    observationId,
    plantingSite,
  ]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'assignedObservations',
  });

  if (!plantingSiteId || !observationId) {
    return undefined;
  }

  return (
    <DetailsPage title={mainTitle} plantingSiteId={Number(plantingSiteId)} observationId={Number(observationId)}>
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </DetailsPage>
  );
}

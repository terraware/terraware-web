import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Tabs } from '@terraware/web-components';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { selectAdHocObservationResults } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import useExportBiomassDetailsZip from 'src/scenes/ObservationsRouter/biomass/useExportBiomassDetailsZip';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import { useOnSaveMergedSpecies } from 'src/scenes/ObservationsRouter/common/useOnSaveMergedSpecies';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import PhotosAndVideosTab from '../adhoc/PhotosAndVideosTab';
import BiomassObservationDataTab from './BiomassObservationDataTab';
import InvasiveAndThreatenedSpeciesTab from './InvasiveAndThreatenedSpeciesTab';

type BiomassMeasurementDetailsProps = {
  reload: () => void;
};

export default function BiomassMeasurementsDetails(props: BiomassMeasurementDetailsProps): JSX.Element {
  const { reload } = props;
  const { plantingSiteId, observationId } = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();
  const theme = useTheme();
  const { activeLocale } = useLocalization();
  const allAdHocObservationResults = useAppSelector(selectAdHocObservationResults);

  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>([]);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);
  const observation = allAdHocObservationResults?.find(
    (obsResult) => obsResult?.observationId.toString() === observationId?.toString()
  );

  const monitoringPlot = observation?.adHocPlot;
  const biomassMeasurements = observation?.biomassMeasurements;

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, Number(plantingSiteId)));

  const swCoordinatesLat = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[0];
  const swCoordinatesLong = monitoringPlot?.boundary?.coordinates?.[0]?.[0]?.[1];

  const title = (
    <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
      {observation?.adHocPlot?.monitoringPlotName}
    </Typography>
  );

  const crumbs: Crumb[] = useMemo(() => {
    const curmbsData: Crumb[] = [];

    if (plantingSiteId) {
      curmbsData.push({
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString()),
      });
      curmbsData.push({
        name: strings.BIOMASS_MONITORING,
        to: `${APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', plantingSiteId?.toString())}&tab=biomassMeasurements`,
      });
    }

    return curmbsData;
  }, [plantingSiteId]);

  useEffect(() => {
    if (biomassMeasurements) {
      const quadratSpeciesNames = biomassMeasurements.quadrats.flatMap((quadrat) =>
        quadrat.species.map((species) => species.speciesName)
      );
      const treeSpeciesNames = biomassMeasurements.trees.map((tree) => tree.speciesName);
      const additionalSpeciesNames = biomassMeasurements.additionalSpecies.map((species) => species.scientificName);
      const combinedNames = Array.from(
        new Set(
          additionalSpeciesNames
            .concat(quadratSpeciesNames)
            .concat(treeSpeciesNames)
            .filter((s): s is string => s !== undefined)
        )
      ).toSorted();

      setUnrecognizedSpecies(combinedNames);
    }
  }, [biomassMeasurements, setUnrecognizedSpecies]);

  const exportAllCsvs = useExportBiomassDetailsZip(
    observation?.observationId,
    observation?.plantingSiteId,
    observation?.startDate
  );

  const onSaveMergedSpecies = useOnSaveMergedSpecies({
    observationId,
    reload,
    setShowMatchSpeciesModal,
  });

  const onExportData = useCallback(() => {
    void exportAllCsvs();
  }, [exportAllCsvs]);

  const onMatchSpecies = useCallback(() => {
    setShowMatchSpeciesModal(true);
  }, []);

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
                onClose={() => setShowMatchSpeciesModal(false)}
                onSave={onSaveMergedSpecies}
                unrecognizedSpecies={unrecognizedSpecies || []}
              />
            )}

            <BiomassObservationDataTab
              monitoringPlot={monitoringPlot}
              biomassMeasurement={biomassMeasurements}
              plotLocation={`${swCoordinatesLat}, ${swCoordinatesLong}`}
              unrecognizedSpecies={unrecognizedSpecies}
              onExportData={onExportData}
              onMatchSpecies={onMatchSpecies}
              observationId={Number(observationId)}
              reload={reload}
              isCompleted={!!observation?.completedTime}
            />
          </>
        ),
      },
      {
        id: 'invasiveAndThreatenedSpecies',
        label: strings.INVASIVE_AND_THREATENED_SPECIES,
        children: (
          <InvasiveAndThreatenedSpeciesTab
            monitoringPlot={monitoringPlot}
            observationId={Number(observationId)}
            reload={reload}
          />
        ),
      },
      {
        id: 'photosAndVideos',
        label: strings.PHOTOS_AND_VIDEOS,
        children: (
          <PhotosAndVideosTab
            monitoringPlot={monitoringPlot}
            type='biomass'
            isCompleted={!!observation?.completedTime}
            plantingSiteName={plantingSite?.name}
          />
        ),
      },
    ];
  }, [
    activeLocale,
    showMatchSpeciesModal,
    onSaveMergedSpecies,
    unrecognizedSpecies,
    biomassMeasurements,
    monitoringPlot,
    swCoordinatesLat,
    swCoordinatesLong,
    onExportData,
    onMatchSpecies,
    observationId,
    reload,
    plantingSite,
    observation,
  ]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'observationData',
    tabs,
    viewIdentifier: 'assignedObservations',
  });

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      <Box width='100%'>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
}

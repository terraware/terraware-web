import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, Icon, Tooltip } from '@terraware/web-components';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import ListMapView from 'src/components/ListMapView';
import Page from 'src/components/Page';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import ObservationMapWrapper from 'src/scenes/ObservationsRouterV2/Map';
import MatchSpeciesModal from 'src/scenes/ObservationsRouterV2/SingleView/MatchSpeciesModal';
import StratumList from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/Site/StratumList';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouterV2/SingleView/UnrecognizedSpeciesPageMessage';
import useObservationExports from 'src/scenes/ObservationsRouterV2/useObservationExports';
import { useOnSaveMergedSpeciesRtk } from 'src/scenes/ObservationsRouterV2/useOnSaveMergedSpeciesRtk';
import { getShortDate } from 'src/utils/dateFormatter';
import {
  getBiomassObservationTotals,
  getBiomassObservationUnrecognizedSpecies,
  hasObservationData,
} from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import LiveTreesPerSpecies from '../LiveTreesPerSpecies';
import ObservationDataNumbers from '../ObservationDataNumbers';
import useBiomassPlot from '../useBiomassPlot';

const BiomassSiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
  const [searchParams] = useSearchParams();
  const plantingSiteIdParam = searchParams.get('plantingSiteId');

  const [isMapVisible, setIsMapVisible] = useState(false);
  const onView = useCallback((view: string) => setIsMapVisible(view === 'map'), []);
  const [pageMessageDismissed, setPageMessageDismissed] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);

  const { observationId, results } = useBiomassPlot();
  const { downloadBiomassObservationDetails } = useObservationExports();
  const totals = useMemo(() => getBiomassObservationTotals(results), [results]);
  const unrecognizedSpecies = useMemo(() => getBiomassObservationUnrecognizedSpecies(results), [results]);
  const onSaveMergedSpecies = useOnSaveMergedSpeciesRtk({
    observationId,
    onComplete: () => setShowMatchSpeciesModal(false),
  });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false }, true);
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const crumbs: Crumb[] = useMemo(
    () => [
      {
        name: strings.OBSERVATIONS,
        to: plantingSiteIdParam
          ? `${APP_PATHS.OBSERVATIONS}?plantingSiteId=${plantingSiteIdParam}`
          : APP_PATHS.OBSERVATIONS,
      },
    ],
    [plantingSiteIdParam, strings.OBSERVATIONS]
  );

  const title = useMemo(() => {
    if (!results) {
      return undefined;
    }
    const completedDate = results.completedTime
      ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
      : undefined;
    const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
    return (
      <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
        {observationDate} ({plantingSite?.name ?? ''})
      </Typography>
    );
  }, [activeLocale, defaultTimezone, plantingSite?.name, plantingSite?.timeZone, results, theme]);

  const items = [
    { label: strings.TOTAL_PLANTS, tooltip: strings.BIOMASS_PLOT_TOTAL_PLANTS_TOOLTIP, value: totals.totalPlants },
    { label: strings.LIVE_PLANTS, tooltip: strings.BIOMASS_PLOT_LIVE_PLANTS_TOOLTIP, value: totals.totalLive },
    { label: strings.DEAD_PLANTS, tooltip: strings.BIOMASS_PLOT_DEAD_PLANTS_TOOLTIP, value: totals.totalDead },
    { label: strings.SPECIES, tooltip: strings.BIOMASS_PLOT_SPECIES_TOOLTIP, value: totals.totalSpecies },
  ];

  return (
    <Page crumbs={crumbs} title={title} titleContainerStyle={{ paddingTop: 3, paddingBottom: 1 }}>
      {unrecognizedSpecies.length > 0 && !pageMessageDismissed && (
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={(show) => setPageMessageDismissed(!show)}
          unrecognizedSpecies={unrecognizedSpecies}
        />
      )}
      {showMatchSpeciesModal && (
        <MatchSpeciesModal
          onClose={() => setShowMatchSpeciesModal(false)}
          onSave={onSaveMergedSpecies}
          unrecognizedSpecies={unrecognizedSpecies}
        />
      )}
      <Card radius='24px' style={{ width: '100%' }}>
        <ObservationDataNumbers items={items} isCompleted={!!results?.completedTime} />
        <Box display='flex' alignItems='center' paddingBottom={2}>
          <Typography
            fontSize='20px'
            lineHeight='28px'
            fontWeight={600}
            color={theme.palette.TwClrTxt}
            paddingRight={1}
          >
            {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
          </Typography>
          <Tooltip title={strings.BIOMASS_NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP}>
            <Icon name='info' fillColor={theme.palette.TwClrIcnSecondary} />
          </Tooltip>
        </Box>
        <Box height='300px'>
          <LiveTreesPerSpecies treeSpecies={totals.treeSpecies} />
        </Box>
        <Box display='flex' justifyContent='flex-end' paddingY={2}>
          <Button
            id='matchBiomassUnrecognizedSpecies'
            label={strings.MATCH_UNRECOGNIZED_SPECIES}
            onClick={() => setShowMatchSpeciesModal(true)}
            disabled={unrecognizedSpecies.length === 0}
            icon='iconSynced'
            priority='ghost'
            sx={{ fontWeight: '400 !important' }}
          />
          <Button
            id='exportBiomassObservation'
            label={strings.EXPORT_DATA}
            onClick={() => void downloadBiomassObservationDetails(observationId)}
            disabled={!hasObservationData(results)}
            icon='iconImport'
            priority='ghost'
            sx={{ fontWeight: '400 !important' }}
          />
        </Box>
        <ListMapView
          search={null}
          initialView='list'
          onView={onView}
          style={{ width: '100%' }}
          list={<StratumList isBiomass />}
          map={
            <ObservationMapWrapper
              isMapVisible={isMapVisible}
              observationId={observationId}
              observationType='Biomass Measurements'
              plantingSiteId={results?.plantingSiteId}
            />
          }
        />
      </Card>
    </Page>
  );
};

export default BiomassSiteDetails;

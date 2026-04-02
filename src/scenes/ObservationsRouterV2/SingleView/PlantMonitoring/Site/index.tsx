import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { Button, IconTooltip } from '@terraware/web-components';
import { getDateDisplayValue, useDeviceInfo } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import ListMapView from 'src/components/ListMapView';
import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import ObservationMapWrapper from 'src/scenes/ObservationsRouterV2/Map';
import MatchSpeciesModal from 'src/scenes/ObservationsRouterV2/SingleView/MatchSpeciesModal';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouterV2/SingleView/UnrecognizedSpeciesPageMessage';
import useObservationExports from 'src/scenes/ObservationsRouterV2/useObservationExports';
import { useOnSaveMergedSpeciesRtk } from 'src/scenes/ObservationsRouterV2/useOnSaveMergedSpeciesRtk';
import { getShortDate } from 'src/utils/dateFormatter';
import { getObservationSpeciesDeadPlantsCount, getObservationSpeciesLivePlantsCount } from 'src/utils/observation';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationDataNumbers from '../../BiomassMeasurements/ObservationDataNumbers';
import SpeciesSurvivalRateChart from '../SpeciesSurvivalRateChart';
import SpeciesTotalPlantsChart from '../SpeciesTotalPlantsChart';
import useObservationSpecies from '../useObservationSpecies';
import StratumList from './StratumList';

const SiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const [pageMessageDismissed, setPageMessageDismissed] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const onView = useCallback((view: string) => setIsMapVisible(view === 'map'), []);
  const { downloadObservationResults } = useObservationExports();
  const onSaveMergedSpecies = useOnSaveMergedSpeciesRtk({
    observationId,
    onComplete: () => setShowMatchSpeciesModal(false),
  });

  const crumbs: Crumb[] = useMemo(() => {
    const crumbsData: Crumb[] = [
      {
        name: strings.OBSERVATIONS,
        to: APP_PATHS.OBSERVATIONS,
      },
    ];

    return crumbsData;
  }, [strings.OBSERVATIONS]);

  const { data: observationResultsResponse } = useGetObservationResultsQuery({ observationId });
  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();

  const results = useMemo(() => observationResultsResponse?.observation, [observationResultsResponse?.observation]);
  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (results?.plantingSiteId) {
      void getPlantingSite({ id: results.plantingSiteId, includeZones: false });
    }
  }, [getPlantingSite, results?.plantingSiteId]);

  const title = useMemo(() => {
    if (results) {
      const completedDate = results.completedTime
        ? getDateDisplayValue(results.completedTime, plantingSite?.timeZone ?? defaultTimezone)
        : undefined;
      const observationDate = getShortDate(completedDate ?? results.startDate, activeLocale);
      return (
        <Typography fontSize='20px' lineHeight='28px' fontWeight={600} color={theme.palette.TwClrTxt}>
          {observationDate} ({plantingSite?.name ?? ''})
        </Typography>
      );
    } else {
      return undefined;
    }
  }, [activeLocale, defaultTimezone, plantingSite?.name, plantingSite?.timeZone, results, theme.palette.TwClrTxt]);

  const species = useObservationSpecies(results?.species ?? []);
  const { isDesktop } = useDeviceInfo();
  const livePlants = useMemo(() => getObservationSpeciesLivePlantsCount(species), [species]);
  const deadPlants = useMemo(() => getObservationSpeciesDeadPlantsCount(species), [species]);

  const resultsSpecies = results?.species;

  const unrecognizedSpecies = useMemo(() => {
    if (resultsSpecies) {
      const speciesWithNoIds = resultsSpecies.filter(
        (observationSpecies) => observationSpecies.speciesId === undefined
      );
      const combinedNames = Array.from(
        new Set(
          speciesWithNoIds
            .map((observationSpecies) => observationSpecies.speciesName)
            .filter((s): s is string => s !== undefined)
        )
      ).toSorted();

      return combinedNames;
    } else {
      return [];
    }
  }, [resultsSpecies]);

  const hasObservedPermanentPlots = useMemo(() => {
    const permanentPlots =
      results?.strata
        .flatMap((stratum) => stratum.substrata)
        .flatMap((substratum) => substratum.monitoringPlots)
        .filter((plot) => plot.isPermanent) ?? [];

    return permanentPlots.some((plot) => plot.status === 'Completed');
  }, [results?.strata]);

  const items = [
    { label: strings.TOTAL_PLANTS, tooltip: strings.TOOLTIP_TOTAL_PLANTS, value: results?.totalPlants },
    { label: strings.LIVE_PLANTS, tooltip: strings.TOOLTIP_LIVE_PLANTS, value: livePlants },
    { label: strings.DEAD_PLANTS, tooltip: strings.PLOT_DEAD_PLANTS_TOOLTIP, value: deadPlants },
    { label: strings.SPECIES, tooltip: strings.PLOT_SPECIES_TOOLTIP, value: results?.totalSpecies },
    { label: strings.PLANT_DENSITY, tooltip: strings.PLANT_DENSITY_MISSING_TOOLTIP, value: results?.plantingDensity },
    {
      label: strings.SURVIVAL_RATE,
      tooltip: strings.SURVIVAL_RATE_COLUMN_TOOLTIP,
      value: hasObservedPermanentPlots ? `${results?.survivalRate ?? '-'}%` : '-',
    },
  ];

  const showPageMessage = unrecognizedSpecies.length > 0 && !pageMessageDismissed;

  return (
    <Page crumbs={crumbs} title={title}>
      {showPageMessage && (
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
      <SurvivalRateMessageV2 selectedPlantingSiteId={results?.plantingSiteId} />
      <Card radius='24px' style={{ width: '100%' }}>
        <ObservationDataNumbers items={items} isCompleted={!!results?.completedTime} />
        <Box display='flex' gap={3} flexDirection={isDesktop ? 'row' : 'column'} flexWrap='wrap' marginBottom={3}>
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignItems='center'>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES}
              </Typography>
              <IconTooltip title={strings.NUMBER_OF_LIVE_PLANTS_PER_SPECIES_TOOLTIP} />
            </Box>
            <Box height='245px'>
              <SpeciesTotalPlantsChart chartId='observationSpeciesTotalChart' minHeight='245px' species={species} />
            </Box>
          </Box>
          <Box flex={1} minWidth='500px'>
            <Box display='flex' alignItems='center'>
              <Typography fontSize='20px' fontWeight={600}>
                {strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION}
              </Typography>
              <IconTooltip title={strings.SURVIVAL_RATE_PER_SPECIES_AS_OF_THIS_OBSERVATION_TOOLTIP} />
            </Box>
            <Box height='245px'>
              <SpeciesSurvivalRateChart
                chartId='observationSurvivalRateChart'
                species={hasObservedPermanentPlots ? species : []}
                minHeight='245px'
              />
            </Box>
          </Box>
        </Box>
        <Box
          display={'flex'}
          justifyContent={'end'}
          borderBottom={`1px solid ${theme.palette.TwClrBrdrTertiary}`}
          paddingBottom={1.5}
        >
          <Button
            priority='ghost'
            label={strings.MATCH_UNRECOGNIZED_SPECIES}
            icon='iconSynced'
            onClick={() => setShowMatchSpeciesModal(true)}
            disabled={!unrecognizedSpecies || unrecognizedSpecies.length === 0}
            sx={{ fontWeight: '400 !important' }}
          />
          <Button
            priority='ghost'
            label={strings.EXPORT_DATA}
            icon='iconImport'
            onClick={() => void downloadObservationResults(observationId)}
            sx={{ fontWeight: '400 !important' }}
          />
        </Box>
        <ListMapView
          search={null}
          initialView='list'
          onView={onView}
          style={{ width: '100%' }}
          list={<StratumList />}
          map={
            <ObservationMapWrapper
              observationId={observationId}
              plantingSiteId={results?.plantingSiteId}
              isMapVisible={isMapVisible}
            />
          }
        />
      </Card>
    </Page>
  );
};

export default SiteDetails;

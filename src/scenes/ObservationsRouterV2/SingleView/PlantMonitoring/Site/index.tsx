import React, { type JSX, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Typography, useTheme } from '@mui/material';
import { getDateDisplayValue } from '@terraware/web-components/utils';

import { Crumb } from 'src/components/BreadCrumbs';
import Page from 'src/components/Page';
import SurvivalRateMessageV2 from 'src/components/SurvivalRate/SurvivalRateMessageV2';
import Card from 'src/components/common/Card';
import OptionsMenu from 'src/components/common/OptionsMenu';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import ObservationMapWrapper from 'src/scenes/ObservationsRouterV2/Map';
import { useOnSaveMergedSpeciesRtk } from 'src/scenes/ObservationsRouterV2/useOnSaveMergedSpeciesRtk';
import { getShortDate } from 'src/utils/dateFormatter';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import AggregatedPlantsStats from '../AggregatedPlantsStats';
import useObservationSpecies from '../useObservationSpecies';
import StratumList from './StratumList';

const SiteDetails = (): JSX.Element => {
  const theme = useTheme();
  const defaultTimezone = useDefaultTimeZone().get().id;
  const { activeLocale, strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);
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
      void getPlantingSite(results.plantingSiteId);
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

  const unrecognizedSpecies = useMemo(() => {
    if (results?.species) {
      const speciesWithNoIds = results.species.filter(
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
  }, [results?.species]);

  const matchedUnrecognizedSpeciesMenu = useMemo(() => {
    return (
      <OptionsMenu
        onOptionItemClick={() => setShowMatchSpeciesModal(true)}
        optionItems={[
          {
            label: strings.MATCH_UNRECOGNIZED_SPECIES,
            value: 'match',
            disabled: (unrecognizedSpecies?.length || 0) === 0,
          },
        ]}
      />
    );
  }, [strings.MATCH_UNRECOGNIZED_SPECIES, unrecognizedSpecies?.length]);

  const hasObservedPermanentPlots = useMemo(() => {
    const permanentPlots =
      results?.strata
        .flatMap((stratum) => stratum.substrata)
        .flatMap((substratum) => substratum.monitoringPlots)
        .filter((plot) => plot.isPermanent) ?? [];

    return permanentPlots.some((plot) => plot.status === 'Completed');
  }, [results?.strata]);

  useEffect(() => {
    if (unrecognizedSpecies.length) {
      setShowPageMessage(true);
    }
  }, [unrecognizedSpecies.length]);

  return (
    <Page crumbs={crumbs} title={title} rightComponent={matchedUnrecognizedSpeciesMenu}>
      {showPageMessage && (
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={setShowPageMessage}
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
      <AggregatedPlantsStats
        completedTime={results?.completedTime}
        hasObservedPermanentPlots={hasObservedPermanentPlots}
        totalSpecies={results?.totalSpecies}
        plantingDensity={results?.plantingDensity}
        survivalRate={results?.survivalRate}
        species={species}
      />
      <Card radius={'8px'} style={{ marginBottom: theme.spacing(3), width: '100%' }}>
        <ObservationMapWrapper observationId={observationId} plantingSiteId={results?.plantingSiteId} />
      </Card>
      <StratumList />
    </Page>
  );
};

export default SiteDetails;

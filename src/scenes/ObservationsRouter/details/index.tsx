import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Grid } from '@mui/material';
import _ from 'lodash';

import ListMapView from 'src/components/ListMapView';
import SurvivalRateMessage from 'src/components/SurvivalRate/SurvivalRateMessage';
import { View } from 'src/components/common/ListMapSelector';
import OptionsMenu from 'src/components/common/OptionsMenu';
import Search, { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useOrganization } from 'src/providers';
import {
  searchObservationDetails,
  selectDetailsStratumNames,
} from 'src/redux/features/observations/observationDetailsSelectors';
import { searchObservations, selectObservation } from 'src/redux/features/observations/observationsSelectors';
import { selectPlantingSite } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import AggregatedPlantsStats from 'src/scenes/ObservationsRouter/common/AggregatedPlantsStats';
import DetailsPage from 'src/scenes/ObservationsRouter/common/DetailsPage';
import MatchSpeciesModal from 'src/scenes/ObservationsRouter/common/MatchSpeciesModal';
import UnrecognizedSpeciesPageMessage from 'src/scenes/ObservationsRouter/common/UnrecognizedSpeciesPageMessage';
import { useOnSaveMergedSpecies } from 'src/scenes/ObservationsRouter/common/useOnSaveMergedSpecies';
import exportObservationResults from 'src/scenes/ObservationsRouter/details/exportObservationResults';
import strings from 'src/strings';
import { ObservationState } from 'src/types/Observations';
import { FieldOptionsMap } from 'src/types/Search';
import { getLongDate, getShortDate } from 'src/utils/dateFormatter';
import useQuery from 'src/utils/useQuery';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMapView from '../map/ObservationMapView';
import ObservationDetailsList from './ObservationDetailsList';
import ObservationStatusSummaryMessage, { ObservationStatusSummary } from './ObservationStatusSummaryMessage';

export type ObservationDetailsProps = SearchProps & {
  setFilterOptions: (value: FieldOptionsMap) => void;
  reload: () => void;
};

export default function ObservationDetails(props: ObservationDetailsProps): JSX.Element {
  const { setFilterOptions, reload } = props;
  const { ...searchProps }: SearchProps = props;

  const { activeLocale } = useLocalization();
  const { selectedOrganization } = useOrganization();
  const defaultTimeZone = useDefaultTimeZone();
  const navigate = useSyncNavigate();
  const params = useParams<{
    plantingSiteId: string;
    observationId: string;
  }>();

  const plantingSiteId = Number(params.plantingSiteId || -1);
  const observationId = Number(params.observationId || -1);

  const [view, setView] = useState<View>('list');
  const [initialView, setInitialView] = useState<View>('list');
  const [unrecognizedSpecies, setUnrecognizedSpecies] = useState<string[]>();
  const [showPageMessage, setShowPageMessage] = useState(false);
  const [showMatchSpeciesModal, setShowMatchSpeciesModal] = useState(false);
  const [status, setStatus] = useState<ObservationState[]>([]);
  const query = useQuery();

  useEffect(() => {
    const mapView = query.get('map');
    if (mapView) {
      setInitialView('map');
    }
  }, [query]);

  const observationsResults = useAppSelector((state) =>
    !selectedOrganization
      ? undefined
      : searchObservations(
          state,
          plantingSiteId,
          selectedOrganization.id,
          defaultTimeZone.get().id,
          searchProps.search,
          searchProps.filtersProps?.filters?.stratum?.values ?? [],
          status
        )
  );

  const selectedObservationResults = useMemo(() => {
    if (!observationsResults) {
      return [];
    }

    return observationsResults.filter((result) => result.observationId === observationId);
  }, [observationsResults, observationId]);

  const details = useAppSelector((state) =>
    !selectedOrganization
      ? undefined
      : searchObservationDetails(
          state,
          {
            plantingSiteId,
            observationId,
            orgId: selectedOrganization.id,
            search: searchProps.search,
            stratumNames: searchProps.filtersProps?.filters.stratum?.values ?? [],
          },
          defaultTimeZone.get().id
        )
  );

  useEffect(() => {
    const values = searchProps.filtersProps?.filters.status?.values ?? [];
    const mappedValues = values.reduce((acc: ObservationState[], curr: string) => {
      let mappedValue;
      if (curr === strings.COMPLETED) {
        mappedValue = 'Completed';
      } else if (curr === strings.IN_PROGRESS) {
        mappedValue = 'InProgress';
      } else if (curr === strings.OVERDUE) {
        mappedValue = 'Overdue';
      } else if (curr === strings.ABANDONED) {
        mappedValue = 'Abandoned';
      }
      return mappedValue ? [...acc, mappedValue] : acc;
    }, [] as ObservationState[]);

    if (mappedValues.length) {
      setStatus(mappedValues);
    } else {
      // if user clears filter, get specific statuses, we don't want to see Upcoming
      setStatus(['Completed', 'InProgress', 'Overdue', 'Abandoned']);
    }
  }, [searchProps.filtersProps?.filters.status]);

  const plantingSite = useAppSelector((state) => selectPlantingSite(state, plantingSiteId));
  const observation = useAppSelector((state) => selectObservation(state, plantingSiteId, observationId));
  const stratumNames = useAppSelector((state) =>
    !selectedOrganization
      ? []
      : selectDetailsStratumNames(state, plantingSiteId, observationId, selectedOrganization.id)
  );

  const title = useMemo(() => {
    const plantingSiteName = details?.plantingSiteName ?? '';
    const completionDate = details?.completedDate ? getShortDate(details.completedDate, activeLocale) : '';
    return `${completionDate} (${plantingSiteName})`;
  }, [activeLocale, details]);

  const statusSummary = useMemo<ObservationStatusSummary | undefined>(() => {
    if (observation && details && Date.now() <= new Date(observation.endDate).getTime()) {
      const plots = details.strata.flatMap((stratum) =>
        stratum.substrata.flatMap((substratum) => substratum.monitoringPlots)
      );
      const pendingPlots = plots.filter((plot) => !plot.completedTime).length;
      const totalPlots = plots.length;
      const observedPlots = totalPlots - pendingPlots;

      return {
        endDate: getLongDate(observation.endDate, activeLocale),
        pendingPlots,
        totalPlots,
        observedPlots,
        observedPlotsPercentage: +((observedPlots / totalPlots) * 100).toFixed(2),
      };
    }
    return undefined;
  }, [activeLocale, details, observation]);

  useEffect(() => {
    const speciesWithNoIdMap = _.uniqBy(
      (details?.species || []).filter((sp) => !sp.speciesId),
      'speciesName'
    ).map((sp) => sp.speciesName || '');

    setUnrecognizedSpecies(speciesWithNoIdMap);
    if (speciesWithNoIdMap.length > 0) {
      setShowPageMessage(true);
    } else {
      setShowPageMessage(false);
    }
  }, [details]);

  useEffect(() => {
    setFilterOptions({
      stratum: {
        partial: false,
        values: stratumNames,
      },
    });
  }, [setFilterOptions, stratumNames]);

  useEffect(() => {
    if (selectedOrganization && !details) {
      navigate(APP_PATHS.OBSERVATIONS_SITE.replace(':plantingSiteId', `${plantingSiteId}`));
    }
  }, [details, navigate, plantingSiteId, selectedOrganization]);

  useEffect(() => {
    const initialStrata = searchProps.filtersProps?.filters?.stratum?.values ?? [];
    const availableStrata = initialStrata.filter((name: string) => stratumNames.includes(name));

    if (availableStrata.length < initialStrata.length) {
      searchProps.filtersProps?.setFilters((previous: Record<string, any>) => ({
        ...previous,
        stratum: { ...previous.stratum, values: availableStrata },
      }));
    }
  }, [stratumNames, searchProps.filtersProps]);

  const onSaveMergedSpecies = useOnSaveMergedSpecies({ observationId, reload, setShowMatchSpeciesModal });

  const onExportObservationResults = useCallback(() => {
    if (selectedObservationResults && selectedObservationResults.length > 0) {
      void exportObservationResults({ observationResults: selectedObservationResults[0] });
    }
  }, [selectedObservationResults]);

  const showSurvivalRateMessage = useMemo(() => {
    return details?.survivalRate === undefined;
  }, [details]);

  return (
    <DetailsPage
      title={title}
      plantingSiteId={plantingSiteId}
      observationId={observationId}
      rightComponent={
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
      }
    >
      {showSurvivalRateMessage && plantingSiteId && <SurvivalRateMessage selectedPlantingSiteId={plantingSiteId} />}
      {showPageMessage && (
        <UnrecognizedSpeciesPageMessage
          setShowMatchSpeciesModal={setShowMatchSpeciesModal}
          setShowPageMessage={setShowPageMessage}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
      )}
      {showMatchSpeciesModal && (
        <MatchSpeciesModal
          onClose={() => setShowMatchSpeciesModal(false)}
          onSave={onSaveMergedSpecies}
          unrecognizedSpecies={unrecognizedSpecies || []}
        />
      )}
      <ObservationStatusSummaryMessage
        strata={plantingSite?.strata}
        requestedSubstratumIds={observation?.requestedSubstratumIds}
        statusSummary={statusSummary}
      />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AggregatedPlantsStats {...(details ?? {})} />
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column' }}>
          {plantingSite && selectedObservationResults && (
            <ListMapView
              initialView={initialView}
              list={<ObservationDetailsList {...searchProps} />}
              map={
                <ObservationMapView
                  hideDate
                  observationsResults={selectedObservationResults}
                  selectedPlantingSite={plantingSite}
                  {...searchProps}
                />
              }
              onView={setView}
              search={<Search {...searchProps} onExport={onExportObservationResults} />}
              style={view === 'map' ? { display: 'flex', flexGrow: 1, flexDirection: 'column' } : undefined}
            />
          )}
        </Grid>
      </Grid>
    </DetailsPage>
  );
}

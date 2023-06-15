import { useEffect, useMemo, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import useSnackbar from 'src/utils/useSnackbar';
import { useLocalization, useOrganization } from 'src/providers';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import {
  selectObservationsResultsError,
  selectObservationsResults,
} from 'src/redux/features/observations/observationsSelectors';
import { selectSpeciesError, selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { selectPlantingSitesError, selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { FilterField } from 'src/components/common/FilterGroup';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import ObservationsHome from './ObservationsHome';
import ObservationDetails from './details';
import ObservationPlantingZoneDetails from './zone';
import ObservationMonitoringPlotDetails from './plot';

/**
 * This page will route to the correct component based on url params
 * eg. /observations or /observations/<planting-site-id> goes to <ObservationsHome />
 *     /observations/<planting-site-id>/<observation-id> will go to drilled down components (TODO)
 * Having this wrapper component allows us to pre-request data for all the views without being redundant.
 */
export default function Observations(): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const [dispatched, setDispatched] = useState<boolean>(false);
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  // listen for error
  const observationsResultsError = useAppSelector(selectObservationsResultsError);
  const speciesError = useAppSelector(selectSpeciesError);
  const plantingSitesError = useAppSelector(selectPlantingSitesError);
  // listen for data
  const observationsResults = useAppSelector(selectObservationsResults);
  const species = useAppSelector(selectSpecies);
  const plantingSites = useAppSelector(selectPlantingSites);

  useEffect(() => {
    dispatch(requestSpecies(selectedOrganization.id));
    dispatch(requestPlantingSites(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (species !== undefined && plantingSites !== undefined && !dispatched) {
      setDispatched(true);
      dispatch(requestObservationsResults(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, species, plantingSites, dispatched]);

  useEffect(() => {
    if (observationsResultsError || speciesError || plantingSitesError) {
      snackbar.toastError();
    }
  }, [snackbar, observationsResultsError, speciesError, plantingSitesError]);

  // show spinner while initializing data
  if (observationsResults === undefined && !(observationsResultsError || speciesError || plantingSitesError)) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return <ObservationsWrapper />;
}

const ObservationsWrapper = (): JSX.Element => {
  const { activeLocale } = useLocalization();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filterColumns = useMemo<FilterField[]>(
    () => (activeLocale ? [{ name: 'zone', label: strings.ZONE, type: 'multiple_selection' }] : []),
    [activeLocale]
  );

  const searchProps: Omit<SearchProps, 'filterOptions'> = useMemo(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
      filters,
      setFilters: (value: Record<string, any>) => setFilters(value),
      filterColumns,
    }),
    [filters, filterColumns, search]
  );

  return (
    <Switch>
      <Route exact path={APP_PATHS.OBSERVATION_MONITORING_PLOT_DETAILS}>
        <ObservationMonitoringPlotDetails />
      </Route>
      <Route exact path={APP_PATHS.OBSERVATION_PLANTING_ZONE_DETAILS}>
        <ObservationPlantingZoneDetails />
      </Route>
      <Route exact path={APP_PATHS.OBSERVATION_DETAILS}>
        <ObservationDetails {...searchProps} />
      </Route>
      <Route exact path={APP_PATHS.PLANTING_SITE_OBSERVATIONS}>
        <ObservationsHome {...searchProps} />
      </Route>
      <Route path={'*'}>
        <ObservationsHome {...searchProps} />
      </Route>
    </Switch>
  );
};

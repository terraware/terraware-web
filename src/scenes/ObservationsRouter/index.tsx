import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { CircularProgress } from '@mui/material';
import { Option } from '@terraware/web-components/components/table/types';

import { FilterField } from 'src/components/common/FilterGroup';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useLocalization, useOrganization } from 'src/providers';
import {
  selectObservationsResults,
  selectObservationsResultsError,
} from 'src/redux/features/observations/observationsSelectors';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectSpecies, selectSpeciesError } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { selectPlantingSites, selectPlantingSitesError } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { ObservationState, getStatus } from 'src/types/Observations';
import { FieldOptionsMap, FieldValuesPayload } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import ObservationsHome from './ObservationsHome';
import ObservationDetails from './details';
import ObservationMonitoringPlotDetails from './plot';
import { RescheduleObservation, ScheduleObservation } from './schedule';
import ObservationPlantingZoneDetails from './zone';

/**
 * This page will route to the correct component based on url params
 * eg. /observations or /observations/<planting-site-id> goes to <ObservationsHome />
 *     /observations/<planting-site-id>/<observation-id> will go to drilled down components (TODO)
 * Having this wrapper component allows us to pre-request data for all the views without being redundant.
 */
export default function ObservationsRouter(): JSX.Element {
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
    if (selectedOrganization.id !== -1) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (species !== undefined && plantingSites !== undefined && !dispatched && selectedOrganization.id !== -1) {
      setDispatched(true);
      dispatch(requestObservationsResults(selectedOrganization.id));
      dispatch(requestObservations(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id, species, plantingSites, dispatched]);

  useEffect(() => {
    if (observationsResultsError || speciesError || plantingSitesError) {
      snackbar.toastError();
    }
  }, [snackbar, observationsResultsError, speciesError, plantingSitesError]);

  const reload = () => {
    setDispatched(false);
  };

  // show spinner while initializing data
  if (observationsResults === undefined && !(observationsResultsError || speciesError || plantingSitesError)) {
    return <CircularProgress sx={{ margin: 'auto' }} />;
  }

  return <ObservationsInnerRouter reload={reload} />;
}

const ObservationsInnerRouter = ({ reload }: { reload: () => void }): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();
  const [search, setSearch] = useState<string>('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [filterOptions, setFilterOptions] = useState<FieldOptionsMap>({});

  const filterColumns = useMemo<FilterField[]>(() => {
    if (activeLocale) {
      return [
        { name: 'zone', label: strings.ZONE, type: 'multiple_selection' },
        { name: 'status', label: strings.STATUS, type: 'multiple_selection' },
      ];
    } else {
      return [];
    }
  }, [activeLocale]);

  const setFilterOptionsCallback = useCallback((value: FieldOptionsMap) => setFilterOptions(value), []);

  const searchProps = useMemo<SearchProps>(
    () => ({
      search,
      onSearch: (value: string) => setSearch(value),
      filtersProps: {
        filters,
        setFilters: (value: Record<string, any>) => setFilters(value),
        filterColumns,
        filterOptions,
        optionsRenderer: (filterName: string, fieldValues: FieldValuesPayload): Option[] | undefined => {
          if (filterName !== 'status') {
            return;
          }

          return fieldValues[filterName]?.values.map(
            (value): Option => ({
              label: getStatus(value as ObservationState),
              value,
              disabled: false,
            })
          );
        },
        pillValuesRenderer: (filterName: string, values: unknown[]): string | undefined => {
          if (filterName !== 'status') {
            return;
          }

          return values.map((value) => getStatus(value as ObservationState)).join(', ');
        },
      },
    }),
    [filters, filterColumns, filterOptions, search]
  );

  // reset status filter values to default on locale change
  useEffect(() => {
    if (activeLocale) {
      setFilters((prev: Record<string, any>) => {
        const newFilters: Record<string, any> = {};
        if (prev.zone) {
          newFilters.zone = prev.zone;
        }
        return newFilters;
      });
    }
  }, [activeLocale]);

  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  return (
    <Routes>
      {scheduleObservationsEnabled && <Route path={'schedule/:observationId'} element={<RescheduleObservation />} />}
      {scheduleObservationsEnabled && <Route path={'/schedule'} element={<ScheduleObservation />} />}
      <Route
        path={'/:plantingSiteId/results/:observationId/zone/:plantingZoneId/plot/:monitoringPlotId'}
        element={<ObservationMonitoringPlotDetails />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId/zone/:plantingZoneId'}
        element={<ObservationPlantingZoneDetails />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId'}
        element={<ObservationDetails {...searchProps} setFilterOptions={setFilterOptionsCallback} reload={reload} />}
      />
      <Route
        path={'/:plantingSiteId'}
        element={<ObservationsHome {...searchProps} setFilterOptions={setFilterOptionsCallback} reload={reload} />}
      />
      <Route
        path={'/*'}
        element={<ObservationsHome {...searchProps} setFilterOptions={setFilterOptionsCallback} reload={reload} />}
      />
    </Routes>
  );
};

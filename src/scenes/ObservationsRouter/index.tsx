import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router';

import { CircularProgress } from '@mui/material';
import { Option } from '@terraware/web-components/components/table/types';

import { FilterField } from 'src/components/common/FilterGroup';
import { SearchProps } from 'src/components/common/SearchFiltersWrapper';
import { useLocalization, useOrganization } from 'src/providers';
import { useSpeciesData } from 'src/providers/Species/SpeciesContext';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import {
  selectObservationsResults,
  selectObservationsResultsError,
} from 'src/redux/features/observations/observationsSelectors';
import {
  requestAdHocObservationResults,
  requestObservations,
  requestObservationsResults,
} from 'src/redux/features/observations/observationsThunks';
import { requestPlantingSites } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import BiomassMeasurementsDetails from 'src/scenes/ObservationsRouter/biomass/BiomassMeasurementsDetails';
import strings from 'src/strings';
import { ObservationState, getStatus } from 'src/types/Observations';
import { FieldOptionsMap, FieldValuesPayload } from 'src/types/Search';
import { isAdmin } from 'src/utils/organization';
import useSnackbar from 'src/utils/useSnackbar';

import SurvivalRateSettings from '../SurvivalRateSettings';
import EditSurvivalRateSettings from '../SurvivalRateSettings/EditSurvivalRateSettings';
import ObservationsHome from './ObservationsHome';
import ObservationMonitoringPlotDetails from './adhoc';
import AdHocObservationDetails from './adhoc/AdHocObservationDetails';
import MonitoringPlotEditPhotos from './common/MonitoringPlotEditPhotos';
import ObservationDetails from './details';
import { RescheduleObservation, ScheduleObservation } from './schedule';
import ObservationStratumDetails from './stratum';

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

  const { reload: reloadSpecies } = useSpeciesData();
  const { reload: reloadPlantingSiteData } = usePlantingSiteData();

  // listen for error
  const observationsResultsError = useAppSelector(selectObservationsResultsError);
  // listen for data
  const observationsResults = useAppSelector(selectObservationsResults);

  useEffect(() => {
    if (!dispatched && selectedOrganization) {
      setDispatched(true);
      void dispatch(requestPlantingSites(selectedOrganization.id));
      void dispatch(requestObservationsResults(selectedOrganization.id));
      void dispatch(requestAdHocObservationResults(selectedOrganization.id));
      void dispatch(requestObservations(selectedOrganization.id));
      void dispatch(requestObservations(selectedOrganization.id, true));
    }
  }, [dispatch, dispatched, selectedOrganization]);

  useEffect(() => {
    if (observationsResultsError) {
      snackbar.toastError();
    }
  }, [snackbar, observationsResultsError]);

  const reload = useCallback(() => {
    reloadSpecies();
    setDispatched(false);
    reloadPlantingSiteData();
  }, [reloadSpecies, reloadPlantingSiteData]);

  // show spinner while initializing data
  if (observationsResults === undefined && !observationsResultsError) {
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
        { name: 'stratum', label: strings.STRATUM, type: 'multiple_selection' },
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
        if (prev.stratum) {
          newFilters.stratum = prev.stratum;
        }
        return newFilters;
      });
    }
  }, [activeLocale]);

  const scheduleObservationsEnabled = isAdmin(selectedOrganization);

  return (
    <Routes>
      {scheduleObservationsEnabled && <Route path={'/schedule/:observationId'} element={<RescheduleObservation />} />}
      {scheduleObservationsEnabled && <Route path={'/schedule'} element={<ScheduleObservation />} />}
      <Route
        path={'/:plantingSiteId/results/:observationId/biomassMeasurements/:monitoringPlotId'}
        element={<BiomassMeasurementsDetails reload={reload} />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId/stratum/:stratumName/plot/:monitoringPlotId'}
        element={<ObservationMonitoringPlotDetails />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId/plot/:monitoringPlotId/photos'}
        element={<MonitoringPlotEditPhotos reload={reload} />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId/stratum/:stratumName'}
        element={<ObservationStratumDetails />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId/adHocPlot/:monitoringPlotId'}
        element={<AdHocObservationDetails reload={reload} />}
      />
      <Route
        path={'/:plantingSiteId/results/:observationId'}
        element={<ObservationDetails {...searchProps} setFilterOptions={setFilterOptionsCallback} reload={reload} />}
      />
      <Route path={'/:plantingSiteId/survival-rate-settings'} element={<SurvivalRateSettings />} />
      <Route path={'/:plantingSiteId/survival-rate-settings/edit'} element={<EditSurvivalRateSettings />} />
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

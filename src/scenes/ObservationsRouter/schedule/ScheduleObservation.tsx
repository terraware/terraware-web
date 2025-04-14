import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { requestScheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectScheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestObservations } from 'src/redux/features/observations/observationsThunks';
import { selectObservationSchedulableSitesWithPlantReportData } from 'src/redux/features/observations/observationsUtilsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestSiteReportedPlants } from 'src/redux/features/tracking/trackingThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const [validate, setValidate] = useState(false);
  const [plantingSiteId, setPlantingSiteId] = useState<number>();
  const [startDate, setStartDate] = useState<string>();
  const [endDate, setEndDate] = useState<string>();
  const [hasErrors, setHasErrors] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const [selectedSubzones, setSelectedSubzones] = useState<number[]>([]);

  const plantingSites = useAppSelector(selectObservationSchedulableSitesWithPlantReportData) ?? [];
  const result = useAppSelector((state) => selectScheduleObservation(state, requestId));

  const scheduleObservation = async () => {
    setValidate(true);
    if (!hasErrors && plantingSiteId && startDate && endDate) {
      const dispatched = dispatch(
        requestScheduleObservation({ endDate, plantingSiteId, requestedSubzoneIds: selectedSubzones, startDate })
      );
      setRequestId(dispatched.requestId);
    }
    return Promise.resolve(true);
  };

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const onErrors = useCallback((errors: boolean) => {
    setHasErrors(errors);
  }, []);

  useEffect(() => {
    if (selectedOrganization.id !== -1) {
      dispatch(requestPlantings(selectedOrganization.id));
    }
  }, [dispatch, selectedOrganization.id]);

  // This populates planting site specific data into the selectObservationSchedulableSitesWithPlantReportData selector
  useEffect(() => {
    if (plantingSiteId) {
      void dispatch(requestSiteReportedPlants(plantingSiteId));
    }
  }, [plantingSiteId, dispatch]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success' && selectedOrganization.id !== -1) {
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      dispatch(requestObservations(selectedOrganization.id));
      goToObservations();
    }
  }, [dispatch, goToObservations, selectedOrganization.id, snackbar, result?.status]);

  const selectedPlantingSite = useMemo(
    () => plantingSites.find((plantingSite) => plantingSite.id === plantingSiteId),
    [plantingSites, plantingSiteId]
  );

  return (
    <ScheduleObservationForm
      cancelID='cancelScheduleObservation'
      endDate={endDate}
      title={strings.SCHEDULE_OBSERVATION}
      plantingSiteId={plantingSiteId}
      plantingSites={plantingSites}
      onCancel={() => goToObservations()}
      selectedSubzones={selectedSubzones}
      onChangeSelectedSubzones={setSelectedSubzones}
      onEndDate={(date) => setEndDate(date)}
      onErrors={onErrors}
      onPlantingSiteId={(id) => setPlantingSiteId(id)}
      onSave={scheduleObservation}
      onStartDate={(date) => setStartDate(date)}
      saveID='scheduleObservation'
      selectedPlantingSite={selectedPlantingSite}
      startDate={startDate}
      status={result?.status}
      validate={validate}
    />
  );
}

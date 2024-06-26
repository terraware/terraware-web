import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { requestScheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectScheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestObservations } from 'src/redux/features/observations/observationsThunks';
import { selectObservationSchedulableSites } from 'src/redux/features/observations/observationsUtilsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
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

  const plantingSites = useAppSelector(selectObservationSchedulableSites) ?? [];
  const result = useAppSelector((state) => selectScheduleObservation(state, requestId));

  const scheduleObservation = async () => {
    setValidate(true);
    if (!hasErrors && plantingSiteId && startDate && endDate) {
      const dispatched = dispatch(requestScheduleObservation({ plantingSiteId, startDate, endDate }));
      setRequestId(dispatched.requestId);
    }
    return Promise.resolve(true);
  };

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const onErrors = useCallback((errors: boolean) => {
    setHasErrors(errors);
  }, []);

  useEffect(() => {
    dispatch(requestPlantings(selectedOrganization.id));
  }, [dispatch, selectedOrganization.id]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      dispatch(requestObservations(selectedOrganization.id));
      goToObservations();
    }
  }, [dispatch, goToObservations, selectedOrganization.id, snackbar, result?.status]);

  return (
    <ScheduleObservationForm
      title={strings.SCHEDULE_OBSERVATION}
      plantingSites={plantingSites}
      plantingSiteId={plantingSiteId}
      onPlantingSiteId={(id) => setPlantingSiteId(id)}
      startDate={startDate}
      onStartDate={(date) => setStartDate(date)}
      endDate={endDate}
      onEndDate={(date) => setEndDate(date)}
      validate={validate}
      onErrors={onErrors}
      cancelID='cancelScheduleObservation'
      saveID='scheduleObservation'
      onCancel={() => goToObservations()}
      onSave={scheduleObservation}
      status={result?.status}
    />
  );
}

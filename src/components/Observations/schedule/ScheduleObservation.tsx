import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import strings from 'src/strings';
import { useAppSelector, useAppDispatch } from 'src/redux/store';
import { useOrganization } from 'src/providers';
import { selectObservationSchedulableSites } from 'src/redux/features/observations/observationsUtilsSelectors';
import { selectScheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestPlantings } from 'src/redux/features/plantings/plantingsThunks';
import { requestScheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { requestObservations } from 'src/redux/features/observations/observationsThunks';
import useSnackbar from 'src/utils/useSnackbar';
import ScheduleObservationForm from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const history = useHistory();
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

  const goToObservations = useCallback(() => history.push(APP_PATHS.OBSERVATIONS), [history]);

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

import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import { requestRescheduleObservation } from 'src/redux/features/observations/observationsAsyncThunks';
import { selectObservations } from 'src/redux/features/observations/observationsSelectors';
import { selectRescheduleObservation } from 'src/redux/features/observations/observationsSelectors';
import { requestObservations, requestObservationsResults } from 'src/redux/features/observations/observationsThunks';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';
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
  const [plantingSites, setPlantingSites] = useState<PlantingSite[]>([]);
  const { observationId } = useParams<{ observationId: string }>();

  const plantingSitesResult = useAppSelector(selectPlantingSites);
  const observations = useAppSelector(selectObservations);
  const result = useAppSelector((state) => selectRescheduleObservation(state, requestId));

  const rescheduleObservation = async () => {
    setValidate(true);
    if (!hasErrors && observationId && startDate && endDate) {
      const dispatched = dispatch(
        requestRescheduleObservation({
          observationId: Number(observationId),
          request: { startDate, endDate },
        })
      );
      setRequestId(dispatched.requestId);
    }
    return Promise.resolve(true);
  };

  const goToObservations = useCallback(() => history.push(APP_PATHS.OBSERVATIONS), [history]);

  const onErrors = useCallback((errors: boolean) => {
    setHasErrors(errors);
  }, []);

  useEffect(() => {
    const observation = observations?.find((data) => data.id.toString() === observationId);
    const plantingSite = plantingSitesResult?.find((ps) => ps.id === observation?.plantingSiteId);
    if (!observationId || (observations?.length && plantingSitesResult?.length && !plantingSite)) {
      goToObservations();
    } else if (plantingSite && observation) {
      setPlantingSites([plantingSite]);
      setPlantingSiteId(plantingSite.id);
      setStartDate(observation?.startDate);
      setEndDate(observation?.endDate);
    }
  }, [goToObservations, observationId, plantingSitesResult, observations]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      snackbar.toastSuccess(strings.OBSERVATION_RESCHEDULED);
      dispatch(requestObservations(selectedOrganization.id));
      dispatch(requestObservationsResults(selectedOrganization.id));
      goToObservations();
    }
  }, [dispatch, goToObservations, selectedOrganization.id, snackbar, result?.status]);

  return (
    <ScheduleObservationForm
      title={strings.RESCHEDULE_OBSERVATION}
      plantingSites={plantingSites}
      plantingSiteId={plantingSiteId}
      onPlantingSiteId={(id) => setPlantingSiteId(id)}
      startDate={startDate}
      onStartDate={(date) => setStartDate(date)}
      endDate={endDate}
      onEndDate={(date) => setEndDate(date)}
      validate={validate}
      onErrors={onErrors}
      cancelID='cancelRescheduleObservation'
      saveID='rescheduleObservation'
      onCancel={() => goToObservations()}
      onSave={rescheduleObservation}
      status={result?.status}
    />
  );
}

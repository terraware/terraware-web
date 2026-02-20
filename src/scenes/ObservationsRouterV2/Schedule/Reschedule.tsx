import React, { type JSX, useCallback, useEffect } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import {
  RescheduleObservationRequestPayload,
  useRescheduleObservationMutation,
} from 'src/queries/generated/observations';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm from './ScheduleObservationForm';

export default function RescheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const params = useParams<{ observationId: string }>();
  const observationId = Number(params.observationId);

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const [reschedule, rescheduleResponse] = useRescheduleObservationMutation();

  useEffect(() => {
    if (rescheduleResponse.isError) {
      snackbar.toastError();
    } else if (rescheduleResponse.isSuccess) {
      snackbar.toastSuccess(strings.OBSERVATION_RESCHEDULED);
      goToObservations();
    }
  }, [
    goToObservations,
    snackbar,
    rescheduleResponse.isError,
    rescheduleResponse.isSuccess,
    strings.OBSERVATION_RESCHEDULED,
  ]);

  const onSave = useCallback(
    (data: RescheduleObservationRequestPayload) => {
      void reschedule({ observationId, rescheduleObservationRequestPayload: data });
    },
    [observationId, reschedule]
  );

  return (
    <>
      {rescheduleResponse.isLoading && <BusySpinner withSkrim={true} />}
      <ScheduleObservationForm
        title={strings.RESCHEDULE_OBSERVATION}
        onCancel={goToObservations}
        onReschedule={onSave}
        observationId={observationId}
      />
    </>
  );
}

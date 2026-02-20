import React, { type JSX, useCallback, useEffect } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { ScheduleObservationRequestPayload, useScheduleObservationMutation } from 'src/queries/generated/observations';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const [schedule, scheduleResponse] = useScheduleObservationMutation();

  useEffect(() => {
    if (scheduleResponse.isError) {
      snackbar.toastError();
    } else if (scheduleResponse.isSuccess) {
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      goToObservations();
    }
  }, [
    goToObservations,
    snackbar,
    strings.OBSERVATION_RESCHEDULED,
    scheduleResponse.isError,
    scheduleResponse.isSuccess,
    strings.OBSERVATION_SCHEDULED,
  ]);

  const onSave = useCallback(
    (data: ScheduleObservationRequestPayload) => {
      void schedule(data);
    },
    [schedule]
  );

  return (
    <>
      {scheduleResponse.isLoading && <BusySpinner withSkrim={true} />}
      <ScheduleObservationForm title={strings.SCHEDULE_OBSERVATION} onCancel={goToObservations} onSchedule={onSave} />
    </>
  );
}

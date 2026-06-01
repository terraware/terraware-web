import React, { type JSX, useCallback, useEffect } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { ScheduleObservationRequestPayload, useScheduleObservationMutation } from 'src/queries/generated/observations';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const trackEvent = useTrackEvent();

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const [schedule, scheduleResponse] = useScheduleObservationMutation();

  useEffect(() => {
    if (scheduleResponse.isError) {
      snackbar.toastError();
    } else if (scheduleResponse.isSuccess) {
      const args = scheduleResponse.originalArgs;
      if (args) {
        const start = new Date(args.startDate);
        const end = new Date(args.endDate);
        const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        trackEvent(MIXPANEL_EVENTS.OBSERVATION_SCHEDULED, {
          duration_days: Number.isFinite(durationDays) ? durationDays : undefined,
        });
      }
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      goToObservations();
    }
  }, [
    goToObservations,
    snackbar,
    scheduleResponse.isError,
    scheduleResponse.isSuccess,
    scheduleResponse.originalArgs,
    strings.OBSERVATION_SCHEDULED,
    trackEvent,
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

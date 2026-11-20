import React, { type JSX, useCallback, useEffect, useRef } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useFeatureEnabled } from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useTrackEvent } from 'src/hooks/useTrackEvent';
import { MIXPANEL_EVENTS, MONITORING_TYPE_LABELS } from 'src/mixpanelEvents';
import { useLocalization } from 'src/providers';
import { ScheduleObservationRequestPayload, useScheduleObservationMutation } from 'src/queries/generated/observations';
import { daysBetween } from 'src/utils/dateUtils';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm, { type ScheduleObservationContext } from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const { strings } = useLocalization();
  const trackEvent = useTrackEvent();
  const assignPlotsWhenScheduling = useFeatureEnabled('Assign Plots When Scheduling');

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  const [schedule, scheduleResponse] = useScheduleObservationMutation();
  const scheduleContext = useRef<ScheduleObservationContext>(undefined);

  useEffect(() => {
    if (scheduleResponse.isError) {
      const error = scheduleResponse.error;
      if (error && 'status' in error && error.status === 409) {
        snackbar.toastError(strings.NO_ROOM_FOR_MONITORING_PLOTS);
      } else {
        snackbar.toastError();
      }
    } else if (scheduleResponse.isSuccess) {
      const args = scheduleResponse.originalArgs;
      const context = scheduleContext.current;
      if (args && context) {
        trackEvent(MIXPANEL_EVENTS.OBSERVATION_SCHEDULED, {
          default_type_changed: context.defaultTypeChanged,
          duration_days: daysBetween(args.startDate, args.endDate),
          includes_surveyed_strata: context.includesSurveyedStrata,
          monitoring_type: MONITORING_TYPE_LABELS[args.observationType ?? 'Monitoring'],
          observation_id: scheduleResponse.data?.id,
          planting_site_id: args.plantingSiteId,
          site_has_plantings: context.siteHasPlantings,
          substrata_count: args.requestedSubstratumIds?.length ?? 0,
        });
      }
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      goToObservations();
    }
  }, [goToObservations, snackbar, scheduleResponse, strings, trackEvent]);

  const onSave = useCallback(
    (data: ScheduleObservationRequestPayload, context: ScheduleObservationContext) => {
      scheduleContext.current = context;
      void schedule({ ...data, assignPlots: assignPlotsWhenScheduling || undefined });
    },
    [assignPlotsWhenScheduling, schedule]
  );

  return (
    <>
      {scheduleResponse.isLoading && <BusySpinner withSkrim={true} />}
      <ScheduleObservationForm title={strings.SCHEDULE_OBSERVATION} onCancel={goToObservations} onSchedule={onSave} />
    </>
  );
}

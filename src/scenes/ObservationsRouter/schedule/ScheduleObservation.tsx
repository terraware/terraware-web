import React, { type JSX, useCallback, useEffect } from 'react';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useOrgTracking } from 'src/hooks/useOrgTracking';
import useScheduleObservation from 'src/hooks/useScheduleObservation';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import strings from 'src/strings';
import { ScheduleObservationRequestPayload } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

import ScheduleObservationForm from './ScheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();

  const { reload } = useOrgTracking();
  const { schedule, scheduleResult } = useScheduleObservation();

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  useEffect(() => {
    if (scheduleResult?.status === 'error') {
      snackbar.toastError();
    } else if (scheduleResult?.status === 'success') {
      snackbar.toastSuccess(strings.OBSERVATION_SCHEDULED);
      reload();
      goToObservations();
    }
  }, [goToObservations, scheduleResult, snackbar, reload]);

  const onSave = useCallback(
    (data: ScheduleObservationRequestPayload) => {
      schedule(data.plantingSiteId, data.startDate, data.endDate, data.requestedSubstratumIds);
    },
    [schedule]
  );

  return (
    <>
      {scheduleResult?.status === 'pending' && <BusySpinner withSkrim={true} />}

      <ScheduleObservationForm title={strings.SCHEDULE_OBSERVATION} onCancel={goToObservations} onSave={onSave} />
    </>
  );
}

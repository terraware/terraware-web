import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import useRescheduleObservation from 'src/hooks/useRescheduleObservation';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { useAppDispatch } from 'src/redux/store';
import strings from 'src/strings';
import { RescheduleObservationRequestPayload } from 'src/types/Observations';
import useSnackbar from 'src/utils/useSnackbar';

import RescheduleObservationForm from './RescheduleObservationForm';

export default function ScheduleObservation(): JSX.Element {
  const navigate = useSyncNavigate();
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const params = useParams<{ observationId: string }>();
  const { observations, reload, setSelectedPlantingSite } = usePlantingSiteData();
  const { reschedule, rescheduleResult } = useRescheduleObservation();

  const [formData, setFormData] = useState<RescheduleObservationRequestPayload>();

  const observationId = useMemo(() => {
    if (params.observationId) {
      return Number(params.observationId);
    }
  }, [params]);

  const goToObservations = useCallback(() => navigate(APP_PATHS.OBSERVATIONS), [navigate]);

  useEffect(() => {
    if (observations) {
      const observation = observations.find((data) => data.id === observationId);
      if (!observation) {
        goToObservations();
      } else {
        setSelectedPlantingSite(observation.plantingSiteId);
        setFormData({ startDate: observation.startDate, endDate: observation.endDate });
      }
    }
  }, [goToObservations, observationId, observations, setSelectedPlantingSite]);

  useEffect(() => {
    if (rescheduleResult?.status === 'error') {
      snackbar.toastError();
    } else if (rescheduleResult?.status === 'success') {
      snackbar.toastSuccess(strings.OBSERVATION_RESCHEDULED);
      reload();
      goToObservations();
    }
  }, [dispatch, rescheduleResult, goToObservations, snackbar, reload]);

  const onSave = useCallback(
    (data: RescheduleObservationRequestPayload) => {
      if (observationId) {
        reschedule(observationId, data.startDate, data.endDate);
      }
    },
    [observationId, reschedule]
  );

  return (
    <>
      {rescheduleResult?.status === 'pending' && <BusySpinner withSkrim={true} />}
      {formData && (
        <RescheduleObservationForm
          title={strings.RESCHEDULE_OBSERVATION}
          initialData={formData}
          onCancel={goToObservations}
          onSave={onSave}
        />
      )}
    </>
  );
}

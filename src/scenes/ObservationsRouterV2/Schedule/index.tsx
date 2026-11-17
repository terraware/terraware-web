import React, { type JSX } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { useGetObservationQuery } from 'src/queries/generated/observations';
import { RESCHEDULE_OBSERVATION_PARAM } from 'src/scenes/ObservationsRouterV2/ListView/ScheduledObservations';

import ScheduleView from './Schedule';

const LegacyRescheduleRedirect = (): JSX.Element | null => {
  const { observationId } = useParams<{ observationId: string }>();
  const id = Number(observationId);
  const { currentData, isFetching } = useGetObservationQuery(id, { skip: isNaN(id) });

  if (isFetching) {
    return null;
  }

  const search = new URLSearchParams({ [RESCHEDULE_OBSERVATION_PARAM]: observationId ?? '' });
  if (currentData) {
    search.set('plantingSiteId', currentData.observation.plantingSiteId.toString());
  }
  return <Navigate replace to={`${APP_PATHS.OBSERVATIONS}?${search.toString()}`} />;
};

const ObservationScheduleRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:observationId'} element={<LegacyRescheduleRedirect />} />
      <Route path={'/*'} element={<ScheduleView />} />
    </Routes>
  );
};

export default ObservationScheduleRouter;

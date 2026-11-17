import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { screen } from '@testing-library/react';

import { buildObservation, mockError, mockGet, renderWithProviders } from 'src/test-utils';

import ObservationScheduleRouter from './index';

const CurrentUrl = () => {
  const { pathname, search } = useLocation();
  return <div>{`${pathname}${search}`}</div>;
};

const renderLegacyLink = (observationId: number) =>
  renderWithProviders(
    <Routes>
      <Route path='/observations/schedule/*' element={<ObservationScheduleRouter />} />
      <Route path='/observations' element={<CurrentUrl />} />
    </Routes>,
    { route: `/observations/schedule/${observationId}` }
  );

describe('ObservationScheduleRouter', () => {
  it("sends old reschedule links to the observation's site to reschedule it there", async () => {
    mockGet('/api/v1/tracking/observations/5', { observation: buildObservation({ id: 5, plantingSiteId: 3 }) });

    renderLegacyLink(5);

    expect(await screen.findByText('/observations?rescheduleObservationId=5&plantingSiteId=3')).toBeInTheDocument();
  });

  it('still sends old reschedule links to the observations list when the observation cannot be loaded', async () => {
    mockError('get', '/api/v1/tracking/observations/5', 404);

    renderLegacyLink(5);

    expect(await screen.findByText('/observations?rescheduleObservationId=5')).toBeInTheDocument();
  });
});

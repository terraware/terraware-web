import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';

import ObservationScheduleRouter from 'src/scenes/ObservationsRouterV2/Schedule';
import strings from 'src/strings';
import {
  buildObservation,
  buildPlantingSite,
  buildUser,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

const OBSERVATION_ID = 5;
const OBSERVATION_URL = `/api/v1/tracking/observations/${OBSERVATION_ID}`;

const isoDaysFromNow = (days: number) => DateTime.now().plus({ days }).toISODate()!;

const SITE = buildPlantingSite({ id: 1, name: 'Mahogany Ridge' });
const OTHER_SITE = buildPlantingSite({ id: 2, name: 'Ceiba Grove' });
const OBSERVATION = buildObservation({
  endDate: isoDaysFromNow(40),
  id: OBSERVATION_ID,
  plantingSiteId: SITE.id,
  plantingSiteName: SITE.name,
  startDate: isoDaysFromNow(10),
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderReschedulePage = () => {
  mockGet('/api/v1/users/me/preferences', { preferences: { scheduledBiomassMonitoringObservations: true } });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/sites', { sites: [SITE, OTHER_SITE] });
  mockGet(`/api/v1/tracking/sites/${SITE.id}`, { site: SITE });
  mockGet('/api/v1/tracking/sites/reportedPlants', {
    sites: [SITE, OTHER_SITE].map(({ id }) => ({ id, strata: [{ substrata: [{ totalPlants: 10 }] }] })),
  });
  mockGet('/api/v1/tracking/observations', { observations: [OBSERVATION] });
  mockGet(OBSERVATION_URL, { observation: OBSERVATION });

  return renderWithProviders(
    <>
      <Routes>
        <Route path='/observations/schedule/*' element={<ObservationScheduleRouter />} />
        <Route path='/observations' element={<div />} />
      </Routes>
      <LocationProbe />
    </>,
    { route: `/observations/schedule/${OBSERVATION_ID}` }
  );
};

const siteInput = () => document.querySelector<HTMLInputElement>('#site input');

const waitForObservation = () => waitFor(() => expect(siteInput()).toHaveValue(SITE.name));

const enterDate = async (user: UserEvent, label: string, date: string) => {
  await user.click(screen.getByLabelText(label));
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(date);
};

const enterDates = async (user: UserEvent, startDate: string, endDate: string) => {
  await enterDate(user, strings.OBSERVATION_START_DATE, startDate);
  await enterDate(user, strings.OBSERVATION_END_DATE, endDate);
};

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

describe('Reschedule observation page', () => {
  it("keeps the observation's site, substrata and monitoring type", async () => {
    const { user } = renderReschedulePage();

    expect(await screen.findByText(strings.RESCHEDULE_OBSERVATION)).toBeInTheDocument();
    await waitForObservation();

    await user.click(siteInput()!);
    expect(screen.queryByText(OTHER_SITE.name)).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(strings.SELECT_ALL)).not.toBeInTheDocument();
  });

  it('moves the observation to the new dates and returns to observations', async () => {
    const requests = captureRequests('put', OBSERVATION_URL);
    const { store, user } = renderReschedulePage();

    await waitForObservation();
    await enterDates(user, isoDaysFromNow(14), isoDaysFromNow(45));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({ endDate: isoDaysFromNow(45), startDate: isoDaysFromNow(14) });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/observations$/));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      msg: strings.OBSERVATION_RESCHEDULED,
      priority: 'success',
    });
  });

  it('does not reschedule to dates outside the observation period', async () => {
    const requests = captureRequests('put', OBSERVATION_URL);
    const { user } = renderReschedulePage();

    await waitForObservation();
    await enterDates(user, isoDaysFromNow(14), isoDaysFromNow(90));
    await save(user);
    await enterDates(user, isoDaysFromNow(14), isoDaysFromNow(10));
    await save(user);

    expect(requests).toHaveLength(0);
    expect(screen.getByTestId('location')).toHaveTextContent(`/observations/schedule/${OBSERVATION_ID}`);
  });

  it('explains why the dates are refused', async () => {
    const { user } = renderReschedulePage();

    await waitForObservation();
    await enterDates(user, isoDaysFromNow(14), isoDaysFromNow(90));
    await save(user);

    expect(await screen.findByText(strings.INVALID_DATE)).toBeInTheDocument();
  });

  it("starts from the observation's current dates", async () => {
    const requests = captureRequests('put', OBSERVATION_URL);
    const { user } = renderReschedulePage();

    await waitForObservation();
    await enterDate(user, strings.OBSERVATION_END_DATE, isoDaysFromNow(45));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({ endDate: isoDaysFromNow(45), startDate: OBSERVATION.startDate });
  });

  it('stays on the form and reports the failure when rescheduling fails', async () => {
    mockError('put', OBSERVATION_URL);
    const { store, user } = renderReschedulePage();

    await waitForObservation();
    await enterDates(user, isoDaysFromNow(14), isoDaysFromNow(45));
    await save(user);

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(screen.getByTestId('location')).toHaveTextContent(`/observations/schedule/${OBSERVATION_ID}`);
  });

  it('returns to observations without rescheduling when cancelled', async () => {
    const requests = captureRequests('put', OBSERVATION_URL);
    const { user } = renderReschedulePage();

    await waitForObservation();
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/observations$/);
    expect(requests).toHaveLength(0);
  });
});

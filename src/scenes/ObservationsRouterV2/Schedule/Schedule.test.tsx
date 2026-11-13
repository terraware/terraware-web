import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';

import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  buildUser,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
} from 'src/test-utils';

import ScheduleObservation from './Schedule';

const OBSERVATIONS_URL = '/api/v1/tracking/observations';

const SITE = buildPlantingSite({
  areaHa: 10,
  id: 1,
  strata: [buildStratum({ id: 1, substrata: [buildSubstratum({ id: 11 })] })],
});

const START_DATE = DateTime.now().plus({ days: 7 }).toISODate();
const END_DATE = DateTime.now().plus({ days: 14 }).toISODate();

const renderSchedule = (assignPlotsWhenScheduling: boolean) => {
  const preferenceRequests = captureRequests('get', '/api/v1/users/me/preferences', {
    preferences: { assignPlotsWhenScheduling },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/sites', { sites: [SITE] });
  mockGet(`/api/v1/tracking/sites/${SITE.id}`, { site: SITE });
  mockGet(OBSERVATIONS_URL, { observations: [] });
  mockGet('/api/v1/tracking/sites/reportedPlants', {
    sites: [
      {
        id: SITE.id,
        species: [],
        strata: [
          {
            id: 1,
            progressPercent: 0,
            species: [],
            substrata: [{ id: 11, species: [], totalPlants: 10, totalSpecies: 1 }],
            totalPlants: 10,
            totalSpecies: 1,
          },
        ],
        totalPlants: 10,
      },
    ],
  });

  return { ...renderWithProviders(<ScheduleObservation />), preferenceRequests };
};

const enterDate = async (user: UserEvent, label: string, date: string) => {
  await user.click(screen.getByLabelText(label));
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(date);
};

const fillAndSubmit = async (user: UserEvent) => {
  await user.click(await screen.findByRole('checkbox', { name: strings.SELECT_ALL }));
  await enterDate(user, strings.OBSERVATION_START_DATE, START_DATE);
  await enterDate(user, strings.OBSERVATION_END_DATE, END_DATE);
  await user.click(screen.getByRole('button', { name: strings.SAVE }));
};

describe('ScheduleObservation', () => {
  it('asks the server to assign plots right away when plot assignment at scheduling is enabled', async () => {
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 1 });
    const { user } = renderSchedule(true);

    await fillAndSubmit(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      assignPlots: true,
      endDate: END_DATE,
      plantingSiteId: SITE.id,
      requestedSubstratumIds: [11],
      startDate: START_DATE,
    });
  });

  it('leaves plot assignment to the observation start when plot assignment at scheduling is disabled', async () => {
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 1 });
    const { preferenceRequests, user } = renderSchedule(false);

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    await fillAndSubmit(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    const body = await requests[0].json();
    expect(body).toMatchObject({ plantingSiteId: SITE.id, startDate: START_DATE });
    expect(body).not.toHaveProperty('assignPlots');
  });

  it('explains that the site has no room for plots when the server rejects the schedule as a conflict', async () => {
    mockError('post', OBSERVATIONS_URL, 409);
    const { store, user } = renderSchedule(true);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.NO_ROOM_FOR_MONITORING_PLOTS,
        priority: 'critical',
      })
    );
  });

  it('shows the generic error when scheduling fails for another reason', async () => {
    mockError('post', OBSERVATIONS_URL);
    const { store, user } = renderSchedule(true);

    await fillAndSubmit(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
  });
});

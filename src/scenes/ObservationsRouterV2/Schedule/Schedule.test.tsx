import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { rs } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';

import { MIXPANEL_EVENTS } from 'src/mixpanelEvents';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import ObservationScheduleRouter from 'src/scenes/ObservationsRouterV2/Schedule';
import strings from 'src/strings';
import {
  buildObservation,
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  buildUser,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';

const { trackEvent } = rs.hoisted(() => ({ trackEvent: rs.fn() }));
rs.mock('src/hooks/useTrackEvent', () => ({ useTrackEvent: () => trackEvent }));

const OBSERVATIONS_URL = '/api/v1/tracking/observations';

const RIDGE = buildPlantingSite({
  id: 1,
  name: 'Mahogany Ridge',
  strata: [
    buildStratum({
      id: 1,
      name: 'East Slope',
      substrata: [buildSubstratum({ id: 11, name: 'North' }), buildSubstratum({ id: 12, name: 'South' })],
    }),
  ],
});
const GROVE = buildPlantingSite({
  id: 2,
  name: 'Ceiba Grove',
  strata: [buildStratum({ id: 2, name: 'Lowlands', substrata: [buildSubstratum({ id: 21, name: 'Riverside' })] })],
});

const isoDaysFromNow = (days: number) => DateTime.now().plus({ days }).toISODate()!;

type SiteSetup = { site: PlantingSitePayload; hasPlantings?: boolean };

const mockSites = (setups: SiteSetup[], observations = [buildObservation({ state: 'Completed' })]) => {
  mockGet('/api/v1/tracking/sites', { sites: setups.map(({ site }) => site) });
  setups.forEach(({ site }) => mockGet(`/api/v1/tracking/sites/${site.id}`, { site }));
  mockGet('/api/v1/tracking/sites/reportedPlants', {
    sites: setups.map(({ site, hasPlantings = true }) => ({
      id: site.id,
      strata: [{ substrata: [{ totalPlants: hasPlantings ? 10 : 0 }] }],
    })),
  });
  mockGet(OBSERVATIONS_URL, { observations });
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderSchedulePage = ({
  assignPlotsWhenScheduling = false,
  biomassEnabled = false,
  route = '/observations/schedule',
} = {}) => {
  const preferenceRequests = captureRequests('get', '/api/v1/users/me/preferences', {
    preferences: { assignPlotsWhenScheduling, scheduledBiomassMonitoringObservations: biomassEnabled },
  });
  mockGet('/api/v1/users/me', { user: buildUser() });

  const rendered = renderWithProviders(
    <>
      <Routes>
        <Route path='/observations/schedule/*' element={<ObservationScheduleRouter />} />
        <Route path='/observations' element={<div />} />
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
  return { ...rendered, preferenceRequests };
};

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

const siteOptions = async (user: UserEvent) => {
  await user.click(document.querySelector('#site input')!);
  return within(await screen.findByRole('list'))
    .getAllByRole('listitem')
    .map((option) => option.textContent);
};

beforeEach(() => {
  trackEvent.mockClear();
});

describe('Schedule observation page', () => {
  it('schedules the chosen substrata of the chosen site and returns to observations', async () => {
    mockSites([{ site: RIDGE }, { site: GROVE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { store, user } = renderSchedulePage();

    await waitFor(() => expect(document.querySelector('#site input')).toBeEnabled());
    await selectDropdownOption(user, 'site', 'Mahogany Ridge');
    // Every substratum starts out selected.
    await user.click(await screen.findByLabelText('North'));
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      endDate: isoDaysFromNow(30),
      plantingSiteId: RIDGE.id,
      requestedSubstratumIds: [12],
      startDate: isoDaysFromNow(7),
    });
    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/observations$/));
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      priority: 'success',
      msg: strings.OBSERVATION_SCHEDULED,
    });
  });

  it('sends the monitoring type being scheduled when biomass scheduling is on', async () => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { user } = renderSchedulePage({ biomassEnabled: true });

    await user.click(
      await screen.findByRole('radio', {
        name: (name) => name.includes(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE),
      })
    );
    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({ observationType: 'Biomass Measurements' });
  });

  it('offers only sites with plantings and no upcoming observation, in name order', async () => {
    const pending = buildPlantingSite({ id: 3, name: 'Acacia Flats' });
    const unplanted = buildPlantingSite({ id: 4, name: 'Baobab Hill' });
    mockSites(
      [{ site: RIDGE }, { site: GROVE }, { site: pending }, { site: unplanted, hasPlantings: false }],
      [
        buildObservation({ id: 1, plantingSiteId: pending.id, endDate: isoDaysFromNow(30) }),
        buildObservation({ id: 2, plantingSiteId: GROVE.id, endDate: isoDaysFromNow(-1) }),
      ]
    );
    const { user } = renderSchedulePage();

    await waitFor(() => expect(document.querySelector('#site input')).toBeEnabled());
    expect(await siteOptions(user)).toEqual(['Ceiba Grove', 'Mahogany Ridge']);
  });

  it('selects the only site that can be observed', async () => {
    mockSites([{ site: RIDGE }]);
    renderSchedulePage();

    expect(await screen.findByLabelText('North')).toBeInTheDocument();
    expect(document.querySelector<HTMLInputElement>('#site input')).toHaveValue('Mahogany Ridge');
  });

  it('selects the site the user came from', async () => {
    mockSites([{ site: RIDGE }, { site: GROVE }]);
    renderSchedulePage({ route: `/observations/schedule?plantingSiteId=${GROVE.id}` });

    expect(await screen.findByLabelText('Riverside')).toBeInTheDocument();
    expect(document.querySelector<HTMLInputElement>('#site input')).toHaveValue('Ceiba Grove');
  });

  it('asks for a site, substrata and both dates before scheduling', async () => {
    mockSites([{ site: RIDGE }, { site: GROVE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { user } = renderSchedulePage();

    await waitFor(() => expect(document.querySelector('#site input')).toBeEnabled());
    await save(user);

    // The site and both dates.
    expect(screen.getAllByText(strings.REQUIRED_FIELD)).toHaveLength(3);

    await selectDropdownOption(user, 'site', 'Ceiba Grove');
    await user.click(await screen.findByLabelText('Riverside'));
    await save(user);

    expect(screen.getByText(strings.SELECT_AT_LEAST_ONE_SUBSTRATUM)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it.each([
    {
      label: 'starting more than a year out',
      start: () => DateTime.now().plus({ years: 1, days: 1 }),
      end: () => DateTime.now().plus({ years: 1, days: 14 }),
    },
    {
      label: 'ending the day it starts',
      start: () => DateTime.now().plus({ days: 7 }),
      end: () => DateTime.now().plus({ days: 7 }),
    },
    {
      label: 'ending before it starts',
      start: () => DateTime.now().plus({ days: 7 }),
      end: () => DateTime.now().plus({ days: 3 }),
    },
    {
      label: 'more than two months long',
      start: () => DateTime.now().plus({ days: 7 }),
      end: () => DateTime.now().plus({ days: 75 }),
    },
  ])('refuses an observation $label', async ({ start, end }) => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { user } = renderSchedulePage();

    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, start().toISODate()!, end().toISODate()!);
    await save(user);

    expect(await screen.findByText(strings.INVALID_DATE)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('accepts an observation starting today', async () => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { user } = renderSchedulePage();

    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(0), isoDaysFromNow(30));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByText(strings.INVALID_DATE)).not.toBeInTheDocument();
  });

  it('stays on the form and reports the failure when scheduling fails', async () => {
    mockSites([{ site: RIDGE }]);
    mockError('post', OBSERVATIONS_URL);
    const { store, user } = renderSchedulePage();

    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/observations/schedule');
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();
  });

  it('explains that the site has no room for plots when the server rejects the schedule as a conflict', async () => {
    mockSites([{ site: RIDGE }]);
    mockError('post', OBSERVATIONS_URL, 409);
    const { store, user } = renderSchedulePage({ assignPlotsWhenScheduling: true });

    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.NO_ROOM_FOR_MONITORING_PLOTS,
        priority: 'critical',
      })
    );
    expect(screen.getByTestId('location')).toHaveTextContent('/observations/schedule');
  });

  it('asks the server to assign plots right away when plot assignment at scheduling is enabled', async () => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { preferenceRequests, user } = renderSchedulePage({ assignPlotsWhenScheduling: true });

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({ assignPlots: true, plantingSiteId: RIDGE.id });
  });

  it('leaves plot assignment to the observation start when plot assignment at scheduling is disabled', async () => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { preferenceRequests, user } = renderSchedulePage();

    await waitFor(() => expect(preferenceRequests).toHaveLength(1));
    await screen.findByLabelText(strings.SELECT_ALL);
    await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).not.toHaveProperty('assignPlots');
  });

  it('returns to observations without scheduling when cancelled', async () => {
    mockSites([{ site: RIDGE }]);
    const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
    const { user } = renderSchedulePage();

    await screen.findByLabelText(strings.SELECT_ALL);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/observations$/);
    expect(requests).toHaveLength(0);
  });

  describe('on a site smaller than 3 hectares', () => {
    const smallSite = { ...RIDGE, areaHa: 2.5 };

    const fillAndSave = async (user: UserEvent) => {
      await screen.findByLabelText(strings.SELECT_ALL);
      await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
      await save(user);
      // The dialog shares its title with the page, so find it by its message instead.
      const warning = await screen.findByText(strings.OBSERVATION_SMALL_SITE_WARNING);
      return warning.closest('.dialog-box') as HTMLElement;
    };

    it('warns before scheduling and schedules once the user confirms', async () => {
      mockSites([{ site: smallSite }]);
      const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
      const { user } = renderSchedulePage();

      const dialog = await fillAndSave(user);
      expect(requests).toHaveLength(0);

      await user.click(within(dialog).getByRole('button', { name: strings.SAVE }));

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toMatchObject({ plantingSiteId: RIDGE.id, requestedSubstratumIds: [11, 12] });
    });

    it('schedules nothing when the user cancels the warning', async () => {
      mockSites([{ site: smallSite }]);
      const requests = captureRequests('post', OBSERVATIONS_URL, { id: 100 });
      const { user } = renderSchedulePage();

      const dialog = await fillAndSave(user);
      await user.click(within(dialog).getByRole('button', { name: strings.CANCEL }));

      expect(screen.queryByText(strings.OBSERVATION_SMALL_SITE_WARNING)).not.toBeInTheDocument();
      expect(screen.getByTestId('location')).toHaveTextContent('/observations/schedule');
      expect(requests).toHaveLength(0);
    });
  });

  describe('analytics', () => {
    const scheduledEvents = () =>
      trackEvent.mock.calls
        .filter(([name]) => name === MIXPANEL_EVENTS.OBSERVATION_SCHEDULED)
        .map(([, properties]) => properties);

    it('reports what was scheduled once the server has accepted it', async () => {
      mockSites([{ site: RIDGE }]);
      captureRequests('post', OBSERVATIONS_URL, { id: 100 });
      const { user } = renderSchedulePage();

      await screen.findByLabelText(strings.SELECT_ALL);
      await user.click(screen.getByLabelText('North'));
      await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
      await save(user);

      await waitFor(() =>
        expect(scheduledEvents()).toEqual([
          {
            default_type_changed: false,
            duration_days: 23,
            includes_surveyed_strata: false,
            monitoring_type: 'Plant Monitoring',
            observation_id: 100,
            planting_site_id: RIDGE.id,
            site_has_plantings: true,
            substrata_count: 1,
          },
        ])
      );
    });

    it('reports the monitoring type the user picked instead of the default one', async () => {
      mockSites([{ site: RIDGE }]);
      captureRequests('post', OBSERVATIONS_URL, { id: 101 });
      const { user } = renderSchedulePage({ biomassEnabled: true });

      await user.click(
        await screen.findByRole('radio', {
          name: (name) => name.includes(strings.SCHEDULE_OBSERVATION_BIOMASS_MONITORING_TITLE),
        })
      );
      await screen.findByLabelText(strings.SELECT_ALL);
      await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
      await save(user);

      await waitFor(() =>
        expect(scheduledEvents()).toEqual([
          {
            default_type_changed: true,
            duration_days: 23,
            includes_surveyed_strata: false,
            monitoring_type: 'Biomass Monitoring',
            observation_id: 101,
            planting_site_id: RIDGE.id,
            site_has_plantings: true,
            substrata_count: 2,
          },
        ])
      );
    });

    it('reports nothing when the server rejects the schedule', async () => {
      mockSites([{ site: RIDGE }]);
      mockError('post', OBSERVATIONS_URL);
      const { store, user } = renderSchedulePage();

      await screen.findByLabelText(strings.SELECT_ALL);
      await enterDates(user, isoDaysFromNow(7), isoDaysFromNow(30));
      await save(user);

      await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
      expect(scheduledEvents()).toEqual([]);
    });
  });
});

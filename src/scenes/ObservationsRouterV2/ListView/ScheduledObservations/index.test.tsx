import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';

import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import ScheduledObservationsMenu from 'src/scenes/ObservationsRouterV2/ListView/ScheduledObservations';
import strings from 'src/strings';
import { buildObservation, buildUser, captureRequests, mockError, mockGet, renderWithProviders } from 'src/test-utils';

const isoDaysFromNow = (days: number) => DateTime.now().plus({ days }).toISODate()!;

const FIRST = buildObservation({
  endDate: isoDaysFromNow(40),
  id: 5,
  plantingSiteName: 'Mahogany Ridge',
  startDate: isoDaysFromNow(10),
});
const SECOND = buildObservation({
  endDate: isoDaysFromNow(60),
  id: 6,
  plantingSiteId: 2,
  plantingSiteName: 'Ceiba Grove',
  startDate: isoDaysFromNow(30),
});

const rescheduleUrl = (id: number) => `/api/v1/tracking/observations/${id}`;

const renderMenu = (canReschedule = true) => {
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/observations', { observations: [SECOND, FIRST] });

  return renderWithProviders(
    <ScheduledObservationsMenu canReschedule={canReschedule} plantingSiteId={ALL_PLANTING_SITES} />
  );
};

const openFlyout = async (user: UserEvent) => {
  await user.click(document.querySelector('#scheduled-observations')!);
  await screen.findByText('Mahogany Ridge');
};

const startRescheduling = async (user: UserEvent, index = 0) => {
  await user.click(screen.getAllByText(strings.RESCHEDULE)[index]);
};

const enterDate = async (user: UserEvent, label: string, date: string) => {
  await user.click(screen.getByLabelText(label));
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(date);
};

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

describe('ScheduledObservationsMenu rescheduling', () => {
  it('offers rescheduling only to users who can reschedule', async () => {
    const { user } = renderMenu(false);

    await openFlyout(user);

    expect(screen.queryByText(strings.RESCHEDULE)).not.toBeInTheDocument();
  });

  it("starts from the observation's current dates", async () => {
    const { user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);

    expect(screen.getByLabelText(strings.START_DATE)).toHaveValue(FIRST.startDate);
    expect(screen.getByLabelText(strings.END_DATE)).toHaveValue(FIRST.endDate);
  });

  it('moves the observation to the new dates and closes the form', async () => {
    const requests = captureRequests('put', rescheduleUrl(FIRST.id));
    const { store, user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);
    await enterDate(user, strings.END_DATE, isoDaysFromNow(45));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({ endDate: isoDaysFromNow(45), startDate: FIRST.startDate });
    await waitFor(() => expect(screen.queryByLabelText(strings.START_DATE)).not.toBeInTheDocument());
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      msg: strings.OBSERVATION_RESCHEDULED,
      priority: 'success',
    });
  });

  it.each([
    { label: 'more than two months long', startDays: 10, endDays: 80 },
    { label: 'ending before it starts', startDays: 10, endDays: 5 },
    { label: 'starting more than a year out', startDays: 370, endDays: 380 },
  ])('refuses an observation $label', async ({ startDays, endDays }) => {
    const requests = captureRequests('put', rescheduleUrl(FIRST.id));
    const { user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);
    await enterDate(user, strings.START_DATE, isoDaysFromNow(startDays));
    await enterDate(user, strings.END_DATE, isoDaysFromNow(endDays));
    await save(user);

    expect(await screen.findByText(strings.INVALID_DATE)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('keeps the form open and reports the failure when rescheduling fails', async () => {
    mockError('put', rescheduleUrl(FIRST.id));
    const { store, user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);
    await enterDate(user, strings.END_DATE, isoDaysFromNow(45));
    await save(user);

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(screen.getByLabelText(strings.END_DATE)).toHaveValue(isoDaysFromNow(45));
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();
  });

  it('closes the form without rescheduling when cancelled', async () => {
    const requests = captureRequests('put', rescheduleUrl(FIRST.id));
    const { user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(screen.queryByLabelText(strings.START_DATE)).not.toBeInTheDocument();
    expect(screen.getAllByText(strings.RESCHEDULE)).toHaveLength(2);
    expect(requests).toHaveLength(0);
  });

  it('reschedules one observation at a time, the one the user picked', async () => {
    const requests = captureRequests('put', rescheduleUrl(SECOND.id));
    const { user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user, 0);
    await startRescheduling(user, 0);

    // The first observation's form closed when the second's opened.
    expect(screen.getAllByLabelText(strings.START_DATE)).toHaveLength(1);
    expect(screen.getByLabelText(strings.START_DATE)).toHaveValue(SECOND.startDate);

    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({ endDate: SECOND.endDate, startDate: SECOND.startDate });
  });

  it('forgets an unsaved reschedule when the menu closes', async () => {
    const { user } = renderMenu();

    await openFlyout(user);
    await startRescheduling(user);
    const header = screen.getByText(strings.SCHEDULED_OBSERVATIONS, { selector: 'p' }).parentElement!.parentElement!;
    await user.click(within(header).getByRole('button', { name: strings.CLOSE }));
    await waitFor(() => expect(screen.queryByText('Mahogany Ridge')).not.toBeInTheDocument());

    await openFlyout(user);

    expect(screen.queryByLabelText(strings.START_DATE)).not.toBeInTheDocument();
  });
});

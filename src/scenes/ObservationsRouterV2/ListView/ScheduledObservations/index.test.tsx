import React, { createRef, useCallback, useState } from 'react';

import { act, screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { DateTime } from 'luxon';

import { ALL_PLANTING_SITES } from 'src/hooks/useStickyPlantingSiteId';
import ScheduledObservationsMenu, {
  ScheduledObservationsButton,
  type ScheduledObservationsMenuHandle,
} from 'src/scenes/ObservationsRouterV2/ListView/ScheduledObservations';
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

const IN_PROGRESS = buildObservation({
  endDate: isoDaysFromNow(3),
  id: 7,
  plantingSiteName: 'Hilo Watershed',
  startDate: isoDaysFromNow(-10),
  state: 'InProgress',
});
const OVERDUE_DAYS = buildObservation({
  endDate: isoDaysFromNow(-48),
  id: 8,
  plantingSiteName: 'Kau Forest Reserve',
  startDate: isoDaysFromNow(-70),
  state: 'Overdue',
});
const OVERDUE_MONTHS = buildObservation({
  endDate: DateTime.now().minus({ months: 3 }).toISODate()!,
  id: 9,
  plantingSiteName: 'Mauna Kea South',
  startDate: DateTime.now().minus({ months: 4 }).toISODate()!,
  state: 'Overdue',
});
const PARTLY_OBSERVED = buildObservation({
  endDate: isoDaysFromNow(5),
  id: 12,
  numIncompletePlots: 2,
  numPlots: 3,
  plantingSiteName: 'Partly Observed Site',
  startDate: isoDaysFromNow(-5),
  state: 'InProgress',
});
const MORE_OVERDUE = [10, 11].map((id) =>
  buildObservation({
    endDate: isoDaysFromNow(-id),
    id,
    plantingSiteName: `Overdue Site ${id}`,
    startDate: isoDaysFromNow(-id - 20),
    state: 'Overdue',
  })
);

const rescheduleUrl = (id: number) => `/api/v1/tracking/observations/${id}`;

type MenuWithButtonProps = {
  canReschedule: boolean;
  menuRef: React.RefObject<ScheduledObservationsMenuHandle | null>;
};

const MenuWithButton = ({ canReschedule, menuRef }: MenuWithButtonProps) => {
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const open = useCallback(() => menuRef.current?.open(), [menuRef]);

  return (
    <>
      <ScheduledObservationsButton active={flyoutOpen} onClick={open} plantingSiteId={ALL_PLANTING_SITES} />
      <ScheduledObservationsMenu
        canReschedule={canReschedule}
        onFlyoutOpenChange={setFlyoutOpen}
        plantingSiteId={ALL_PLANTING_SITES}
        ref={menuRef}
      />
    </>
  );
};

const renderMenu = (
  canReschedule = true,
  observations = [SECOND, FIRST],
  ref = createRef<ScheduledObservationsMenuHandle>()
) => {
  mockGet('/api/v1/users/me/preferences', { preferences: {} });
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/tracking/observations', { observations });

  return renderWithProviders(<MenuWithButton canReschedule={canReschedule} menuRef={ref} />);
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

const section = (name: string) => screen.getByRole('button', { name: new RegExp(`^${name}`) });

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

describe('ScheduledObservationsMenu sections', () => {
  const ALL = [SECOND, FIRST, IN_PROGRESS, OVERDUE_DAYS, OVERDUE_MONTHS, ...MORE_OVERDUE];

  it('opens with only the upcoming observations showing', async () => {
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);

    expect(screen.getByText('Ceiba Grove')).toBeInTheDocument();
    expect(screen.queryByText(IN_PROGRESS.plantingSiteName)).not.toBeInTheDocument();
    expect(screen.queryByText(OVERDUE_DAYS.plantingSiteName)).not.toBeInTheDocument();
    expect(section(strings.UPCOMING)).toHaveAttribute('aria-expanded', 'true');
    expect(section(strings.IN_PROGRESS)).toHaveAttribute('aria-expanded', 'false');
    expect(section(strings.OVERDUE)).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps only one section open at a time', async () => {
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);
    await user.click(section(strings.IN_PROGRESS));

    expect(screen.getByText(IN_PROGRESS.plantingSiteName)).toBeInTheDocument();
    expect(screen.queryByText('Mahogany Ridge')).not.toBeInTheDocument();

    await user.click(section(strings.OVERDUE));

    expect(screen.getByText(OVERDUE_DAYS.plantingSiteName)).toBeInTheDocument();
    expect(screen.queryByText(IN_PROGRESS.plantingSiteName)).not.toBeInTheDocument();
    expect(section(strings.IN_PROGRESS)).toHaveAttribute('aria-expanded', 'false');
  });

  it('tells how soon in-progress observations end', async () => {
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);
    await user.click(section(strings.IN_PROGRESS));

    expect(screen.getByText(strings.formatString(strings.ENDS_IN_X, '3 days') as string)).toBeInTheDocument();
  });

  it('tells how long observations have been overdue in days, then months', async () => {
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);
    await user.click(section(strings.OVERDUE));

    expect(screen.getByText(strings.formatString(strings.X_OVERDUE, '3 months') as string)).toBeInTheDocument();
    expect(screen.getByText(strings.formatString(strings.X_OVERDUE, '48 days') as string)).toBeInTheDocument();
  });

  it('lists every observation in a section when the user asks to view them all', async () => {
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);
    await user.click(section(strings.OVERDUE));
    expect(screen.queryByText('Overdue Site 10')).not.toBeInTheDocument();

    await user.click(screen.getByText(strings.formatString(strings.VIEW_ALL_X_OVERDUE, 4) as string));

    expect(await screen.findByText('Overdue Site 10')).toBeInTheDocument();
    expect(screen.getByText('Overdue Site 11')).toBeInTheDocument();
    expect(screen.getByText(OVERDUE_DAYS.plantingSiteName)).toBeInTheDocument();
  });

  it('reschedules an overdue observation', async () => {
    const requests = captureRequests('put', rescheduleUrl(OVERDUE_MONTHS.id));
    const { user } = renderMenu(true, ALL);

    await openFlyout(user);
    await user.click(section(strings.OVERDUE));
    await startRescheduling(user);
    await enterDate(user, strings.START_DATE, isoDaysFromNow(5));
    await enterDate(user, strings.END_DATE, isoDaysFromNow(20));
    await save(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({ endDate: isoDaysFromNow(20), startDate: isoDaysFromNow(5) });
  });

  it('does not offer rescheduling once plots have been observed', async () => {
    const { user } = renderMenu(true, [FIRST, IN_PROGRESS, PARTLY_OBSERVED]);

    await openFlyout(user);
    await user.click(section(strings.IN_PROGRESS));

    expect(screen.getByText(PARTLY_OBSERVED.plantingSiteName)).toBeInTheDocument();
    expect(screen.getAllByText(strings.RESCHEDULE)).toHaveLength(1);
  });

  describe('when opened to an observation', () => {
    const openTo = async (id: number, observations = ALL) => {
      const ref = createRef<ScheduledObservationsMenuHandle>();
      renderMenu(true, observations, ref);
      await waitFor(() =>
        expect(document.querySelector('.MuiBadge-badge')).toHaveTextContent(observations.length.toString())
      );
      act(() => ref.current!.openToObservation(id));
    };

    it("shows the observation's reschedule form", async () => {
      await openTo(IN_PROGRESS.id);

      expect(await screen.findByLabelText(strings.START_DATE)).toHaveValue(IN_PROGRESS.startDate);
      expect(screen.getByLabelText(strings.END_DATE)).toHaveValue(IN_PROGRESS.endDate);
      expect(section(strings.IN_PROGRESS)).toHaveAttribute('aria-expanded', 'true');
      expect(section(strings.UPCOMING)).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows the whole section when the observation is past the first few', async () => {
      const [lastOverdue, otherOverdue] = MORE_OVERDUE;
      await openTo(lastOverdue.id);

      expect(await screen.findByLabelText(strings.START_DATE)).toHaveValue(lastOverdue.startDate);
      expect(screen.getByText(lastOverdue.plantingSiteName)).toBeInTheDocument();
      expect(screen.getByText(otherOverdue.plantingSiteName)).toBeInTheDocument();
    });

    it('shows, without a form, an observation that can no longer be rescheduled', async () => {
      await openTo(PARTLY_OBSERVED.id, [FIRST, PARTLY_OBSERVED]);

      expect(await screen.findByText(PARTLY_OBSERVED.plantingSiteName)).toBeInTheDocument();
      expect(section(strings.IN_PROGRESS)).toHaveAttribute('aria-expanded', 'true');
      expect(screen.queryByLabelText(strings.START_DATE)).not.toBeInTheDocument();
    });

    it('opens to the upcoming observations when the observation is not scheduled', async () => {
      await openTo(999);

      expect(await screen.findByText(FIRST.plantingSiteName)).toBeInTheDocument();
      expect(section(strings.UPCOMING)).toHaveAttribute('aria-expanded', 'true');
      expect(screen.queryByLabelText(strings.START_DATE)).not.toBeInTheDocument();
    });
  });
});

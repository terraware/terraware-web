import React, { type ComponentProps } from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import PlantingSeasonNotificationBanners from 'src/components/common/PlantingSeasonNotificationBanners';
import { API_PULL_INTERVAL } from 'src/constants';
import type {
  PlantingSeasonNotificationGroupPayload,
  PlantingSeasonNotificationPayload,
} from 'src/queries/generated/plantingSeasons';
import strings from 'src/strings';
import {
  type RenderWithProvidersOptions,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';

const NOTIFICATIONS_URL = '/api/v1/planting-seasons/notifications';
const DISMISS_URL = '/api/v1/planting-seasons/notifications/dismiss';

const ORGANIZATION_ID = 1;
const SEASON_ID = 42;
const OTHER_SEASON_ID = 43;

const buildGroup = (
  overrides: Partial<PlantingSeasonNotificationGroupPayload> = {}
): PlantingSeasonNotificationGroupPayload => ({
  lastEventLogId: 100,
  notificationPage: 'InventoryPlanning',
  notifications: [{ type: 'AllocationQuantitiesUpdated' }],
  plantingSeasonId: SEASON_ID,
  plantingSeasonName: 'Winter 2026',
  plantingSiteName: 'Mauka Site',
  ...overrides,
});

const renderBanners = (
  props: Partial<ComponentProps<typeof PlantingSeasonNotificationBanners>> = {},
  options: RenderWithProvidersOptions = {}
) =>
  renderWithProviders(
    <PlantingSeasonNotificationBanners
      organizationId={ORGANIZATION_ID}
      notificationPage='InventoryPlanning'
      {...props}
    />,
    options
  );

/**
 * The close buttons on screen, one per banner, in the order the banners render.
 *
 * Workaround: `Message` renders its close button icon-only with no accessible name. It is also the
 * only button a banner contains, so the buttons stand in for the banners themselves.
 */
const closeButtons = (): HTMLElement[] => screen.queryAllByRole('button');

/**
 * The full text of each banner, in render order.
 *
 * Workaround: `Message` wraps a banner in a plain div with no role, landmark or accessible name, so
 * there is nothing to query it by. Each banner is reached from its close button, whose parent holds
 * both the button and the message body. The whole text is read at once because a banner renders its
 * notifications as sibling text nodes of one span, which `getByText` cannot match individually.
 */
const bannerTexts = (): string[] => closeButtons().map((closeButton) => closeButton.parentElement?.textContent ?? '');

/** Let the query hook's request settle, for assertions about what is *not* rendered or sent. */
const settle = () => act(async () => void (await new Promise((resolve) => setTimeout(resolve, 0))));

describe('PlantingSeasonNotificationBanners', () => {
  describe('what it asks the server for', () => {
    it('asks only for the page, organization and season it was given', async () => {
      const requests = captureRequests('get', NOTIFICATIONS_URL, { notifications: [] });

      renderBanners({ plantingSeasonId: SEASON_ID, notificationPage: 'PlantingSeasonPlanning' });

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(Object.fromEntries(new URL(requests[0].url).searchParams)).toEqual({
        notificationPage: 'PlantingSeasonPlanning',
        organizationId: String(ORGANIZATION_ID),
        plantingSeasonId: String(SEASON_ID),
      });
    });

    it('asks for nothing until it knows an organization or a season', async () => {
      const requests = captureRequests('get', NOTIFICATIONS_URL, { notifications: [buildGroup()] });

      const { container } = renderBanners({ organizationId: undefined, plantingSeasonId: undefined });
      await settle();

      expect(requests).toHaveLength(0);
      expect(container).toBeEmptyDOMElement();
    });

    it('shows no banner when the server reports nothing to say', async () => {
      const requests = captureRequests('get', NOTIFICATIONS_URL, { notifications: [] });

      const { container } = renderBanners();

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(container).toBeEmptyDOMElement();
    });

    it('shows no banner when the request fails', async () => {
      mockError('get', NOTIFICATIONS_URL);

      const { container } = renderBanners();
      await settle();

      expect(container).toBeEmptyDOMElement();
      expect(closeButtons()).toHaveLength(0);
    });
  });

  describe('what each notification says', () => {
    const notificationCases: [string, PlantingSeasonNotificationPayload, string][] = [
      [
        'allocation quantities changed by the nursery',
        { type: 'AllocationQuantitiesUpdated' },
        strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED,
      ],
      [
        'the season being closed',
        { type: 'PlantingSeasonClosed' },
        strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_CLOSED,
      ],
      [
        'the season running past its end date',
        { type: 'PlantingSeasonPastEndDate' },
        strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_PAST_END_DATE,
      ],
      [
        'a withdrawal recorded against the season',
        { type: 'SeasonWithdrawalRecorded' },
        strings.PLANTING_SEASON_NOTIFICATION_SEASON_WITHDRAWAL_RECORDED,
      ],
      [
        'species targets added, when the server names the species',
        { type: 'SpeciesTargetsAdded', speciesScientificNames: ['Acacia koa'] },
        strings.NEW_SPECIES_TARGETS_ADDED,
      ],
      [
        'species targets added, when the server names no species',
        { type: 'SpeciesTargetsAdded' },
        strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_ADDED_FOR_SEASON,
      ],
      [
        'species targets updated, when the server names the species',
        { type: 'SpeciesTargetsUpdated', speciesScientificNames: ['Acacia koa'] },
        strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_UPDATED,
      ],
      [
        'species targets updated, when the server names no species',
        { type: 'SpeciesTargetsUpdated', speciesScientificNames: [] },
        strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_UPDATED_FOR_SEASON,
      ],
    ];

    it.each(notificationCases)('reports %s', async (_description, notification, expected) => {
      mockGet(NOTIFICATIONS_URL, { notifications: [buildGroup({ notifications: [notification] })] });

      renderBanners({ plantingSeasonId: SEASON_ID });

      await waitFor(() => expect(bannerTexts()).toEqual([expected]));
    });

    it('spells out the requested dates for a planting date request on the withdrawals page', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({
            notificationPage: 'Withdrawals',
            notifications: [{ type: 'ScheduledPlantingDateRequested', dates: ['2026-06-01', '2026-06-15'] }],
          }),
        ],
      });

      renderBanners({ plantingSeasonId: SEASON_ID, notificationPage: 'Withdrawals' });

      await waitFor(() =>
        expect(bannerTexts()).toEqual([
          strings.formatString(
            strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED_INVENTORY_WITH_DATES,
            'Jun 1, 2026, Jun 15, 2026'
          ),
        ])
      );
    });

    it('formats the requested dates in the active locale', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({
            notificationPage: 'Withdrawals',
            notifications: [{ type: 'ScheduledPlantingDateRequested', dates: ['2026-06-01'] }],
          }),
        ],
      });

      renderBanners(
        { plantingSeasonId: SEASON_ID, notificationPage: 'Withdrawals' },
        { localization: { activeLocale: 'fr', selectedLocale: 'fr' } }
      );

      await waitFor(() => expect(bannerTexts()[0]).toContain('1 juin 2026'));
    });

    it('omits the dates from a planting date request when the server sends none', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({ notificationPage: 'Withdrawals', notifications: [{ type: 'ScheduledPlantingDateRequested' }] }),
        ],
      });

      renderBanners({ plantingSeasonId: SEASON_ID, notificationPage: 'Withdrawals' });

      await waitFor(() =>
        expect(bannerTexts()).toEqual([
          strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED_INVENTORY,
        ])
      );
    });

    it('summarizes planting date requests without dates away from inventory and withdrawals', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({
            notificationPage: 'InventoryPlanning',
            notifications: [{ type: 'ScheduledPlantingDateRequested', dates: ['2026-06-01'] }],
          }),
        ],
      });

      renderBanners({ plantingSeasonId: SEASON_ID });

      await waitFor(() =>
        expect(bannerTexts()).toEqual([strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED])
      );
    });
  });

  describe('grouping and ordering', () => {
    it('reports every notification for a season in one banner, in a fixed order', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({
            notifications: [
              { type: 'PlantingSeasonClosed' },
              { type: 'SeasonWithdrawalRecorded' },
              { type: 'SpeciesTargetsUpdated' },
              { type: 'ScheduledPlantingDateRequested' },
              { type: 'PlantingSeasonPastEndDate' },
              { type: 'AllocationQuantitiesUpdated' },
              { type: 'SpeciesTargetsAdded' },
            ],
          }),
        ],
      });

      renderBanners({ plantingSeasonId: SEASON_ID });

      // The order is the component's, not the server's: what the user needs to act on first comes
      // first, and the season's fate comes last.
      await waitFor(() =>
        expect(bannerTexts()).toEqual([
          [
            strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_ADDED_FOR_SEASON,
            strings.PLANTING_SEASON_NOTIFICATION_SPECIES_TARGETS_UPDATED_FOR_SEASON,
            strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED,
            strings.PLANTING_SEASON_NOTIFICATION_SCHEDULED_PLANTING_DATE_REQUESTED,
            strings.PLANTING_SEASON_NOTIFICATION_SEASON_WITHDRAWAL_RECORDED,
            strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_PAST_END_DATE,
            strings.PLANTING_SEASON_NOTIFICATION_PLANTING_SEASON_CLOSED,
          ].join(' '),
        ])
      );
    });

    it('gives each season its own banner', async () => {
      mockGet(NOTIFICATIONS_URL, {
        notifications: [
          buildGroup({ plantingSeasonName: 'Winter 2026' }),
          buildGroup({
            lastEventLogId: 200,
            plantingSeasonId: OTHER_SEASON_ID,
            plantingSeasonName: 'Summer 2026',
            plantingSiteName: 'Makai Site',
            notifications: [{ type: 'SeasonWithdrawalRecorded' }],
          }),
        ],
      });

      renderBanners();

      await waitFor(() => expect(closeButtons()).toHaveLength(2));
      expect(screen.getByRole('link', { name: 'Winter 2026' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Summer 2026' })).toBeInTheDocument();
    });
  });

  describe('page context', () => {
    it('names the site and links to the season when the page covers more than one season', async () => {
      mockGet(NOTIFICATIONS_URL, { notifications: [buildGroup()] });

      renderBanners();

      await waitFor(() =>
        expect(bannerTexts()).toEqual([
          `Mauka Site · Winter 2026 — ${strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED}`,
        ])
      );
      expect(screen.getByRole('link', { name: 'Winter 2026' })).toHaveAttribute(
        'href',
        `/plants/planting-seasons/${SEASON_ID}`
      );
    });

    it('leaves out the site and season on a page that is already about one season', async () => {
      mockGet(NOTIFICATIONS_URL, { notifications: [buildGroup()] });

      renderBanners({ plantingSeasonId: SEASON_ID });

      await waitFor(() =>
        expect(bannerTexts()).toEqual([strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED])
      );
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('dismissing', () => {
    /** The groups the notifications endpoint reports, so a dismissal can change what a refetch sees. */
    let groups: PlantingSeasonNotificationGroupPayload[];

    beforeEach(() => {
      groups = [buildGroup()];
      server.use(http.get(NOTIFICATIONS_URL, () => HttpResponse.json({ status: 'ok', notifications: groups })));
    });

    /**
     * Serve the dismiss endpoint the way the server does — drop the groups it was told to dismiss —
     * and record what was sent. One handler does both because `server.use` puts the newest handler
     * first, so a separate `captureRequests` for the same path would never be reached.
     */
    const serveDismissals = (): Record<string, unknown>[] => {
      const dismissals: Record<string, unknown>[] = [];

      server.use(
        http.post(DISMISS_URL, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          dismissals.push(body);
          groups = groups.filter((group) => group.plantingSeasonId !== body.plantingSeasonId);
          return HttpResponse.json({ status: 'ok' });
        })
      );

      return dismissals;
    };

    it('dismisses everything the season has reported on this page, and stops showing it', async () => {
      const dismissals = serveDismissals();

      const { user } = renderBanners();
      await waitFor(() => expect(closeButtons()).toHaveLength(1));

      await user.click(closeButtons()[0]);

      await waitFor(() => expect(dismissals).toHaveLength(1));
      expect(dismissals[0]).toEqual({
        lastEventLogId: 100,
        notificationPage: 'InventoryPlanning',
        plantingSeasonId: SEASON_ID,
      });
      // The banner only goes away once the refetch confirms the server dropped it.
      await waitFor(() => expect(closeButtons()).toHaveLength(0));
    });

    it('dismisses only the season whose banner was closed', async () => {
      groups = [
        buildGroup({ plantingSeasonName: 'Winter 2026' }),
        buildGroup({
          lastEventLogId: 200,
          plantingSeasonId: OTHER_SEASON_ID,
          plantingSeasonName: 'Summer 2026',
          notifications: [{ type: 'SeasonWithdrawalRecorded' }],
        }),
      ];
      const dismissals = serveDismissals();

      const { user } = renderBanners();
      await waitFor(() => expect(closeButtons()).toHaveLength(2));

      await user.click(closeButtons()[1]);

      await waitFor(() => expect(dismissals).toHaveLength(1));
      expect(dismissals[0]).toMatchObject({ lastEventLogId: 200, plantingSeasonId: OTHER_SEASON_ID });
      await waitFor(() => expect(closeButtons()).toHaveLength(1));
      expect(screen.getByRole('link', { name: 'Winter 2026' })).toBeInTheDocument();
    });

    it('keeps the banner and reports the failure when the dismissal fails', async () => {
      mockError('post', DISMISS_URL);

      const { user, store } = renderBanners();
      await waitFor(() => expect(closeButtons()).toHaveLength(1));

      await user.click(closeButtons()[0]);

      await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
      // The important half: hiding the banner would tell the user the notification was cleared when
      // the server still has it, and it would come back on the next poll.
      expect(bannerTexts()).toEqual([
        `Mauka Site · Winter 2026 — ${strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED}`,
      ]);
    });
  });

  describe('polling', () => {
    beforeEach(() => {
      rs.stubEnv('PUBLIC_DISABLE_RECURRENT_REQUESTS', undefined);
      rs.useFakeTimers({
        shouldAdvanceTime: true,
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
      });
    });

    afterEach(() => {
      rs.useRealTimers();
      rs.unstubAllEnvs();
    });

    it('raises a banner that appears while the page is open, without a reload', async () => {
      mockGet(NOTIFICATIONS_URL, { notifications: [] });

      renderBanners({ plantingSeasonId: SEASON_ID });
      await act(async () => {
        await rs.advanceTimersByTimeAsync(0);
      });
      expect(closeButtons()).toHaveLength(0);

      mockGet(NOTIFICATIONS_URL, { notifications: [buildGroup()] });
      await act(async () => {
        await rs.advanceTimersByTimeAsync(API_PULL_INTERVAL + 1000);
      });

      await waitFor(() =>
        expect(bannerTexts()).toEqual([strings.PLANTING_SEASON_NOTIFICATION_ALLOCATION_QUANTITIES_UPDATED])
      );
    });

    it('does not poll when recurrent requests are disabled', async () => {
      rs.stubEnv('PUBLIC_DISABLE_RECURRENT_REQUESTS', 'true');
      const requests = captureRequests('get', NOTIFICATIONS_URL, { notifications: [] });

      renderBanners({ plantingSeasonId: SEASON_ID });
      await waitFor(() => expect(requests).toHaveLength(1));

      await act(async () => {
        await rs.advanceTimersByTimeAsync(API_PULL_INTERVAL * 2);
      });

      expect(requests).toHaveLength(1);
    });
  });
});

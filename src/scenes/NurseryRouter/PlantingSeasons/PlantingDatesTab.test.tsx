import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { PlantingSeasonPayload, ScheduledDatePayload } from 'src/queries/generated/plantingSeasons';
import { PlantingDateRequestStatus } from 'src/queries/search/plantingDateRequests';
import PlantingDatesTab from 'src/scenes/NurseryRouter/PlantingSeasons/PlantingDatesTab';
import strings from 'src/strings';
import {
  buildPlantingSite,
  captureRequests,
  dialogTitled,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

const PLANTING_SEASON_ID = 1;
const SCHEDULED_PLANTING_DATE_ID = 11;
const SCHEDULED_DATE = '2026-06-08';
const FULFILL_PATH = `/api/v1/planting-seasons/${PLANTING_SEASON_ID}/scheduled-dates/${SCHEDULED_PLANTING_DATE_ID}/request/fulfill`;
/** Matches a fulfill call for any ids, so a call with the wrong ones is caught rather than unhandled. */
const FULFILL_ROUTE = '/api/v1/planting-seasons/:seasonId/scheduled-dates/:dateId/request/fulfill';

const confirmFulfilled = (dialog: HTMLElement) => within(dialog).getByRole('button', { name: strings.MARK_FULFILLED });

const buildPlantingSeason = (overrides: Partial<PlantingSeasonPayload> = {}): PlantingSeasonPayload => ({
  endDate: '2026-09-30',
  id: PLANTING_SEASON_ID,
  name: 'Winter',
  plantingSiteId: 1,
  speciesTargets: [],
  startDate: '2026-06-01',
  status: 'Active',
  ...overrides,
});

const buildScheduledDate = (overrides: Partial<ScheduledDatePayload> = {}): ScheduledDatePayload => ({
  date: SCHEDULED_DATE,
  scheduledPlantingDateId: SCHEDULED_PLANTING_DATE_ID,
  species: [{ allocatedQuantity: 100, quantity: 100, speciesId: 7, substratumId: 1 }],
  ...overrides,
});

/** The request status the search endpoint reports for each scheduled date. */
let requestStatuses: Record<string, PlantingDateRequestStatus>;

beforeEach(() => {
  requestStatuses = {};

  mockGet('/api/v1/species', { species: [{ id: 7, scientificName: 'Acacia koa' }] });
  mockGet(`/api/v1/planting-seasons/${PLANTING_SEASON_ID}/scheduled-dates`, {
    scheduledDates: [buildScheduledDate()],
  });
  mockGet(`/api/v1/planting-seasons/${PLANTING_SEASON_ID}/species-targets`, { targets: [] });
  mockPost('/api/v1/events/list', { events: [] });

  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      if (body.prefix !== 'plantingDateRequests') {
        return HttpResponse.json({ status: 'ok', results: [] });
      }
      return HttpResponse.json({
        status: 'ok',
        results: Object.entries(requestStatuses).map(([date, status]) => ({ date, 'status(raw)': status })),
      });
    })
  );
});

const renderTab = (plantingSeason: PlantingSeasonPayload = buildPlantingSeason()) =>
  renderWithProviders(<PlantingDatesTab plantingSeason={plantingSeason} plantingSite={buildPlantingSite()} />);

describe('PlantingDatesTab marking a planting date fulfilled', () => {
  it.each<PlantingDateRequestStatus>(['Pending', 'Partial'])(
    'offers Mark Fulfilled on a date whose request is %s',
    async (status) => {
      requestStatuses = { [SCHEDULED_DATE]: status };

      renderTab();

      expect(await screen.findByRole('button', { name: strings.MARK_FULFILLED })).toBeInTheDocument();
    }
  );

  it('does not offer Mark Fulfilled on a date the nursery was never asked for', async () => {
    renderTab();

    expect(await screen.findByText(strings.NOT_YET_REQUESTED)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.MARK_FULFILLED })).not.toBeInTheDocument();
  });

  it('does not offer Mark Fulfilled on a date that is already fulfilled', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Fulfilled' };

    renderTab();

    expect(await screen.findByText(strings.FULFILLED)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.MARK_FULFILLED })).not.toBeInTheDocument();
  });

  it('does not offer Mark Fulfilled once the planting season is closed', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Pending' };

    renderTab(buildPlantingSeason({ status: 'Closed' }));

    expect(await screen.findByText(strings.REQUESTED)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.MARK_FULFILLED })).not.toBeInTheDocument();
  });

  it('fulfills the request for the confirmed planting date', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Pending' };
    const fulfillRequests = captureRequests('post', FULFILL_ROUTE);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.MARK_FULFILLED }));
    await user.click(confirmFulfilled(dialogTitled(strings.MARK_PLANTING_DATE_FULFILLED)));

    await waitFor(() => expect(fulfillRequests).toHaveLength(1));
    expect(new URL(fulfillRequests[0].url).pathname).toBe(FULFILL_PATH);
  });

  it('closes the confirmation once the request is fulfilled', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Pending' };
    mockPost(FULFILL_ROUTE);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.MARK_FULFILLED }));
    await user.click(confirmFulfilled(dialogTitled(strings.MARK_PLANTING_DATE_FULFILLED)));

    await waitFor(() =>
      expect(screen.queryByText(strings.MARK_PLANTING_DATE_FULFILLED_CONFIRM)).not.toBeInTheDocument()
    );
  });

  it('keeps the confirmation open and says so when the date was already fulfilled', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Pending' };
    mockError('post', FULFILL_ROUTE, 409);

    const { user, store } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.MARK_FULFILLED }));
    await user.click(confirmFulfilled(dialogTitled(strings.MARK_PLANTING_DATE_FULFILLED)));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.PLANTING_DATE_ALREADY_FULFILLED,
        priority: 'critical',
      })
    );
    // Closing on failure would tell the user the date was fulfilled when the server refused.
    expect(screen.getByText(strings.MARK_PLANTING_DATE_FULFILLED_CONFIRM)).toBeInTheDocument();
  });

  it('sends nothing when the confirmation is cancelled', async () => {
    requestStatuses = { [SCHEDULED_DATE]: 'Pending' };
    const fulfillRequests = captureRequests('post', FULFILL_ROUTE);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.MARK_FULFILLED }));
    await user.click(
      within(dialogTitled(strings.MARK_PLANTING_DATE_FULFILLED)).getByRole('button', { name: strings.CANCEL })
    );

    await waitFor(() => expect(screen.queryByText(strings.MARK_PLANTING_DATE_FULFILLED)).not.toBeInTheDocument());
    expect(fulfillRequests).toHaveLength(0);
  });
});

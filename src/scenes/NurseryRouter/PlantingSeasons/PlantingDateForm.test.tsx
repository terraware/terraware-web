import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import {
  PlantingSeasonPayload,
  ScheduledDatePayload,
  SpeciesTargetPayload,
} from 'src/queries/generated/plantingSeasons';
import PlantingDatesTab from 'src/scenes/NurseryRouter/PlantingSeasons/PlantingDatesTab';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildSpecies,
  buildStratum,
  buildSubstratum,
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
const NEW_DATE = '2026-06-15';
const SCHEDULED_DATES_PATH = `/api/v1/planting-seasons/${PLANTING_SEASON_ID}/scheduled-dates`;
/** Matches a write for any ids, so a call with the wrong ones is caught rather than unhandled. */
const SCHEDULED_DATE_ROUTE = '/api/v1/planting-seasons/:seasonId/scheduled-dates/:dateId';

const KOA_ID = 7;
const OHIA_ID = 8;
const KOA = 'Acacia koa';
const OHIA = 'Metrosideros polymorpha';

const SUBSTRATUM_A1_ID = 1;
const SUBSTRATUM_A2_ID = 2;

/** The date picker has no label or accessible name; its format placeholder is the only handle. */
const DATE_PLACEHOLDER = 'YYYY-MM-DD';

const plantingSite = buildPlantingSite({
  strata: [
    buildStratum({
      id: 1,
      name: 'Stratum A',
      substrata: [
        buildSubstratum({ id: SUBSTRATUM_A1_ID, name: 'A-1' }),
        buildSubstratum({ id: SUBSTRATUM_A2_ID, name: 'A-2' }),
      ],
    }),
  ],
});

const buildPlantingSeason = (overrides: Partial<PlantingSeasonPayload> = {}): PlantingSeasonPayload => ({
  endDate: '2026-09-30',
  id: PLANTING_SEASON_ID,
  name: 'Winter',
  plantingSiteId: plantingSite.id,
  speciesTargets: [],
  startDate: '2026-06-01',
  status: 'Active',
  ...overrides,
});

const buildScheduledDate = (overrides: Partial<ScheduledDatePayload> = {}): ScheduledDatePayload => ({
  date: SCHEDULED_DATE,
  scheduledPlantingDateId: SCHEDULED_PLANTING_DATE_ID,
  species: [{ allocatedQuantity: 500, quantity: 100, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }],
  ...overrides,
});

/** Dates the season already has scheduled, as the list endpoint reports them. */
let scheduledDates: ScheduledDatePayload[];
/** The species targets the season sets per substratum. */
let speciesTargets: SpeciesTargetPayload[];
/** How many plants of each species the nursery has allocated to the season. */
let allocatedBySpecies: Record<number, number>;
/** Plants already withdrawn against a scheduled date, keyed by date. */
let withdrawnByDate: Record<string, number>;

beforeEach(() => {
  scheduledDates = [];
  speciesTargets = [];
  allocatedBySpecies = { [KOA_ID]: 500, [OHIA_ID]: 300 };
  withdrawnByDate = {};

  mockGet('/api/v1/species', {
    species: [
      buildSpecies({ id: KOA_ID, scientificName: KOA, commonName: 'Koa' }),
      buildSpecies({ id: OHIA_ID, scientificName: OHIA, commonName: 'ʻŌhiʻa lehua' }),
    ],
  });
  mockPost('/api/v1/events/list', { events: [] });

  server.use(
    http.get(SCHEDULED_DATES_PATH, () => HttpResponse.json({ status: 'ok', scheduledDates })),
    http.get(`/api/v1/planting-seasons/${PLANTING_SEASON_ID}/species-targets`, () =>
      HttpResponse.json({ status: 'ok', targets: speciesTargets })
    ),
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as Record<string, any>;
      if (body.prefix === 'plantingSeasons') {
        return HttpResponse.json({
          status: 'ok',
          results: [
            {
              id: `${PLANTING_SEASON_ID}`,
              name: 'Winter',
              allocatedSpecies: Object.entries(allocatedBySpecies).map(([speciesId, quantity]) => ({
                species_id: speciesId,
                'quantity(raw)': `${quantity}`,
              })),
            },
          ],
        });
      }
      if (body.prefix === 'plantingDateRequests') {
        return HttpResponse.json({
          status: 'ok',
          results: Object.entries(withdrawnByDate).map(([date, quantity]) => ({
            date,
            'status(raw)': 'Pending',
            withdrawals: [
              {
                batchWithdrawals_batch_species_id: `${KOA_ID}`,
                'batchWithdrawals_readyQuantityWithdrawn(raw)': `${quantity}`,
              },
            ],
          })),
        });
      }
      return HttpResponse.json({ status: 'ok', results: [] });
    })
  );
});

const renderTab = (plantingSeason: PlantingSeasonPayload = buildPlantingSeason()) =>
  renderWithProviders(<PlantingDatesTab plantingSeason={plantingSeason} plantingSite={plantingSite} />);

const plantingDateField = () => screen.getByPlaceholderText(DATE_PLACEHOLDER);

/**
 * The substratum's block of the form, named by the visible substratum name. Scoping matters once
 * two substrata are open, because each one renders its own species table.
 */
const substratumSection = (name: string): HTMLElement =>
  screen.getByText(name).parentElement?.parentElement as HTMLElement;

const substratumCheckbox = (name: string): HTMLElement =>
  within(screen.getByText(name).parentElement as HTMLElement).getByRole('checkbox');

/**
 * Quantity fields carry an id but no label or accessible name, so there is nothing to query them
 * by. Labelling the inputs would let these drop in favor of `getByLabelText`.
 */
const newSpeciesQuantityField = (substratumId: number): HTMLElement =>
  document.querySelector(`#add-quantity-${substratumId} input`) as HTMLElement;

const existingSpeciesQuantityField = (substratumId: number, speciesId: number): HTMLElement =>
  document.querySelector(`#quantity-${substratumId}-${speciesId} input`) as HTMLElement;

/** The table row for a species already on the date, found by its scientific name. */
const speciesRow = (scientificName: string): HTMLElement =>
  screen.getByText(scientificName).parentElement?.parentElement as HTMLElement;

/**
 * The pencil that turns a species row's quantity into an input. It renders an icon with no label,
 * so the only handle on it is its position as the row's first button.
 */
const editQuantity = async (user: UserEvent, scientificName: string): Promise<void> => {
  await user.click(within(speciesRow(scientificName)).getAllByRole('button')[0]);
};

/**
 * The Save & Request dialog. `dialogTitled` can't find it by its title, because the page behind it
 * also says "Save & Request".
 */
const nurseryRequestDialog = (): HTMLElement =>
  screen.getByText(strings.NOTE_FOR_NURSERY).closest('.dialog-box') as HTMLElement;

/** The note textarea, which has no id for its label to point at. */
const nurseryNoteField = (): HTMLElement => within(nurseryRequestDialog()).getByRole('textbox');

const addSpecies = async (user: UserEvent, substratumName: string, scientificName: string): Promise<void> => {
  const section = substratumSection(substratumName);
  await user.click(within(section).getByRole('button', { name: strings.ADD_SPECIES }));
  await user.click(within(section).getByPlaceholderText(strings.SELECT_SPECIES));
  await user.click(await screen.findByRole('option', { name: scientificName }));
};

/** On an open blank form: picks a date and schedules `quantity` plants of one species in A-1. */
const fillNewDate = async (user: UserEvent, quantity: string): Promise<void> => {
  await user.type(plantingDateField(), NEW_DATE);
  await user.click(substratumCheckbox('A-1'));
  await addSpecies(user, 'A-1', KOA);
  await user.type(newSpeciesQuantityField(SUBSTRATUM_A1_ID), quantity);
};

describe('PlantingDateForm opening the form', () => {
  it('opens a blank form from the empty state', async () => {
    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));

    expect(plantingDateField()).toHaveValue('');
    expect(screen.getByText('A-1')).toBeInTheDocument();
    expect(screen.queryByText(strings.NO_PLANTING_DATES_SCHEDULED)).not.toBeInTheDocument();
  });

  it('opens an existing date with its date, substrata and quantities', async () => {
    scheduledDates = [buildScheduledDate()];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));

    expect(plantingDateField()).toHaveValue(SCHEDULED_DATE);
    expect(substratumCheckbox('A-1')).toBeChecked();
    expect(substratumCheckbox('A-2')).not.toBeChecked();
    expect(screen.getByText(KOA)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('offers no way to add or edit a date once the season is closed', async () => {
    scheduledDates = [buildScheduledDate()];

    renderTab(buildPlantingSeason({ status: 'Closed' }));

    expect(
      await screen.findByText(strings.formatString(strings.X_SPECIES_Y_PLANTS, 1, 100).toString())
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.ADD_DATE })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
  });

  it('starts a substratum off with the species the season targets there', async () => {
    speciesTargets = [
      { quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 200, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A2_ID },
    ];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await user.click(substratumCheckbox('A-1'));

    expect(await screen.findByText(KOA)).toBeInTheDocument();
    expect(screen.queryByText(OHIA)).not.toBeInTheDocument();
  });
});

describe('PlantingDateForm quantity limits', () => {
  it('counts down the plants available to schedule as a quantity is entered', async () => {
    // 500 allocated to the season, 100 of them already scheduled on another date.
    scheduledDates = [buildScheduledDate({ date: '2026-07-01', scheduledPlantingDateId: 12 })];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_DATE }));
    await user.click(substratumCheckbox('A-1'));
    await addSpecies(user, 'A-1', KOA);

    expect(await screen.findByText('400')).toBeInTheDocument();

    await user.type(newSpeciesQuantityField(SUBSTRATUM_A1_ID), '150');

    expect(await screen.findByText('250')).toBeInTheDocument();
  });

  it('warns when more plants are scheduled than the nursery has available', async () => {
    scheduledDates = [buildScheduledDate({ date: '2026-07-01', scheduledPlantingDateId: 12 })];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_DATE }));
    await user.click(substratumCheckbox('A-1'));
    await addSpecies(user, 'A-1', KOA);
    await user.type(newSpeciesQuantityField(SUBSTRATUM_A1_ID), '450');

    expect(
      await screen.findByText(strings.formatString(strings.EXCEEDS_AVAILABLE_X, 400).toString())
    ).toBeInTheDocument();
  });

  it('warns when a species is given no plants at all', async () => {
    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await user.click(substratumCheckbox('A-1'));
    await addSpecies(user, 'A-1', KOA);
    await user.type(newSpeciesQuantityField(SUBSTRATUM_A1_ID), '0');

    expect(await screen.findByText(strings.QUANTITY_MUST_BE_GREATER_THAN_ZERO)).toBeInTheDocument();
  });

  it('counts down the substratum target as a quantity is entered', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];
    // 100 of the 300 targeted for this substratum are already scheduled on another date.
    scheduledDates = [buildScheduledDate({ date: '2026-07-01', scheduledPlantingDateId: 12 })];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_DATE }));
    await user.click(substratumCheckbox('A-1'));

    expect(await screen.findByText('200')).toBeInTheDocument();

    await editQuantity(user, KOA);
    await user.type(existingSpeciesQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '50');

    expect(await screen.findByText('150')).toBeInTheDocument();
  });
});

describe('PlantingDateForm saving a new date', () => {
  it('schedules the date with the species and quantities entered', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH, {
      scheduledDate: buildScheduledDate({ date: NEW_DATE }),
    });

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      date: NEW_DATE,
      species: [{ quantity: 25, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }],
    });
  });

  it('leaves out the plants of a substratum that was unchecked again', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH, {
      scheduledDate: buildScheduledDate({ date: NEW_DATE }),
    });

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(substratumCheckbox('A-2'));
    await addSpecies(user, 'A-2', OHIA);
    await user.type(newSpeciesQuantityField(SUBSTRATUM_A2_ID), '40');
    await user.click(substratumCheckbox('A-2'));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      species: [{ quantity: 25, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }],
    });
  });

  it('leaves out a species row that was removed', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH, {
      scheduledDate: buildScheduledDate({ date: NEW_DATE }),
    });

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(within(substratumSection('A-1')).getByRole('button', { name: strings.REMOVE }));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({ species: [] });
  });

  it('asks for a date before sending anything', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await user.click(substratumCheckbox('A-1'));
    await addSpecies(user, 'A-1', KOA);
    await user.type(newSpeciesQuantityField(SUBSTRATUM_A1_ID), '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('refuses a date the season already has scheduled', async () => {
    scheduledDates = [buildScheduledDate()];
    const requests = captureRequests('post', SCHEDULED_DATES_PATH);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_DATE }));
    await user.type(plantingDateField(), SCHEDULED_DATE);

    expect(await screen.findByText(strings.PLANTING_DATE_ALREADY_SCHEDULED)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
    expect(requests).toHaveLength(0);
  });

  it('warns rather than saving when a species has no quantity', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];
    const requests = captureRequests('post', SCHEDULED_DATES_PATH);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await user.type(plantingDateField(), NEW_DATE);
    await user.click(substratumCheckbox('A-1'));
    await screen.findByText(KOA);
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    expect(await screen.findByText(strings.PLANTING_DATE_QUANTITY_NOT_SET_WARNING)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('sends nothing when the form is cancelled', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(await screen.findByText(strings.NO_PLANTING_DATES_SCHEDULED)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });
});

describe('PlantingDateForm requesting the plants from the nursery', () => {
  it('sends the request and the note along with the date', async () => {
    const requests = captureRequests('post', SCHEDULED_DATES_PATH, {
      scheduledDate: buildScheduledDate({ date: NEW_DATE }),
    });

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE_AND_REQUEST }));

    await user.type(nurseryNoteField(), 'Ready at dawn');
    await user.click(within(nurseryRequestDialog()).getByRole('button', { name: strings.SAVE_AND_REQUEST }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toEqual({
      createNurseryRequest: true,
      date: NEW_DATE,
      nurseryRequestNotes: 'Ready at dawn',
      species: [{ quantity: 25, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }],
    });
  });

  it('cannot be requested until some plants are scheduled', async () => {
    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await user.type(plantingDateField(), NEW_DATE);

    expect(screen.getByRole('button', { name: strings.SAVE_AND_REQUEST })).toBeDisabled();
  });
});

describe('PlantingDateForm editing an existing date', () => {
  it('updates the date being edited', async () => {
    scheduledDates = [buildScheduledDate()];
    const requests = captureRequests('put', SCHEDULED_DATE_ROUTE, { scheduledDate: buildScheduledDate() });

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));
    await editQuantity(user, KOA);
    await user.clear(existingSpeciesQuantityField(SUBSTRATUM_A1_ID, KOA_ID));
    await user.type(existingSpeciesQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(new URL(requests[0].url).pathname).toBe(`${SCHEDULED_DATES_PATH}/${SCHEDULED_PLANTING_DATE_ID}`);
    expect(await requests[0].json()).toEqual({
      date: SCHEDULED_DATE,
      species: [{ quantity: 250, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }],
    });
  });

  it('does not treat the date being edited as already scheduled', async () => {
    scheduledDates = [buildScheduledDate()];

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));

    expect(screen.queryByText(strings.PLANTING_DATE_ALREADY_SCHEDULED)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled();
  });

  it('deletes the date once the deletion is confirmed', async () => {
    scheduledDates = [buildScheduledDate()];
    const requests = captureRequests('delete', SCHEDULED_DATE_ROUTE);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));
    await user.click(screen.getByRole('button', { name: strings.DELETE }));
    await user.click(within(dialogTitled(strings.DELETE_PLANTING_DATE)).getByRole('button', { name: strings.DELETE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(new URL(requests[0].url).pathname).toBe(`${SCHEDULED_DATES_PATH}/${SCHEDULED_PLANTING_DATE_ID}`);
  });

  it('says so before deleting a date plants have already been withdrawn against', async () => {
    scheduledDates = [buildScheduledDate()];
    withdrawnByDate = { [SCHEDULED_DATE]: 40 };

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));
    await user.click(screen.getByRole('button', { name: strings.DELETE }));

    expect(await screen.findByText(new RegExp(strings.DELETE_PLANTING_DATE_WITHDRAWALS_RECORDED))).toBeInTheDocument();
  });

  it('sends nothing when the deletion is cancelled', async () => {
    scheduledDates = [buildScheduledDate()];
    const requests = captureRequests('delete', SCHEDULED_DATE_ROUTE);

    const { user } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.EDIT }));
    await user.click(screen.getByRole('button', { name: strings.DELETE }));
    await user.click(within(dialogTitled(strings.DELETE_PLANTING_DATE)).getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.ARE_YOU_SURE_DELETE_PLANTING_DATE)).not.toBeInTheDocument());
    expect(requests).toHaveLength(0);
  });
});

describe('PlantingDateForm when the server refuses the save', () => {
  it('keeps the form open and says the date is taken when the server rejects it', async () => {
    mockError('post', SCHEDULED_DATES_PATH, 409);

    const { user, store } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.PLANTING_DATE_ALREADY_SCHEDULED,
        priority: 'critical',
      })
    );
    // Closing on failure would leave the user thinking the date had been scheduled.
    expect(plantingDateField()).toHaveValue(NEW_DATE);
  });

  it('keeps the form open when the save fails outright', async () => {
    mockError('post', SCHEDULED_DATES_PATH);

    const { user, store } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    expect(plantingDateField()).toHaveValue(NEW_DATE);
  });

  it('keeps the nursery request open when the save fails', async () => {
    mockError('post', SCHEDULED_DATES_PATH);

    const { user, store } = renderTab();

    await user.click(await screen.findByRole('button', { name: strings.ADD_PLANTING_DATE }));
    await fillNewDate(user, '25');
    await user.click(screen.getByRole('button', { name: strings.SAVE_AND_REQUEST }));
    await user.click(within(nurseryRequestDialog()).getByRole('button', { name: strings.SAVE_AND_REQUEST }));

    await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));
    expect(nurseryNoteField()).toBeInTheDocument();
  });
});

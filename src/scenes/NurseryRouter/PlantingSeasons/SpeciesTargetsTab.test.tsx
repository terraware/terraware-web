import React from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import { PlantingSeasonPayload, SpeciesTargetPayload } from 'src/queries/generated/plantingSeasons';
import SpeciesTargetsTab from 'src/scenes/NurseryRouter/PlantingSeasons/SpeciesTargetsTab';
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
  mockPut,
  renderWithProviders,
  server,
} from 'src/test-utils';

const PLANTING_SEASON_ID = 1;
const SPECIES_TARGETS_PATH = `/api/v1/planting-seasons/${PLANTING_SEASON_ID}/species-targets`;
/** Matches a write for any season id, so a call against the wrong one is caught rather than unhandled. */
const SPECIES_TARGETS_ROUTE = '/api/v1/planting-seasons/:seasonId/species-targets';

const KOA_ID = 7;
const OHIA_ID = 8;
const KOKIA_ID = 9;
const KOA = 'Acacia koa';
const OHIA = 'Metrosideros polymorpha';
const KOKIA = 'Kokia drynarioides';

const SUBSTRATUM_A1_ID = 1;
const SUBSTRATUM_A2_ID = 2;
const SUBSTRATUM_B1_ID = 3;

/** How long "Just saved" stays up after a target is written, per `justSavedDurationMs`. */
const JUST_SAVED_DURATION_MS = 3000;

/** Two strata so the test can tell a stratum total apart from the substratum totals under it. */
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
    buildStratum({ id: 2, name: 'Stratum B', substrata: [buildSubstratum({ id: SUBSTRATUM_B1_ID, name: 'B-1' })] }),
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

/** The targets the season has set, as the list endpoint reports them. */
let speciesTargets: SpeciesTargetPayload[];

beforeAll(() => {
  // jsdom implements no scrollIntoView, and the add-species row scrolls itself into view whenever
  // anything inside it takes focus, so every interaction with it would throw without this.
  Element.prototype.scrollIntoView = () => undefined;
});

afterAll(() => {
  delete (Element.prototype as Partial<Element>).scrollIntoView;
});

beforeEach(() => {
  speciesTargets = [];

  mockGet('/api/v1/species', {
    species: [
      buildSpecies({ id: KOA_ID, scientificName: KOA, commonName: 'Koa' }),
      buildSpecies({ id: OHIA_ID, scientificName: OHIA, commonName: 'ʻŌhiʻa lehua' }),
      buildSpecies({ id: KOKIA_ID, scientificName: KOKIA, commonName: 'Hawaii tree cotton' }),
    ],
  });
  // The tab renders the season's event log, which renders nothing when there is no history.
  mockPost('/api/v1/events/list', { events: [] });

  server.use(http.get(SPECIES_TARGETS_PATH, () => HttpResponse.json({ status: 'ok', targets: speciesTargets })));
});

const renderTab = (plantingSeason: PlantingSeasonPayload = buildPlantingSeason()) =>
  renderWithProviders(<SpeciesTargetsTab plantingSeason={plantingSeason} plantingSite={plantingSite} />);

/**
 * A stratum's header bar, named by the visible stratum name. It carries the stratum total and the
 * save status, and scoping to it keeps a stratum total apart from the substratum total below it.
 */
const stratumHeader = (name: string): HTMLElement => screen.getByText(name).parentElement as HTMLElement;

/**
 * A substratum's block, named by the visible substratum name. Scoping matters because every
 * substratum renders its own species table and its own "Add Species" button.
 */
const substratumSection = (name: string): HTMLElement =>
  screen.getByText(name).parentElement?.parentElement as HTMLElement;

/** The row for a species already targeted in a substratum, found by its scientific name. */
const speciesRow = (substratumName: string, scientificName: string): HTMLElement =>
  within(substratumSection(substratumName)).getByText(scientificName).parentElement?.parentElement as HTMLElement;

/**
 * The pencil and the trash can on a species row render icons with no label, so position within the
 * row is the only handle on them. Giving them accessible names would let these drop in favor of
 * `getByRole('button', { name })`.
 */
const editTarget = async (user: UserEvent, substratumName: string, scientificName: string): Promise<void> => {
  await user.click(within(speciesRow(substratumName, scientificName)).getAllByRole('button')[0]);
};

const deleteTarget = async (user: UserEvent, substratumName: string, scientificName: string): Promise<void> => {
  const buttons = within(speciesRow(substratumName, scientificName)).getAllByRole('button');
  await user.click(buttons[buttons.length - 1]);
};

/**
 * Quantity fields carry an id but no usable label — `Textfield` points its `<label for>` at the
 * wrapper div rather than the input — so there is nothing to query them by.
 */
const targetQuantityField = (substratumId: number, speciesId: number): HTMLElement =>
  document.querySelector(`#target-${substratumId}-${speciesId} input`) as HTMLElement;

const newTargetQuantityField = (substratumId: number): HTMLElement =>
  document.querySelector(`#add-quantity-${substratumId} input`) as HTMLElement;

/** Opens the add row in a substratum and picks a species, which reveals the quantity field. */
const startAddingSpecies = async (user: UserEvent, substratumName: string, scientificName: string): Promise<void> => {
  const section = substratumSection(substratumName);
  const addButton = within(section).getByRole('button', { name: strings.ADD_SPECIES });
  // Nothing can be added until the organization's species have arrived.
  await waitFor(() => expect(addButton).toBeEnabled());
  await user.click(addButton);
  await user.click(within(section).getByPlaceholderText(strings.SELECT_SPECIES));
  await user.click(await screen.findByRole('option', { name: scientificName }));
};

/** Replaces whatever a quantity field holds and commits it, the way Enter commits an edit. */
const enterQuantity = async (user: UserEvent, field: HTMLElement, quantity: string): Promise<void> => {
  await user.clear(field);
  await user.type(field, `${quantity}{Enter}`);
};

describe('SpeciesTargetsTab showing the targets', () => {
  it('lists the species targeted in each substratum with their quantities', async () => {
    speciesTargets = [
      { quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 200, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A2_ID },
    ];

    renderTab();

    expect(await within(substratumSection('A-1')).findByText(KOA)).toBeInTheDocument();
    expect(within(substratumSection('A-1')).getByText('300')).toBeInTheDocument();
    expect(within(substratumSection('A-2')).getByText(OHIA)).toBeInTheDocument();
    expect(within(substratumSection('A-2')).getByText('200')).toBeInTheDocument();
    // A species targeted in one substratum is not shown under another.
    expect(within(substratumSection('A-2')).queryByText(KOA)).not.toBeInTheDocument();
  });

  it('sorts the species in a substratum by scientific name', async () => {
    speciesTargets = [
      { quantity: 100, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 100, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 100, speciesId: KOKIA_ID, substratumId: SUBSTRATUM_A1_ID },
    ];

    renderTab();

    await screen.findByText(KOA);
    const names = within(substratumSection('A-1'))
      .getAllByText(new RegExp(`^(${KOA}|${KOKIA}|${OHIA})$`))
      .map((element) => element.textContent);
    expect(names).toEqual([KOA, KOKIA, OHIA]);
  });

  it('totals the targeted plants for each substratum and for the stratum as a whole', async () => {
    speciesTargets = [
      { quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 200, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A2_ID },
    ];

    renderTab();

    expect(await within(stratumHeader('Stratum A')).findByText(`500 ${strings.TARGET_PLANTS}`)).toBeInTheDocument();
    expect(within(substratumSection('A-1')).getByText(`300 ${strings.TARGET_PLANTS}`)).toBeInTheDocument();
    expect(within(substratumSection('A-2')).getByText(`200 ${strings.TARGET_PLANTS}`)).toBeInTheDocument();
    // A stratum with nothing targeted shows no total at all rather than a zero.
    expect(within(stratumHeader('Stratum B')).queryByText(`0 ${strings.TARGET_PLANTS}`)).not.toBeInTheDocument();
  });

  it('says when a substratum has no targets yet', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];

    renderTab();

    await screen.findByText(KOA);
    expect(within(substratumSection('B-1')).getByText(strings.NO_SPECIES_TARGETS_FOR_SUBSTRATUM)).toBeInTheDocument();
    expect(within(substratumSection('A-1')).queryByText(strings.NO_SPECIES_TARGETS_FOR_SUBSTRATUM)).toBeNull();
  });
});

describe('SpeciesTargetsTab adding a species target', () => {
  it('sends the species, substratum and quantity that were entered', async () => {
    const requests = captureRequests('put', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await startAddingSpecies(user, 'A-1', KOA);
    await enterQuantity(user, newTargetQuantityField(SUBSTRATUM_A1_ID), '120');

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(new URL(requests[0].url).pathname).toBe(SPECIES_TARGETS_PATH);
    expect(await requests[0].json()).toEqual({
      quantity: 120,
      speciesId: KOA_ID,
      substratumId: SUBSTRATUM_A1_ID,
    });
  });

  it('shows the new target once it is saved, and closes the add row', async () => {
    server.use(
      http.put(SPECIES_TARGETS_ROUTE, async ({ request }) => {
        speciesTargets = [...speciesTargets, (await request.json()) as SpeciesTargetPayload];
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user } = renderTab();

    await startAddingSpecies(user, 'A-1', KOA);
    await enterQuantity(user, newTargetQuantityField(SUBSTRATUM_A1_ID), '120');

    expect(await within(substratumSection('A-1')).findByText('120')).toBeInTheDocument();
    expect(within(substratumSection('A-1')).queryByPlaceholderText(strings.SELECT_SPECIES)).toBeNull();
  });

  it('offers only the species that are not already targeted in the substratum, in name order', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    const section = substratumSection('A-1');
    await user.click(within(section).getByRole('button', { name: strings.ADD_SPECIES }));
    await user.click(within(section).getByPlaceholderText(strings.SELECT_SPECIES));

    const options = (await screen.findAllByRole('option')).map((option) => option.textContent);
    expect(options).toEqual([KOKIA, OHIA]);
  });

  it('offers no way to add a species once every species is targeted there', async () => {
    speciesTargets = [
      { quantity: 1, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 1, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 1, speciesId: KOKIA_ID, substratumId: SUBSTRATUM_A1_ID },
    ];

    renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    expect(within(substratumSection('A-1')).getByRole('button', { name: strings.ADD_SPECIES })).toBeDisabled();
    expect(within(substratumSection('A-2')).getByRole('button', { name: strings.ADD_SPECIES })).toBeEnabled();
  });

  it('sends nothing when the add row is discarded', async () => {
    const requests = captureRequests('put', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await startAddingSpecies(user, 'A-1', KOA);
    await user.clear(newTargetQuantityField(SUBSTRATUM_A1_ID));
    await user.type(newTargetQuantityField(SUBSTRATUM_A1_ID), '120');

    // The trash can is the last button in the add row, after the dropdown's popup toggle.
    const addRowButtons = within(substratumSection('A-1')).getAllByRole('button');
    await user.click(addRowButtons[addRowButtons.length - 1]);

    expect(within(substratumSection('A-1')).queryByPlaceholderText(strings.SELECT_SPECIES)).toBeNull();
    expect(requests).toHaveLength(0);
  });

  it('tells the user and keeps the row open when the save fails', async () => {
    mockError('put', SPECIES_TARGETS_ROUTE);

    const { user, store } = renderTab();

    await startAddingSpecies(user, 'A-1', KOA);
    await enterQuantity(user, newTargetQuantityField(SUBSTRATUM_A1_ID), '120');

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Closing the row would leave the user thinking the target had been set.
    expect(within(substratumSection('A-1')).getByPlaceholderText(strings.SELECT_SPECIES)).toBeInTheDocument();
  });
});

describe('SpeciesTargetsTab editing a target quantity', () => {
  beforeEach(() => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];
  });

  it('sends the edited quantity for the species and substratum', async () => {
    const requests = captureRequests('put', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await editTarget(user, 'A-1', KOA);
    await enterQuantity(user, targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(new URL(requests[0].url).pathname).toBe(SPECIES_TARGETS_PATH);
    expect(await requests[0].json()).toEqual({
      quantity: 250,
      speciesId: KOA_ID,
      substratumId: SUBSTRATUM_A1_ID,
    });
  });

  it('shows the saved quantity and the new totals once the server has it', async () => {
    server.use(
      http.put(SPECIES_TARGETS_ROUTE, async ({ request }) => {
        speciesTargets = [(await request.json()) as SpeciesTargetPayload];
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await editTarget(user, 'A-1', KOA);
    await enterQuantity(user, targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');

    expect(await within(substratumSection('A-1')).findByText('250')).toBeInTheDocument();
    expect(await within(stratumHeader('Stratum A')).findByText(`250 ${strings.TARGET_PLANTS}`)).toBeInTheDocument();
  });

  it('sends nothing when the quantity is left unchanged', async () => {
    const requests = captureRequests('put', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await editTarget(user, 'A-1', KOA);
    await user.type(targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '{Enter}');

    expect(await within(substratumSection('A-1')).findByText('300')).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('tells the user and puts the old quantity back when the save fails', async () => {
    mockError('put', SPECIES_TARGETS_ROUTE);

    const { user, store } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await editTarget(user, 'A-1', KOA);
    await enterQuantity(user, targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Leaving 250 on screen would claim a target the season does not have.
    expect(await within(substratumSection('A-1')).findByText('300')).toBeInTheDocument();
    expect(within(substratumSection('A-1')).queryByText('250')).toBeNull();
  });
});

describe('SpeciesTargetsTab save status', () => {
  beforeEach(() => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];
  });

  it('says it is saving while the write is in flight, then says it just saved', async () => {
    let releaseSave = () => undefined as void;
    const saveCompleted = new Promise<void>((resolve) => {
      releaseSave = () => resolve();
    });
    server.use(
      http.put(SPECIES_TARGETS_ROUTE, async () => {
        await saveCompleted;
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await editTarget(user, 'A-1', KOA);
    await enterQuantity(user, targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');

    expect(await within(stratumHeader('Stratum A')).findByText(strings.SAVING)).toBeInTheDocument();

    releaseSave();

    expect(await within(stratumHeader('Stratum A')).findByText(strings.JUST_SAVED)).toBeInTheDocument();
    expect(within(stratumHeader('Stratum A')).queryByText(strings.SAVING)).toBeNull();
  });

  describe('once the "just saved" window has passed', () => {
    beforeEach(() => {
      mockPut(SPECIES_TARGETS_ROUTE);
      // Only the "just saved" countdown is under the test's control; everything else runs in real
      // time so Testing Library can keep polling while the clock is faked.
      rs.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout'] });
    });

    afterEach(() => {
      rs.useRealTimers();
    });

    it('stops saying it just saved', async () => {
      const { user } = renderTab();

      await within(substratumSection('A-1')).findByText(KOA);
      await editTarget(user, 'A-1', KOA);
      await enterQuantity(user, targetQuantityField(SUBSTRATUM_A1_ID, KOA_ID), '250');

      expect(await within(stratumHeader('Stratum A')).findByText(strings.JUST_SAVED)).toBeInTheDocument();

      await act(async () => {
        await rs.advanceTimersByTimeAsync(JUST_SAVED_DURATION_MS + 1);
      });

      expect(within(stratumHeader('Stratum A')).queryByText(strings.JUST_SAVED)).toBeNull();
    });
  });
});

describe('SpeciesTargetsTab deleting a target', () => {
  beforeEach(() => {
    speciesTargets = [
      { quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID },
      { quantity: 200, speciesId: OHIA_ID, substratumId: SUBSTRATUM_A1_ID },
    ];
  });

  it('asks for confirmation, naming the species, before deleting anything', async () => {
    const requests = captureRequests('delete', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await deleteTarget(user, 'A-1', KOA);

    const dialog = dialogTitled(strings.DELETE_SPECIES_TARGET);
    expect(within(dialog).getByText(KOA)).toBeInTheDocument();
    expect(within(dialog).getByText(strings.ARE_YOU_SURE_DELETE_TARGET)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('deletes the target for that species and substratum once confirmed', async () => {
    const requests = captureRequests('delete', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await deleteTarget(user, 'A-1', KOA);
    await user.click(within(dialogTitled(strings.DELETE_SPECIES_TARGET)).getByRole('button', { name: strings.DELETE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    const url = new URL(requests[0].url);
    expect(url.pathname).toBe(SPECIES_TARGETS_PATH);
    expect(url.searchParams.get('speciesId')).toBe(`${KOA_ID}`);
    expect(url.searchParams.get('substratumId')).toBe(`${SUBSTRATUM_A1_ID}`);
  });

  it('drops the target from the substratum once the server has deleted it', async () => {
    server.use(
      http.delete(SPECIES_TARGETS_ROUTE, ({ request }) => {
        const speciesId = Number(new URL(request.url).searchParams.get('speciesId'));
        speciesTargets = speciesTargets.filter((target) => target.speciesId !== speciesId);
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await deleteTarget(user, 'A-1', KOA);
    await user.click(within(dialogTitled(strings.DELETE_SPECIES_TARGET)).getByRole('button', { name: strings.DELETE }));

    await waitFor(() => expect(within(substratumSection('A-1')).queryByText(KOA)).toBeNull());
    expect(within(substratumSection('A-1')).getByText(OHIA)).toBeInTheDocument();
  });

  it('sends nothing when the deletion is cancelled', async () => {
    const requests = captureRequests('delete', SPECIES_TARGETS_ROUTE);

    const { user } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await deleteTarget(user, 'A-1', KOA);
    await user.click(within(dialogTitled(strings.DELETE_SPECIES_TARGET)).getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.ARE_YOU_SURE_DELETE_TARGET)).toBeNull());
    expect(within(substratumSection('A-1')).getByText(KOA)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('keeps the confirmation open and tells the user when the delete fails', async () => {
    mockError('delete', SPECIES_TARGETS_ROUTE);

    const { user, store } = renderTab();

    await within(substratumSection('A-1')).findByText(KOA);
    await deleteTarget(user, 'A-1', KOA);
    await user.click(within(dialogTitled(strings.DELETE_SPECIES_TARGET)).getByRole('button', { name: strings.DELETE }));

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Closing the dialog would leave the user thinking the target had been removed.
    expect(screen.getByText(strings.ARE_YOU_SURE_DELETE_TARGET)).toBeInTheDocument();
  });
});

describe('SpeciesTargetsTab once the season is closed', () => {
  it('shows the targets with no way to change them', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];

    renderTab(buildPlantingSeason({ status: 'Closed' }));

    expect(await within(substratumSection('A-1')).findByText(KOA)).toBeInTheDocument();
    expect(within(substratumSection('A-1')).getByText('300')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.ADD_SPECIES })).toBeNull();
    // No pencil and no trash can, so nothing in the row can be edited or removed.
    expect(within(speciesRow('A-1', KOA)).queryAllByRole('button')).toHaveLength(0);
  });

  it('drops the instructions for setting targets', async () => {
    speciesTargets = [{ quantity: 300, speciesId: KOA_ID, substratumId: SUBSTRATUM_A1_ID }];

    renderTab(buildPlantingSeason({ status: 'Closed' }));

    await within(substratumSection('A-1')).findByText(KOA);
    expect(screen.queryByText(strings.SET_SPECIES_TARGETS_DESCRIPTION)).toBeNull();
  });

  it('explains how targets work while the season can still be edited', async () => {
    renderTab();

    expect(await screen.findByText(strings.SET_SPECIES_TARGETS_DESCRIPTION)).toBeInTheDocument();
  });
});

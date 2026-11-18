import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import { PlantingSiteSpeciesTargetPayload, StratumResponsePayload } from 'src/queries/generated/plantingSites';
import type { AppStore } from 'src/redux/store';
import PlantingPlanSpeciesSection from 'src/scenes/PlantingPlansRouter/PlantingPlanSpeciesSection';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildSpecies,
  buildStratum,
  captureRequests,
  mockError,
  mockGet,
  mockPut,
  renderWithProviders,
  server,
} from 'src/test-utils';
import { Species } from 'src/types/Species';

const SITE_ID = 1;
const KOA_ID = 10;
const OHIA_ID = 11;
const KOKIA_ID = 12;

const SPECIES_URL = '/api/v1/species';
const TARGETS_URL = `/api/v1/tracking/sites/${SITE_ID}/speciesTargets`;
/** The upsert and delete endpoints, spelled out per species so a call for the wrong one is unhandled. */
const targetUrl = (speciesId: number) => `${TARGETS_URL}/${speciesId}`;

/** The third species has no common name, so the row renders the scientific name alone. */
const SPECIES: Species[] = [
  buildSpecies({ id: KOA_ID, scientificName: 'Acacia koa', commonName: 'Koa' }),
  buildSpecies({ id: OHIA_ID, scientificName: 'Metrosideros polymorpha', commonName: 'Ohia lehua' }),
  buildSpecies({ id: KOKIA_ID, scientificName: 'Kokia drynarioides', commonName: undefined }),
];

const STRATA: StratumResponsePayload[] = [
  buildStratum({ id: 1, name: 'Mauka' }),
  buildStratum({ id: 2, name: 'Makai' }),
];

type RenderOptions = {
  canEdit?: boolean;
  targets?: PlantingSiteSpeciesTargetPayload[];
  species?: Species[];
  strata?: StratumResponsePayload[];
};

const renderSection = ({ canEdit = true, targets = [], species = SPECIES, strata = STRATA }: RenderOptions = {}) => {
  mockGet(SPECIES_URL, { species });
  mockGet(TARGETS_URL, { targets });

  return renderWithProviders(
    <PlantingPlanSpeciesSection plantingSite={buildPlantingSite({ id: SITE_ID, strata })} canEdit={canEdit} />
  );
};

/**
 * The row for a species. The name is a `Typography` inside the row's first `Box`, and the row
 * itself carries no role or label, so it has to be reached by walking up from the name.
 */
const speciesRow = (scientificName: string): HTMLElement => {
  const row = screen.getByText(scientificName).closest('div')?.parentElement;
  if (!row) {
    throw new Error(`No row for "${scientificName}"`);
  }
  return row;
};

/**
 * `Button` renders icon-only controls (edit, delete, confirm, cancel) with no accessible name, so
 * they can only be told apart by their position within the row. MUI's own autocomplete buttons do
 * have `aria-label`s and are excluded here.
 */
const iconButtons = (scope: HTMLElement): HTMLElement[] =>
  within(scope)
    .queryAllByRole('button')
    .filter((button) => button.textContent?.trim() === '' && !button.getAttribute('aria-label'));

const editGoalButton = (scientificName: string) => iconButtons(speciesRow(scientificName))[0];

const deleteButton = (scientificName: string) => {
  const buttons = iconButtons(speciesRow(scientificName));
  return buttons[buttons.length - 1];
};

/** `Textfield` points its `<label for>` at a wrapper div rather than the input it wraps. */
const goalField = (speciesId: number) =>
  document.querySelector(`#species-target-${speciesId} input`) as HTMLInputElement;

const addSpeciesCombobox = () => document.querySelector('#add-species') as HTMLElement;

const addSpeciesGoalField = () => document.querySelector('#add-species-target input') as HTMLInputElement;

/** The add-species row, reached from the goal field it contains. */
const addSpeciesRow = (): HTMLElement => {
  const row = document.getElementById('add-species-target')?.closest('div.MuiBox-root')?.parentElement?.parentElement;
  if (!row || !row.contains(addSpeciesCombobox())) {
    throw new Error('The add-species row is not open');
  }
  return row;
};

const confirmAddButton = () => iconButtons(addSpeciesRow())[0];
const cancelAddButton = () => iconButtons(addSpeciesRow())[1];

/**
 * `DialogBox` sets no `role='dialog'`, and `dialogTitled` cannot be used here because the modal's
 * title and its confirm button share the same copy. This section opens no other dialog.
 */
const strataModal = (): HTMLElement => {
  const box = document.querySelector('.dialog-box');
  if (!box) {
    throw new Error('No open dialog');
  }
  return box as HTMLElement;
};

const editGoal = async (user: UserEvent, scientificName: string, speciesId: number, value: string) => {
  await user.click(editGoalButton(scientificName));
  const field = goalField(speciesId);
  await user.clear(field);
  if (value !== '') {
    await user.type(field, value);
  }
  await user.keyboard('{Enter}');
};

/** The add button stays disabled until the organization's species have loaded. */
const openAddSpeciesRow = async (user: UserEvent) => {
  const button = await screen.findByRole('button', { name: strings.ADD_SPECIES });
  await waitFor(() => expect(button).toBeEnabled());
  await user.click(button);
};

const chooseSpecies = async (user: UserEvent, scientificName: string) => {
  await waitFor(() => expect(addSpeciesCombobox()).toBeInTheDocument());
  await user.click(addSpeciesCombobox());
  await user.click(within(await screen.findByRole('listbox')).getByText(scientificName));
};

const toastError = (store: AppStore) =>
  waitFor(() =>
    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      msg: strings.GENERIC_ERROR,
      priority: 'critical',
    })
  );

describe('PlantingPlanSpeciesSection rendering', () => {
  it('lists each species with its goal and the strata it is planted in', async () => {
    renderSection({
      targets: [
        { speciesId: KOA_ID, stratumIds: [1, 2], targetPlants: 12345 },
        { speciesId: KOKIA_ID, stratumIds: [], targetPlants: undefined },
      ],
    });

    expect(await screen.findByText('Acacia koa')).toBeInTheDocument();
    expect(screen.getByText('Koa')).toBeInTheDocument();
    expect(within(speciesRow('Acacia koa')).getByText('12,345')).toBeInTheDocument();
    expect(within(speciesRow('Acacia koa')).getByRole('button', { name: 'Mauka' })).toBeInTheDocument();
    expect(within(speciesRow('Acacia koa')).getByRole('button', { name: 'Makai' })).toBeInTheDocument();

    // A species with no goal and no strata reads as a placeholder plus an invitation to assign.
    expect(within(speciesRow('Kokia drynarioides')).getByText('-')).toBeInTheDocument();
    expect(
      within(speciesRow('Kokia drynarioides')).getByRole('button', { name: strings.ASSIGN_STRATA })
    ).toBeInTheDocument();
  });

  it('totals the goals across species, counting a species with no goal as none', async () => {
    renderSection({
      targets: [
        { speciesId: KOA_ID, stratumIds: [], targetPlants: 1200 },
        { speciesId: OHIA_ID, stratumIds: [], targetPlants: 800 },
        { speciesId: KOKIA_ID, stratumIds: [] },
      ],
    });

    expect(await screen.findByText(strings.formatString(strings.X_PLANTS, '2,000').toString())).toBeInTheDocument();
    expect(screen.getByText(strings.formatString(strings.X_SPECIES, '3').toString())).toBeInTheDocument();
  });

  it('groups the goal digits for the active locale', async () => {
    mockGet(SPECIES_URL, { species: SPECIES });
    mockGet(TARGETS_URL, { targets: [{ speciesId: KOA_ID, stratumIds: [], targetPlants: 12345 }] });

    renderWithProviders(<PlantingPlanSpeciesSection plantingSite={buildPlantingSite({ id: SITE_ID })} canEdit />, {
      localization: { activeLocale: 'es', selectedLocale: 'es' },
    });

    expect(await screen.findByText('12.345')).toBeInTheDocument();
  });

  it('offers to add the first species when the plan has none yet', async () => {
    renderSection({ targets: [] });

    expect(await screen.findByText(strings.formatString(strings.X_SPECIES, '0').toString())).toBeInTheDocument();
    await waitFor(() => expect(addSpeciesCombobox()).toBeInTheDocument());
    // Nothing to go back to, so the first row cannot be dismissed.
    expect(iconButtons(addSpeciesRow())).toHaveLength(1);
  });

  it('will not offer a species that already has a goal', async () => {
    const { user } = renderSection({ targets: [{ speciesId: KOA_ID, stratumIds: [] }] });

    await openAddSpeciesRow(user);
    await user.click(addSpeciesCombobox());

    const options = await screen.findByRole('listbox');
    expect(within(options).queryByText('Acacia koa')).not.toBeInTheDocument();
    expect(within(options).getByText('Metrosideros polymorpha')).toBeInTheDocument();
  });

  it('stops offering to add once every species has a goal', async () => {
    renderSection({
      targets: SPECIES.map((species) => ({ speciesId: species.id, stratumIds: [] })),
    });

    await waitFor(() => expect(screen.getByRole('button', { name: strings.ADD_SPECIES })).toBeDisabled());
  });
});

describe('PlantingPlanSpeciesSection without edit permission', () => {
  it('shows the goals and strata as plain text with nothing to act on', async () => {
    renderSection({
      canEdit: false,
      targets: [{ speciesId: KOA_ID, stratumIds: [1], targetPlants: 500 }],
    });

    await screen.findByText('Acacia koa');

    const row = speciesRow('Acacia koa');
    expect(within(row).getByText('500')).toBeInTheDocument();
    expect(within(row).getByText('Mauka')).toBeInTheDocument();
    expect(within(row).queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(strings.ADD_SPECIES)).not.toBeInTheDocument();
  });

  it('shows a placeholder instead of an add row when the plan has no species', async () => {
    renderSection({ canEdit: false, targets: [] });

    expect(await screen.findByText(strings.formatString(strings.X_SPECIES, '0').toString())).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(document.querySelector('#add-species')).toBeNull();
  });
});

describe('PlantingPlanSpeciesSection editing a goal', () => {
  const target: PlantingSiteSpeciesTargetPayload = { speciesId: KOA_ID, stratumIds: [1], targetPlants: 100 };

  it('sends the new goal along with the strata the species already had', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '250');

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [1], targetPlants: 250 });
  });

  it('shows the saved goal once the plan has been reloaded', async () => {
    // A server that remembers the upsert, so the refetch the component triggers returns the new
    // goal. Without the refetch the user would be left looking at the number they replaced.
    let stored: PlantingSiteSpeciesTargetPayload[] = [target];
    mockGet(SPECIES_URL, { species: SPECIES });
    server.use(
      http.get(TARGETS_URL, () => HttpResponse.json({ status: 'ok', targets: stored })),
      http.put(targetUrl(KOA_ID), async ({ request }) => {
        const body = (await request.json()) as { targetPlants?: number };
        stored = [{ ...target, targetPlants: body.targetPlants }];
        return HttpResponse.json({ status: 'ok' });
      })
    );

    const { user } = renderWithProviders(
      <PlantingPlanSpeciesSection plantingSite={buildPlantingSite({ id: SITE_ID, strata: STRATA })} canEdit />
    );

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '250');

    expect(await screen.findByText('250')).toBeInTheDocument();
  });

  it('clears the goal when the field is emptied', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '');

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [1] });
  });

  it('sends nothing when the goal is left unchanged', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '100');

    expect(updates).toHaveLength(0);
  });

  it('sends nothing when a species with no goal is left without one', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [{ speciesId: KOA_ID, stratumIds: [1] }] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '');

    expect(updates).toHaveLength(0);
  });

  it('rejects a goal of zero', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '0');

    expect(updates).toHaveLength(0);
    expect(within(speciesRow('Acacia koa')).getByText('100')).toBeInTheDocument();
  });

  it('rejects a negative goal', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '-5');

    expect(updates).toHaveLength(0);
  });

  it('reports the failure when the goal cannot be saved', async () => {
    mockError('put', targetUrl(KOA_ID));

    const { user, store } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await editGoal(user, 'Acacia koa', KOA_ID, '250');

    await toastError(store);
  });
});

describe('PlantingPlanSpeciesSection adding a species', () => {
  it('will not add until a species has been chosen', async () => {
    renderSection({ targets: [] });

    await waitFor(() => expect(addSpeciesCombobox()).toBeInTheDocument());
    expect(confirmAddButton()).toBeDisabled();
  });

  it('sends the chosen species and goal, with no strata yet', async () => {
    const updates = captureRequests('put', targetUrl(OHIA_ID));

    const { user } = renderSection({ targets: [] });

    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.type(addSpeciesGoalField(), '400');
    await user.click(confirmAddButton());

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [], targetPlants: 400 });
  });

  it('adds a species with no goal when the goal is left blank', async () => {
    const updates = captureRequests('put', targetUrl(OHIA_ID));

    const { user } = renderSection({ targets: [] });

    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.click(confirmAddButton());

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [] });
  });

  it('adds a species with no goal when the goal is zero', async () => {
    const updates = captureRequests('put', targetUrl(OHIA_ID));

    const { user } = renderSection({ targets: [] });

    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.type(addSpeciesGoalField(), '0');
    await user.click(confirmAddButton());

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [] });
  });

  it('closes the add row once the species has been added', async () => {
    mockPut(targetUrl(OHIA_ID));

    const { user } = renderSection({ targets: [{ speciesId: KOA_ID, stratumIds: [] }] });

    await openAddSpeciesRow(user);
    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.click(confirmAddButton());

    await waitFor(() => expect(document.querySelector('#add-species')).toBeNull());
  });

  it('keeps the add row open with the input intact when the species cannot be added', async () => {
    mockError('put', targetUrl(OHIA_ID));

    const { user, store } = renderSection({ targets: [{ speciesId: KOA_ID, stratumIds: [] }] });

    await openAddSpeciesRow(user);
    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.type(addSpeciesGoalField(), '400');
    await user.click(confirmAddButton());

    await toastError(store);
    // Closing the row would throw away input for a species that was never added.
    expect(addSpeciesGoalField()).toHaveValue(400);
  });

  it('sends nothing when the add row is dismissed', async () => {
    const updates = captureRequests('put', targetUrl(OHIA_ID));

    const { user } = renderSection({ targets: [{ speciesId: KOA_ID, stratumIds: [] }] });

    await openAddSpeciesRow(user);
    await chooseSpecies(user, 'Metrosideros polymorpha');
    await user.click(cancelAddButton());

    await waitFor(() => expect(document.querySelector('#add-species')).toBeNull());
    expect(updates).toHaveLength(0);
  });
});

describe('PlantingPlanSpeciesSection removing a species', () => {
  it('removes the species as soon as the control is used, without confirming', async () => {
    const deletes = captureRequests('delete', targetUrl(KOA_ID));

    const { user } = renderSection({
      targets: [
        { speciesId: KOA_ID, stratumIds: [1], targetPlants: 100 },
        { speciesId: OHIA_ID, stratumIds: [], targetPlants: 200 },
      ],
    });

    await screen.findByText('Acacia koa');
    await user.click(deleteButton('Acacia koa'));

    await waitFor(() => expect(deletes).toHaveLength(1));
  });

  it('reports the failure when the species cannot be removed', async () => {
    mockError('delete', targetUrl(KOA_ID));

    const { user, store } = renderSection({
      targets: [{ speciesId: KOA_ID, stratumIds: [1], targetPlants: 100 }],
    });

    await screen.findByText('Acacia koa');
    await user.click(deleteButton('Acacia koa'));

    await toastError(store);
    expect(screen.getByText('Acacia koa')).toBeInTheDocument();
  });
});

describe('PlantingPlanSpeciesSection assigning strata', () => {
  const target: PlantingSiteSpeciesTargetPayload = { speciesId: KOA_ID, stratumIds: [1], targetPlants: 100 };

  it('offers every stratum of the site, with the current ones already chosen', async () => {
    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await user.click(within(speciesRow('Acacia koa')).getByRole('button', { name: 'Mauka' }));

    const modal = strataModal();
    expect(within(modal).getByRole('checkbox', { name: 'Mauka' })).toBeChecked();
    expect(within(modal).getByRole('checkbox', { name: 'Makai' })).not.toBeChecked();
  });

  it('sends the chosen strata and keeps the goal the species already had', async () => {
    const updates = captureRequests('put', targetUrl(KOA_ID));

    const { user } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await user.click(within(speciesRow('Acacia koa')).getByRole('button', { name: 'Mauka' }));
    await user.click(within(strataModal()).getByRole('checkbox', { name: 'Makai' }));
    await user.click(within(strataModal()).getByRole('button', { name: strings.ASSIGN_STRATA }));

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(await updates[0].json()).toEqual({ stratumIds: [1, 2], targetPlants: 100 });
  });

  it('sends nothing when the modal is cancelled', async () => {
    const updates = captureRequests('put', targetUrl(KOKIA_ID));

    const { user } = renderSection({ targets: [{ speciesId: KOKIA_ID, stratumIds: [] }] });

    await screen.findByText('Kokia drynarioides');
    await user.click(within(speciesRow('Kokia drynarioides')).getByRole('button', { name: strings.ASSIGN_STRATA }));
    await user.click(within(strataModal()).getByRole('checkbox', { name: 'Mauka' }));
    await user.click(within(strataModal()).getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(document.querySelector('.dialog-box')).toBeNull());
    expect(updates).toHaveLength(0);
  });

  it('keeps the modal open and reports the failure when the strata cannot be assigned', async () => {
    mockError('put', targetUrl(KOA_ID));

    const { user, store } = renderSection({ targets: [target] });

    await screen.findByText('Acacia koa');
    await user.click(within(speciesRow('Acacia koa')).getByRole('button', { name: 'Mauka' }));
    await user.click(within(strataModal()).getByRole('checkbox', { name: 'Makai' }));
    await user.click(within(strataModal()).getByRole('button', { name: strings.ASSIGN_STRATA }));

    await toastError(store);
    expect(within(strataModal()).getByRole('checkbox', { name: 'Makai' })).toBeChecked();
  });
});

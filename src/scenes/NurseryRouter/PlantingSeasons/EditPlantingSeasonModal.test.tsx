import React from 'react';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import EditPlantingSeasonModal from 'src/scenes/NurseryRouter/PlantingSeasons/EditPlantingSeasonModal';
import strings from 'src/strings';
import { buildPlantingSite, captureRequests, mockError, renderWithProviders } from 'src/test-utils';

const PLANTING_SEASON_ID = 1;
const UPDATE_PATH = `/api/v1/planting-seasons/${PLANTING_SEASON_ID}`;
/** Matches an update for any season id, so a call against the wrong one is caught rather than unhandled. */
const UPDATE_ROUTE = '/api/v1/planting-seasons/:seasonId';

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

// Web-components textfield labels target wrapper elements rather than inputs.
const seasonNameField = () => document.querySelector('#seasonName input') as HTMLInputElement;

const enterDate = async (user: UserEvent, label: string, isoDate: string) => {
  const field = screen.getByRole('textbox', { name: label });
  await user.click(field);
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(isoDate);
};

const renderModal = (onClose = () => undefined, plantingSeason: PlantingSeasonPayload = buildPlantingSeason()) =>
  renderWithProviders(
    <EditPlantingSeasonModal onClose={onClose} plantingSeason={plantingSeason} plantingSite={buildPlantingSite()} />
  );

const save = (user: UserEvent) => user.click(screen.getByRole('button', { name: strings.SAVE }));

describe('EditPlantingSeasonModal', () => {
  it('sends the edited name and dates for the season being edited', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);

    const { user } = renderModal();

    const name = seasonNameField();
    await user.clear(name);
    await user.type(name, '  Winter Rains  ');
    await enterDate(user, strings.START_DATE_REQUIRED, '2026-07-01');
    await enterDate(user, strings.END_DATE_REQUIRED, '2026-10-15');
    await save(user);

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(new URL(updates[0].url).pathname).toBe(UPDATE_PATH);
    expect(await updates[0].json()).toEqual({
      endDate: '2026-10-15',
      name: 'Winter Rains',
      startDate: '2026-07-01',
    });
  });

  it('closes once the season is saved', async () => {
    captureRequests('put', UPDATE_ROUTE);
    const onClose = rstest.fn();

    const { user } = renderModal(onClose);

    await save(user);

    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('will not save a season with no name', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);

    const { user } = renderModal();

    await user.clear(seasonNameField());
    await save(user);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it('will not save a season whose name is only whitespace', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);

    const { user } = renderModal();

    const name = seasonNameField();
    await user.clear(name);
    await user.type(name, '   ');
    await save(user);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it('will not save a season that ends before it starts', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);

    const { user } = renderModal();

    await enterDate(user, strings.END_DATE_REQUIRED, '2026-05-31');
    await save(user);

    expect(await screen.findByText(strings.END_DATE_ERROR)).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it('will not save a season that ends on the day it starts', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);

    const { user } = renderModal();

    await enterDate(user, strings.END_DATE_REQUIRED, '2026-06-01');
    await save(user);

    expect(await screen.findByText(strings.END_DATE_ERROR)).toBeInTheDocument();
    expect(updates).toHaveLength(0);
  });

  it('keeps the modal open and reports the failure when the save is rejected', async () => {
    mockError('put', UPDATE_ROUTE);
    const onClose = rstest.fn();

    const { user, store } = renderModal(onClose);

    await save(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Closing on failure would tell the user their edit was saved when it was not.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(strings.EDIT_PLANTING_SEASON)).toBeInTheDocument();
  });

  it('sends nothing when the edit is cancelled', async () => {
    const updates = captureRequests('put', UPDATE_ROUTE);
    const onClose = rstest.fn();

    const { user } = renderModal(onClose);

    const name = seasonNameField();
    await user.clear(name);
    await user.type(name, 'Discarded');
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });
});

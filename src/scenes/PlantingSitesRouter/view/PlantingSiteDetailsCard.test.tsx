import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import PlantingSiteDetailsCard from 'src/scenes/PlantingSitesRouter/view/PlantingSiteDetailsCard';
import strings from 'src/strings';
import {
  buildOrganization,
  buildPlantingSite,
  captureRequests,
  mockError,
  mockGet,
  mockPost,
  mockPut,
  renderWithProviders,
} from 'src/test-utils';

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;

const PACIFIC = { id: 'America/Los_Angeles', longName: 'Pacific Time' };
const HAWAII = { id: 'Pacific/Honolulu', longName: 'Hawaii Time' };

const PROJECT = { id: 42, name: 'Kokee Restoration', organizationId: 1 };

/**
 * A field shown in the card's read-only grid, by its label.
 *
 * `Textfield` in display mode renders the value in a `<p>` beside the label, and its `<label for>`
 * points at an element that only exists in edit mode, so there is nothing for `getByLabelText` to
 * resolve to. Reading the label's sibling is the workaround.
 */
const detailValue = (label: string): string => {
  const field = screen.getByText(label).closest('.textfield');
  if (!field) {
    throw new Error(`No detail field labelled "${label}"`);
  }
  return field.querySelector('.textfield-value--display')?.textContent ?? '';
};

/**
 * The input of an editable `Textfield`, by its id. Its label is associated with the wrapper div
 * rather than the input, so `getByLabelText` cannot reach it either.
 */
const editableInput = (id: string): HTMLElement => {
  const input = document.querySelector(`#${id} input`);
  if (!input) {
    throw new Error(`No editable field with id "${id}"`);
  }
  return input as HTMLElement;
};

const renderCard = (plantingSite: PlantingSitePayload, role: 'Owner' | 'Contributor' = 'Owner') =>
  renderWithProviders(<PlantingSiteDetailsCard plantingSite={plantingSite} />, {
    organization: { selectedOrganization: buildOrganization({ role, timeZone: PACIFIC.id }) },
    localization: { supportedTimeZones: [PACIFIC, HAWAII] },
  });

beforeEach(() => {
  mockGet('/api/v1/projects', { projects: [PROJECT] });
});

describe('PlantingSiteDetailsCard', () => {
  it('shows the details recorded for the site', async () => {
    renderCard(
      buildPlantingSite({
        name: 'Kokee Site',
        description: 'Upper slopes',
        projectId: PROJECT.id,
        timeZone: HAWAII.id,
      })
    );

    expect(screen.getByText(strings.DETAILS)).toBeInTheDocument();
    expect(detailValue(strings.NAME)).toBe('Kokee Site');
    expect(detailValue(strings.DESCRIPTION)).toBe('Upper slopes');
    expect(detailValue(strings.TIME_ZONE)).toBe(HAWAII.longName);
    await waitFor(() => expect(detailValue(strings.PROJECT)).toBe(PROJECT.name));
  });

  it('marks a field the site has no value for, rather than leaving it blank', () => {
    renderCard(buildPlantingSite({ description: undefined, projectId: undefined }));

    expect(detailValue(strings.DESCRIPTION)).toBe('—');
    expect(detailValue(strings.PROJECT)).toBe('—');
  });

  it("falls back to the organization's time zone for a site that has none of its own", () => {
    renderCard(buildPlantingSite({ timeZone: undefined }));

    // The site inherits the organization's zone, which is what observation dates are reported in.
    expect(detailValue(strings.TIME_ZONE)).toBe(PACIFIC.longName);
  });

  it('links to the planting seasons of this site', () => {
    renderCard(buildPlantingSite());

    expect(screen.getByRole('link', { name: strings.MANAGE_PLANTING_SEASONS })).toHaveAttribute(
      'href',
      `/plants/planting-seasons?plantingSiteId=${PLANTING_SITE_ID}`
    );
  });

  it('offers no way to edit the details to a contributor', () => {
    renderCard(buildPlantingSite(), 'Contributor');

    expect(screen.queryByRole('button', { name: strings.EDIT_DETAILS })).not.toBeInTheDocument();
    expect(detailValue(strings.NAME)).toBe('Test Planting Site');
  });

  describe('editing', () => {
    beforeEach(() => {
      // The edit form checks the new name against the names already in use, by both published and
      // draft sites. Both are searches against the same endpoint.
      mockPost('/api/v1/search', { results: [] });
    });

    it('sends the edited details to the site being viewed', async () => {
      const requests = captureRequests('put', SITE_URL);

      const { user } = renderCard(
        buildPlantingSite({ description: 'Upper slopes', projectId: PROJECT.id, timeZone: HAWAII.id })
      );

      await user.click(screen.getByRole('button', { name: strings.EDIT_DETAILS }));
      await user.clear(editableInput('name'));
      await user.type(editableInput('name'), 'Renamed Site');
      await user.click(await screen.findByRole('button', { name: strings.SAVE }));

      await waitFor(() => expect(requests).toHaveLength(1));
      expect(await requests[0].json()).toEqual({
        description: 'Upper slopes',
        name: 'Renamed Site',
        projectId: PROJECT.id,
        timeZone: HAWAII.id,
      });
    });

    it('refuses to save a site with no name, and says why', async () => {
      const requests = captureRequests('put', SITE_URL);

      const { user } = renderCard(buildPlantingSite());

      await user.click(screen.getByRole('button', { name: strings.EDIT_DETAILS }));
      await user.clear(editableInput('name'));
      await user.click(await screen.findByRole('button', { name: strings.SAVE }));

      expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
      expect(requests).toHaveLength(0);
    });

    it('confirms the save and goes back to showing the details', async () => {
      mockPut(SITE_URL);

      const { store, user } = renderCard(buildPlantingSite());

      await user.click(screen.getByRole('button', { name: strings.EDIT_DETAILS }));
      await user.clear(editableInput('name'));
      await user.type(editableInput('name'), 'Renamed Site');
      await user.click(await screen.findByRole('button', { name: strings.SAVE }));

      await waitFor(() =>
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({
          priority: 'success',
          msg: strings.CHANGES_SAVED,
        })
      );
      expect(screen.queryByRole('button', { name: strings.SAVE })).not.toBeInTheDocument();
    });

    it('keeps the edits on screen and reports the failure when the save fails', async () => {
      mockError('put', SITE_URL);

      const { store, user } = renderCard(buildPlantingSite());

      await user.click(screen.getByRole('button', { name: strings.EDIT_DETAILS }));
      await user.clear(editableInput('name'));
      await user.type(editableInput('name'), 'Renamed Site');
      await user.click(await screen.findByRole('button', { name: strings.SAVE }));

      await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));

      // Dropping back to the read-only view would look like the rename was saved, and would throw
      // away what was typed.
      expect(screen.getByRole('button', { name: strings.SAVE })).toBeInTheDocument();
      expect(editableInput('name')).toHaveValue('Renamed Site');
    });

    it('discards the edits when cancelled', async () => {
      const requests = captureRequests('put', SITE_URL);

      const { user } = renderCard(buildPlantingSite({ name: 'Kokee Site' }));

      await user.click(screen.getByRole('button', { name: strings.EDIT_DETAILS }));
      await user.clear(editableInput('name'));
      await user.type(editableInput('name'), 'Renamed Site');
      await user.click(screen.getByRole('button', { name: strings.CANCEL }));

      expect(detailValue(strings.NAME)).toBe('Kokee Site');
      expect(requests).toHaveLength(0);
    });
  });
});

import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import SpeciesDetailView from 'src/scenes/Species/SpeciesDetailView';
import strings from 'src/strings';
import {
  buildOrganization,
  buildSpecies,
  captureRequests,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';
import { Organization } from 'src/types/Organization';
import { Species } from 'src/types/Species';

const SPECIES_ID = 7;
const SPECIES_URL = '/api/v1/species';
const PROJECTS_URL = '/api/v1/projects';

const SPECIES = buildSpecies({ id: SPECIES_ID, scientificName: 'Acacia koa', commonName: 'Koa' });
const OTHER_SPECIES = buildSpecies({ id: 8, scientificName: 'Metrosideros polymorpha', commonName: 'ʻŌhiʻa lehua' });

/** Renders the current location so a test can assert on where the view sent the user. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

type RenderOptions = {
  /** The species the organization already uses, as returned by `GET /species?inUse=true`. */
  inUse?: Species[];
  organization?: Organization;
};

/**
 * Renders the detail view for {@link SPECIES}.
 *
 * The routes are declared here rather than through the `path` render option because deleting
 * navigates back to the species list: the probe has to outlive the detail route to report where the
 * user ended up, and the list route has to exist for the navigation to land somewhere.
 */
const renderDetailView = ({ inUse = [], organization }: RenderOptions = {}) => {
  mockGet(PROJECTS_URL, { projects: [] });
  mockGet(`${SPECIES_URL}/${SPECIES_ID}`, { species: SPECIES });
  mockGet(SPECIES_URL, { species: inUse });

  const reloads: boolean[] = [];

  const rendered = renderWithProviders(
    <>
      <Routes>
        <Route path='/species/:speciesId' element={<SpeciesDetailView reloadData={() => reloads.push(true)} />} />
        <Route path='/species' element={<div />} />
      </Routes>
      <LocationProbe />
    </>,
    {
      route: `/species/${SPECIES_ID}`,
      ...(organization ? { organization: { selectedOrganization: organization } } : {}),
    }
  );

  return { ...rendered, wasReloaded: () => reloads.length > 0 };
};

const waitForSpecies = async () => {
  await screen.findAllByText(SPECIES.scientificName);
};

/**
 * The options menu button carries an icon and no label, and its tooltip title lands on the wrapping
 * span rather than the button, so it has no accessible name to query by. Its id is the only handle
 * a test has on it.
 */
const optionsMenuButton = (): HTMLElement => {
  const button = document.querySelector('#more-options');
  if (!button) {
    throw new Error('No options menu');
  }
  return button as HTMLElement;
};

/**
 * The open dialog with this title, so its Delete button is told apart from the destructive Delete
 * item in the options menu behind it. `DialogBox` renders no ARIA dialog role to scope by.
 */
const dialogTitled = (title: string): HTMLElement => {
  const box = screen.getByText(title).closest('.dialog-box');
  if (!box) {
    throw new Error(`No open dialog titled "${title}"`);
  }
  return box as HTMLElement;
};

const deleteDialog = () => dialogTitled(strings.DELETE_SPECIES);

const currentPath = () => screen.getByTestId('location').textContent;

const openDeleteDialog = async (user: ReturnType<typeof renderDetailView>['user']) => {
  await user.click(optionsMenuButton());
  await user.click(await screen.findByRole('menuitem', { name: strings.DELETE }));
  await screen.findByText(strings.DELETE_SPECIES);
};

// PageSnackbar mounts the app-version poller on every page. An empty body means "no newer build",
// which keeps the upgrade banner out of the way of what these tests are looking at.
beforeEach(() => {
  server.use(http.get('/build-version.txt', () => HttpResponse.text('')));
});

describe('SpeciesDetailView', () => {
  describe('permission gating', () => {
    it('gives a contributor no way to edit or delete the species', async () => {
      renderDetailView({ organization: buildOrganization({ role: 'Contributor' }) });

      await waitForSpecies();

      expect(screen.queryByRole('button', { name: strings.EDIT_SPECIES })).not.toBeInTheDocument();
      expect(document.querySelector('#more-options')).not.toBeInTheDocument();
    });

    it('gives a manager the edit button and the delete menu', async () => {
      const { user } = renderDetailView({ organization: buildOrganization({ role: 'Manager' }) });

      await waitForSpecies();

      expect(screen.getByRole('button', { name: strings.EDIT_SPECIES })).toBeInTheDocument();

      await user.click(optionsMenuButton());

      expect(await screen.findByRole('menuitem', { name: strings.DELETE })).toBeInTheDocument();
    });
  });

  describe('the in-use guard', () => {
    it('refuses to delete a species that is in use', async () => {
      const deletes = captureRequests('delete', `${SPECIES_URL}/:speciesId`);

      const { user } = renderDetailView({ inUse: [OTHER_SPECIES, SPECIES] });

      await waitForSpecies();
      await openDeleteDialog(user);

      const dialog = deleteDialog();
      expect(within(dialog).getByText(strings.SELECTED_SPECIES_IN_USE)).toBeInTheDocument();
      expect(within(dialog).queryByText(strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT)).not.toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: strings.DELETE })).toBeDisabled();
      expect(deletes).toHaveLength(0);
    });

    it('offers to delete a species that nothing references', async () => {
      const { user } = renderDetailView({ inUse: [OTHER_SPECIES] });

      await waitForSpecies();
      await openDeleteDialog(user);

      const dialog = deleteDialog();
      expect(within(dialog).getByText(strings.SELECTED_SPECIES_UNUSED)).toBeInTheDocument();
      expect(within(dialog).getByText(strings.DELETE_CONFIRMATION_MODAL_MAIN_TEXT)).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: strings.DELETE })).toBeEnabled();
    });
  });

  describe('confirming the deletion', () => {
    it('deletes the species being viewed and returns to the list', async () => {
      const deletes = captureRequests('delete', `${SPECIES_URL}/:speciesId`);

      const { user, wasReloaded } = renderDetailView({ inUse: [OTHER_SPECIES] });

      await waitForSpecies();
      await openDeleteDialog(user);
      await user.click(within(deleteDialog()).getByRole('button', { name: strings.DELETE }));

      await waitFor(() => expect(deletes).toHaveLength(1));
      expect(new URL(deletes[0].url).pathname).toBe(`${SPECIES_URL}/${SPECIES_ID}`);

      await waitFor(() => expect(currentPath()).toBe('/species'));
      expect(wasReloaded()).toBe(true);
    });

    it('sends nothing when the deletion is cancelled', async () => {
      const deletes = captureRequests('delete', `${SPECIES_URL}/:speciesId`);

      const { user } = renderDetailView({ inUse: [OTHER_SPECIES] });

      await waitForSpecies();
      await openDeleteDialog(user);
      await user.click(within(deleteDialog()).getByRole('button', { name: strings.CANCEL }));

      await waitFor(() => expect(screen.queryByText(strings.SELECTED_SPECIES_UNUSED)).not.toBeInTheDocument());
      expect(deletes).toHaveLength(0);
      expect(currentPath()).toBe(`/species/${SPECIES_ID}`);
    });

    /**
     * Documents what the view does today, which is not obviously what it should do: the error toast
     * is the only signal that anything went wrong. The modal closes and the user is returned to the
     * species list exactly as if the delete had succeeded, and the species is still listed there.
     */
    it('reports the failure, leaves the list unreloaded, and still returns to it', async () => {
      mockError('delete', `${SPECIES_URL}/:speciesId`);

      const { user, store, wasReloaded } = renderDetailView({ inUse: [OTHER_SPECIES] });

      await waitForSpecies();
      await openDeleteDialog(user);
      await user.click(within(deleteDialog()).getByRole('button', { name: strings.DELETE }));

      await waitFor(() =>
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        })
      );
      expect(wasReloaded()).toBe(false);
      expect(screen.queryByText(strings.SELECTED_SPECIES_UNUSED)).not.toBeInTheDocument();
      expect(currentPath()).toBe('/species');
    });
  });
});

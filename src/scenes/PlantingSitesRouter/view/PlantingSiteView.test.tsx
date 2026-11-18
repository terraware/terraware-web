import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import PlantingSiteView from 'src/scenes/PlantingSitesRouter/view/PlantingSiteView';
import strings from 'src/strings';
import {
  buildOrganization,
  buildPlantingSite,
  captureRequests,
  dialogTitled,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
} from 'src/test-utils';

// Both maps need a real Mapbox GL context, which jsdom has none of. Stubbing them at the boundary
// where this view renders them keeps the one map-related thing the view decides — which of the two
// a site gets — assertable, and leaves the maps themselves to the Playwright suites.
rstest.mock('src/scenes/PlantingSitesRouter/view/PlantingSiteMapV2', () => ({
  __esModule: true,
  default: ({ plantingSiteId }: { plantingSiteId: number }) => <div>{`detailed map of site ${plantingSiteId}`}</div>,
}));

rstest.mock('src/scenes/PlantsDashboardRouter/components/SimplePlantingSiteMap', () => ({
  __esModule: true,
  default: ({ plantingSiteId }: { plantingSiteId: number }) => <div>{`simple map of site ${plantingSiteId}`}</div>,
}));

const PLANTING_SITE_ID = 1;
const SITE_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}`;
const HISTORY_URL = `${SITE_URL}/history`;
const SITE_NAME = 'Kokee Site';

const detailedMap = `detailed map of site ${PLANTING_SITE_ID}`;
const simpleMap = `simple map of site ${PLANTING_SITE_ID}`;

/** One planting allocated to the site, in the shape the plantings search answers with. */
const PLANTING_RESULT = {
  id: '1',
  createdTime: '2026-01-05T00:00:00Z',
  delivery_id: '1',
  delivery_withdrawal_id: '1',
  'numPlants(raw)': '10',
  plantingSite_id: `${PLANTING_SITE_ID}`,
  substratum_id: '1',
  type: 'Delivery',
  species: { id: '7', conservationCategory: 'LC', scientificName: 'Acacia koa', rare: 'false' },
};

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{`${location.pathname}${location.search}`}</div>;
};

const mockSite = (overrides: Partial<PlantingSitePayload> = {}) => {
  mockGet(SITE_URL, { site: buildPlantingSite({ id: PLANTING_SITE_ID, name: SITE_NAME, ...overrides }) });
};

/**
 * The routing is set up here rather than through the harness's `path` option so that the location
 * probe sits outside the route and survives the view navigating away from itself.
 */
const renderView = (role: 'Owner' | 'Contributor' = 'Owner') =>
  renderWithProviders(
    <>
      <Routes>
        <Route path='/planting-sites/:plantingSiteId' element={<PlantingSiteView />} />
      </Routes>
      <LocationProbe />
    </>,
    {
      organization: { selectedOrganization: buildOrganization({ role }) },
      route: `/planting-sites/${PLANTING_SITE_ID}`,
    }
  );

/**
 * Whether the site's name is on screen. It is shown twice — as the page heading, and as the Name
 * field of the details card — and neither is a heading element, so there is nothing more specific
 * to query by.
 */
const siteNameShown = (): boolean => screen.queryAllByText(SITE_NAME).length > 0;

const findSiteName = () => screen.findAllByText(SITE_NAME);

/**
 * The header's options menu button. It carries no label of its own — the tooltip puts the only
 * accessible name on a wrapper around it — so it has to be reached through that wrapper.
 */
const optionsMenuButton = (): HTMLElement => within(screen.getByLabelText(strings.MORE_OPTIONS)).getByRole('button');

/** Opens the delete modal from the header's options menu, and returns it. */
const openDeleteModal = async (user: ReturnType<typeof renderView>['user']): Promise<HTMLElement> => {
  await user.click(optionsMenuButton());
  await user.click(await screen.findByRole('menuitem', { name: strings.DELETE }));
  // `DialogBox` sets no dialog role, so the modal has to be found by its title.
  return dialogTitled(strings.DELETE_PLANTING_SITE);
};

beforeEach(() => {
  mockGet('/build-version.txt');
  mockGet('/api/v1/projects', { projects: [] });
  mockGet(HISTORY_URL, { events: [] });
  // The delete modal checks whether anything has been planted at the site before allowing it.
  mockPost('/api/v1/search', { results: [] });
});

describe('PlantingSiteView', () => {
  it('waits for the site before showing anything about it', async () => {
    mockSite();

    renderView();

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(siteNameShown()).toBe(false);
    expect(screen.queryByText(strings.DETAILS)).not.toBeInTheDocument();

    await findSiteName();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('names the site and offers a way back to the list', async () => {
    mockSite();

    renderView();

    await findSiteName();
    expect(screen.getByRole('link', { name: strings.PLANTING_SITES })).toHaveAttribute('href', '/planting-sites');
  });

  describe('site boundary', () => {
    it('shows the detailed map of a site that has strata', async () => {
      mockSite();

      renderView();

      expect(await screen.findByText(strings.SITE_BOUNDARY)).toBeInTheDocument();
      expect(screen.getByText(detailedMap)).toBeInTheDocument();
      expect(screen.queryByText(simpleMap)).not.toBeInTheDocument();
    });

    it('shows the simple map of a site drawn without strata', async () => {
      mockSite({ strata: undefined });

      renderView();

      expect(await screen.findByText(simpleMap)).toBeInTheDocument();
      expect(screen.queryByText(detailedMap)).not.toBeInTheDocument();
    });

    it('shows no boundary section for a site that has no boundary', async () => {
      mockSite({ boundary: undefined });

      renderView();

      await findSiteName();
      expect(screen.queryByText(strings.SITE_BOUNDARY)).not.toBeInTheDocument();
      expect(screen.queryByText(detailedMap)).not.toBeInTheDocument();
      expect(screen.queryByText(simpleMap)).not.toBeInTheDocument();
    });

    it('takes an admin to the boundary editor', async () => {
      mockSite();

      const { user } = renderView();

      await user.click(await screen.findByRole('button', { name: strings.EDIT_SITE_BOUNDARY }));

      expect(screen.getByTestId('location').textContent).toBe(`/planting-sites/${PLANTING_SITE_ID}/edit`);
    });

    it('offers no boundary editing to a contributor', async () => {
      mockSite();

      renderView('Contributor');

      expect(await screen.findByText(strings.SITE_BOUNDARY)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: strings.EDIT_SITE_BOUNDARY })).not.toBeInTheDocument();
    });

    it('offers no boundary editing for a site that has no strata to edit', async () => {
      mockSite({ strata: undefined });

      renderView();

      expect(await screen.findByText(strings.SITE_BOUNDARY)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: strings.EDIT_SITE_BOUNDARY })).not.toBeInTheDocument();
    });
  });

  describe('deleting the site', () => {
    it('is not offered to a contributor', async () => {
      mockSite();

      renderView('Contributor');

      await findSiteName();
      expect(screen.queryByLabelText(strings.MORE_OPTIONS)).not.toBeInTheDocument();
    });

    it('asks an admin to confirm, naming the site', async () => {
      mockSite();

      const { user } = renderView();
      await findSiteName();
      const modal = await openDeleteModal(user);

      expect(
        within(modal).getByText(strings.formatString(strings.DELETE_PLANTING_SITE_MESSAGE, SITE_NAME) as string)
      ).toBeInTheDocument();
      expect(within(modal).getByText(strings.ARE_YOU_SURE)).toBeInTheDocument();
    });

    it('deletes nothing when the confirmation is cancelled', async () => {
      mockSite();
      const requests = captureRequests('delete', SITE_URL);

      const { user } = renderView();
      await findSiteName();
      const modal = await openDeleteModal(user);
      await user.click(within(modal).getByRole('button', { name: strings.CANCEL }));

      await waitFor(() => expect(screen.queryByText(strings.DELETE_PLANTING_SITE)).not.toBeInTheDocument());
      expect(requests).toHaveLength(0);
    });

    it('deletes the site and returns to the list', async () => {
      mockSite();
      const requests = captureRequests('delete', SITE_URL);

      const { store, user } = renderView();
      await findSiteName();
      const modal = await openDeleteModal(user);
      await user.click(within(modal).getByRole('button', { name: strings.DELETE }));

      await waitFor(() => expect(requests).toHaveLength(1));
      await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/planting-sites'));
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'success',
        msg: strings.PLANTING_SITE_DELETED,
      });
    });

    it('stays on the site and reports the failure when the delete fails', async () => {
      mockSite();
      mockError('delete', SITE_URL);

      const { store, user } = renderView();
      await findSiteName();
      const modal = await openDeleteModal(user);
      await user.click(within(modal).getByRole('button', { name: strings.DELETE }));

      await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));

      // Navigating away would suggest the site had been deleted when it is still there.
      expect(screen.getByTestId('location').textContent).toBe(`/planting-sites/${PLANTING_SITE_ID}`);
      expect(siteNameShown()).toBe(true);
    });

    it('refuses to delete a site that has plantings allocated to it', async () => {
      mockSite();
      mockPost('/api/v1/search', { results: [PLANTING_RESULT] });

      const { user } = renderView();
      await findSiteName();
      const modal = await openDeleteModal(user);

      expect(
        await within(modal).findByText(
          strings.formatString(strings.DELETE_PLANTING_SITE_IN_USE_MESSAGE, SITE_NAME) as string
        )
      ).toBeInTheDocument();
      // Disabled rather than merely warned about: deleting the site would orphan the deliveries
      // recorded against it.
      await waitFor(() => expect(within(modal).getByRole('button', { name: strings.DELETE })).toBeDisabled());
    });
  });
});

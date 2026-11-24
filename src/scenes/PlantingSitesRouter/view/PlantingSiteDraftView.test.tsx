import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import ToastSnackbar from 'src/components/ToastSnackbar';
import { APP_PATHS } from 'src/constants';
import type { DraftPlantingSitePayload } from 'src/queries/generated/draftPlantingSites';
import { ProjectPayload } from 'src/queries/generated/projects';
import PlantingSiteDraftView from 'src/scenes/PlantingSitesRouter/view/PlantingSiteDraftView';
import strings from 'src/strings';
import {
  RenderWithProvidersOptions,
  buildOrganization,
  captureRequests,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

// Mapbox GL needs a real canvas, and nothing this view is responsible for is visible on the map.
rstest.mock('src/components/NewMap', () => ({
  __esModule: true,
  default: () => <div>site boundary map</div>,
}));

const DRAFT_ID = 7;
const DRAFT_URL = `/api/v1/tracking/draftSites/${DRAFT_ID}`;
const DRAFT_ROUTE = `/planting-sites/draft/${DRAFT_ID}`;
const EDIT_ROUTE = `/planting-sites/draft/${DRAFT_ID}/edit`;
const PROJECTS_URL = '/api/v1/projects';
const SEARCH_URL = '/api/v1/search';
const SITE_NAME = 'Kona Draft';

const PACIFIC = { id: 'America/Los_Angeles', longName: 'Pacific Time' };
const RESTORATION: ProjectPayload = { id: 20, name: 'Restoration', organizationId: 1 };

const buildDraftPayload = (overrides: Partial<DraftPlantingSitePayload> = {}): DraftPlantingSitePayload => ({
  createdBy: 1,
  createdTime: '2026-01-01T00:00:00Z',
  data: {},
  description: 'Dry forest restoration',
  id: DRAFT_ID,
  modifiedTime: '2026-01-02T00:00:00Z',
  name: SITE_NAME,
  organizationId: 1,
  projectId: RESTORATION.id,
  siteEditStep: 'site_boundary',
  siteType: 'Detailed',
  strata: [],
  timeZone: PACIFIC.id,
  ...overrides,
});

/** Renders the current location so a test can assert on where the view sent the user. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

/**
 * The view reads its id from the route and navigates away from it, so the routes are declared here
 * rather than through the harness' `path` option: that one renders the component *as* the route,
 * which would unmount the location probe along with it on the first navigation.
 */
const renderView = (route = DRAFT_ROUTE, options: RenderWithProvidersOptions = {}) =>
  renderWithProviders(
    <>
      <Routes>
        <Route path={APP_PATHS.PLANTING_SITES_DRAFT_VIEW} element={<PlantingSiteDraftView />} />
        <Route path={APP_PATHS.PLANTING_SITES} element={<div>{strings.PLANTING_SITES}</div>} />
        <Route path={APP_PATHS.PLANTING_SITES_DRAFT_EDIT} element={<div>site editor</div>} />
      </Routes>
      <ToastSnackbar />
      <LocationProbe />
    </>,
    {
      localization: { supportedTimeZones: [PACIFIC] },
      organization: { selectedOrganization: buildOrganization({ timeZone: PACIFIC.id }) },
      route,
      ...options,
    }
  );

/**
 * `Textfield` in display mode points its `<label for>` at an id no element carries, so the label
 * and the value it describes are not associated for a query to follow. Pair them up by walking the
 * field the label sits in instead.
 */
const detailValue = (label: string): string | undefined => {
  const field = Array.from(document.querySelectorAll('.textfield')).find(
    (box) => box.querySelector('.textfield-label')?.firstChild?.textContent === label
  );
  if (!field) {
    throw new Error(`No detail field labelled "${label}"`);
  }
  return field.querySelector('.textfield-value--display')?.textContent ?? undefined;
};

/** Opens the details modal and waits until it is ready to be saved. */
const openDetailsModal = async (user: ReturnType<typeof renderView>['user']) => {
  await user.click(await screen.findByRole('button', { name: strings.EDIT }));
  await screen.findByText(strings.EDIT_DETAILS);
  await waitFor(() => expect(screen.getByRole('button', { name: strings.SAVE_AND_CONTINUE })).toBeEnabled());
};

describe('PlantingSiteDraftView', () => {
  beforeEach(() => {
    mockGet(DRAFT_URL, { site: buildDraftPayload() });
    mockGet(PROJECTS_URL, { projects: [RESTORATION] });
    // The details modal checks the name being saved against the names already in use.
    mockPost(SEARCH_URL, { results: [] });
  });

  it('shows nothing about the draft until it has been fetched', async () => {
    renderView();

    // The name heads the page and is also one of the details below it, hence the plural queries.
    expect(screen.queryAllByText(SITE_NAME)).toHaveLength(0);
    expect(await screen.findAllByText(SITE_NAME)).not.toHaveLength(0);
  });

  it('warns that the draft cannot be used until its boundary is finished', async () => {
    renderView();

    expect(await screen.findByText(strings.DRAFT_SITE_BOUNDARY_IN_PROGRESS_MESSAGE)).toBeInTheDocument();
  });

  it('shows the details of the draft that was fetched', async () => {
    renderView();

    await waitFor(() => expect(detailValue(strings.PROJECT)).toBe(RESTORATION.name));
    expect(detailValue(strings.NAME)).toBe(SITE_NAME);
    expect(detailValue(strings.DESCRIPTION)).toBe('Dry forest restoration');
    expect(detailValue(strings.TIME_ZONE)).toBe(PACIFIC.longName);
    expect(screen.getByText(strings.NO_SITE_BOUNDARY_YET)).toBeInTheDocument();
  });

  it('reports the failure and returns to the planting sites list when the draft cannot be fetched', async () => {
    mockError('get', DRAFT_URL);

    renderView();

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(APP_PATHS.PLANTING_SITES));
  });

  it('returns to the planting sites list rather than asking for a draft that cannot exist', async () => {
    const requests = captureRequests('get', '/api/v1/tracking/draftSites/:draftId', { site: buildDraftPayload() });

    renderView('/planting-sites/draft/not-a-draft');

    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(APP_PATHS.PLANTING_SITES));
    expect(requests).toHaveLength(0);
  });

  it('offers an admin the actions that change the draft', async () => {
    renderView();

    expect(await screen.findByRole('button', { name: strings.CONTINUE_BOUNDARY_SETUP })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.DELETE_DRAFT })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.EDIT })).toBeInTheDocument();
  });

  it('lets a contributor read the draft but not change it', async () => {
    renderView(DRAFT_ROUTE, {
      organization: { selectedOrganization: buildOrganization({ role: 'Contributor', timeZone: PACIFIC.id }) },
    });

    expect(await screen.findAllByText(SITE_NAME)).not.toHaveLength(0);
    expect(screen.queryByRole('button', { name: strings.CONTINUE_BOUNDARY_SETUP })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.DELETE_DRAFT })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.EDIT })).not.toBeInTheDocument();
  });

  it('resumes the boundary setup in the editor', async () => {
    mockGet(DRAFT_URL, { site: buildDraftPayload({ siteEditStep: 'stratum_boundaries' }) });

    const { user } = renderView();

    await user.click(await screen.findByRole('button', { name: strings.CONTINUE_WITH_STRATUM_BOUNDARIES }));

    expect(screen.getByTestId('location').textContent).toBe(EDIT_ROUTE);
  });

  it('asks for confirmation before deleting the draft', async () => {
    const requests = captureRequests('delete', DRAFT_URL);

    const { user } = renderView();

    await user.click(await screen.findByRole('button', { name: strings.DELETE_DRAFT }));

    expect(screen.getByText(strings.DELETE_THIS_DRAFT)).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('saves edited details and goes on to the boundary editor', async () => {
    const requests = captureRequests('put', DRAFT_URL);

    const { user } = renderView();
    await openDetailsModal(user);

    await user.click(screen.getByRole('button', { name: strings.SAVE_AND_CONTINUE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(await requests[0].json()).toMatchObject({
      description: 'Dry forest restoration',
      name: SITE_NAME,
      organizationId: 1,
      projectId: RESTORATION.id,
      siteEditStep: 'site_boundary',
      siteType: 'Detailed',
    });
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(EDIT_ROUTE));
  });

  it('keeps the details open and stays on the draft when the save fails', async () => {
    mockError('put', DRAFT_URL);

    const { user } = renderView();
    await openDetailsModal(user);

    await user.click(screen.getByRole('button', { name: strings.SAVE_AND_CONTINUE }));

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    expect(screen.getByText(strings.EDIT_DETAILS)).toBeInTheDocument();
    expect(screen.getByTestId('location').textContent).toBe(DRAFT_ROUTE);
  });

  it('spells out the map problems the server rejected the save for', async () => {
    // The draft API rejects a map that fails validation with a 409 listing what is wrong with it.
    server.use(
      http.put(DRAFT_URL, () =>
        HttpResponse.json({ status: 'error', problems: [{ problemType: 'SiteTooLarge' }] }, { status: 409 })
      )
    );

    const { user } = renderView();
    await openDetailsModal(user);

    await user.click(screen.getByRole('button', { name: strings.SAVE_AND_CONTINUE }));

    expect(await screen.findByText(strings.PLANTING_SITE_MAP_HAS_PROBLEMS)).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_SITE_PROBLEM_SITE_TOO_LARGE)).toBeInTheDocument();
    expect(screen.getByText(strings.EDIT_DETAILS)).toBeInTheDocument();
  });
});

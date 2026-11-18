import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw/http';

import PlantingSiteTypeSelect from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteTypeSelect';
import strings from 'src/strings';
import { captureRequests, mockError, mockGet, renderWithProviders, server } from 'src/test-utils';

// The site editor is only offered on a desktop-sized screen, so the flow starts there unless a
// test says otherwise.
const device = rstest.hoisted(() => ({ isDesktop: true }));

rstest.mock('src/utils/useDeviceInfo', () => ({
  __esModule: true,
  default: () => ({ isDesktop: device.isDesktop, isMobile: !device.isDesktop }),
}));

const SEARCH_URL = '/api/v1/search';
const PROJECTS_URL = '/api/v1/projects';
const DRAFT_SITES_URL = '/api/v1/tracking/draftSites';

const NEW_DRAFT_ID = 42;

/** Renders the current location so a test can assert on where creating a draft went. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

/** The details step looks up the existing site and draft names to check for duplicates. */
const mockNameSearches = () => {
  server.use(http.post(SEARCH_URL, () => HttpResponse.json({ status: 'ok', results: [] })));
};

const renderTypeSelect = () => {
  mockNameSearches();
  mockGet(PROJECTS_URL, { projects: [] });

  const onClose = rstest.fn();
  const buildUi = () => (
    <>
      <PlantingSiteTypeSelect onClose={onClose} />
      <LocationProbe />
    </>
  );

  return { onClose, buildUi, ...renderWithProviders(buildUi()) };
};

/**
 * The thing a user clicks to pick a site type is a plain `div` with no role and no accessible
 * name, so there is nothing to query it by: reach it from the title rendered beside it.
 */
const chooseSiteType = (user: UserEvent, title: string) => {
  const option = screen.getByText(title).parentElement?.firstElementChild;
  if (!option) {
    throw new Error(`No site type option titled "${title}"`);
  }
  return user.click(option);
};

/** `Textfield` points its `<label for>` at a wrapper div rather than the input it wraps. */
const nameField = () => document.querySelector('#name input') as HTMLInputElement;

const nextButton = () => screen.getByRole('button', { name: strings.NEXT });

/** Walk from the type choice through to a named site, ready to be created. */
const fillInNewSite = async (user: UserEvent, name = 'Kaupulehu', siteType = strings.DETAILED_SITE) => {
  await chooseSiteType(user, siteType);
  await user.click(nextButton());
  await user.type(nameField(), name);
  await waitFor(() => expect(nextButton()).toBeEnabled());
};

/**
 * jsdom matches no media query at all, so stand in for a tablet-sized screen held in portrait —
 * the one case where the editor is unavailable on an otherwise desktop-sized screen.
 */
const holdScreenInPortrait = () => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('orientation: portrait'),
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

// jsdom may not implement `matchMedia` at all, in which case there is nothing to put back.
const originalMatchMedia = window.matchMedia?.bind(window);

beforeEach(() => {
  device.isDesktop = true;
});

afterEach(() => {
  if (originalMatchMedia) {
    window.matchMedia = originalMatchMedia;
  } else {
    Reflect.deleteProperty(window, 'matchMedia');
  }
});

describe('PlantingSiteTypeSelect when the site editor is unavailable', () => {
  it('says the screen is too small and offers nothing else', async () => {
    device.isDesktop = false;
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { onClose, user } = renderTypeSelect();

    expect(screen.getByText(strings.FEATURE_NOT_AVAILABLE_AT_SCREEN_SIZE)).toBeInTheDocument();
    expect(screen.queryByText(strings.ADD_PLANTING_SITE_TITLE)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: strings.CLOSE }));

    expect(onClose).toHaveBeenCalled();
    expect(creates).toHaveLength(0);
  });

  it('asks for landscape rather than a different device when a tablet is held in portrait', () => {
    holdScreenInPortrait();

    renderTypeSelect();

    expect(screen.getByText(strings.SITE_EDITOR_USE_TABLET_LANDSCAPE)).toBeInTheDocument();
    expect(screen.queryByText(strings.ADD_PLANTING_SITE_TITLE)).not.toBeInTheDocument();
  });

  // Rotating a tablet to portrait part way through would otherwise throw away the details entered.
  it('carries on with the flow once it has started', async () => {
    const { buildUi, rerender, user } = renderTypeSelect();

    await fillInNewSite(user);

    device.isDesktop = false;
    rerender(buildUi());

    expect(nameField()).toHaveValue('Kaupulehu');
    expect(screen.queryByText(strings.FEATURE_NOT_AVAILABLE_AT_SCREEN_SIZE)).not.toBeInTheDocument();
  });
});

describe('PlantingSiteTypeSelect creating a draft site', () => {
  it('sends the name and the type chosen, and opens the new draft in the editor', async () => {
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { user } = renderTypeSelect();

    await fillInNewSite(user, 'Kaupulehu', strings.SIMPLE_SITE);
    await user.click(nextButton());

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toEqual({
      name: 'Kaupulehu',
      organizationId: 1,
      siteEditStep: 'site_boundary',
      siteType: 'Simple',
    });
    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(`/planting-sites/draft/${NEW_DRAFT_ID}/edit`)
    );
  });

  it('sends the detailed site type when that is what was chosen', async () => {
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { user } = renderTypeSelect();

    await fillInNewSite(user, 'Kaupulehu', strings.DETAILED_SITE);
    await user.click(nextButton());

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ siteType: 'Detailed' });
  });

  it('keeps the details and reports the failure when the draft cannot be created', async () => {
    mockError('post', DRAFT_SITES_URL);

    const { onClose, store, user } = renderTypeSelect();

    await fillInNewSite(user);
    await user.click(nextButton());

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Closing or navigating on failure would tell the user the site exists when it does not.
    expect(onClose).not.toHaveBeenCalled();
    expect(nameField()).toHaveValue('Kaupulehu');
    expect(screen.getByTestId('location')).toHaveTextContent('/');
  });

  it('creates nothing when the type choice is cancelled', async () => {
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { onClose, user } = renderTypeSelect();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(creates).toHaveLength(0);
  });

  it('creates nothing when the details are cancelled', async () => {
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { onClose, user } = renderTypeSelect();

    await fillInNewSite(user);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(creates).toHaveLength(0);
  });

  it('will not create a draft site without a name', async () => {
    const creates = captureRequests('post', DRAFT_SITES_URL, { id: NEW_DRAFT_ID });

    const { user } = renderTypeSelect();

    await chooseSiteType(user, strings.DETAILED_SITE);
    await user.click(nextButton());
    await waitFor(() => expect(nextButton()).toBeEnabled());
    await user.click(nextButton());

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });
});

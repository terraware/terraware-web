import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { PlantingSeasonPayload } from 'src/queries/generated/plantingSeasons';
import { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import AddPlantingSeasonModal from 'src/scenes/NurseryRouter/PlantingSeasons/AddPlantingSeasonModal';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  captureRequests,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  selectDropdownOption,
} from 'src/test-utils';

const SITE_ID = 1;
const OTHER_SITE_ID = 2;
const NEW_SEASON_ID = 99;
const SITES_URL = '/api/v1/tracking/sites';
const SITE_SPECIES_TARGETS_ROUTE = '/api/v1/tracking/sites/:siteId/speciesTargets';
const SEASONS_URL = '/api/v1/planting-seasons';
/** Matches any season id, so a call against the wrong one is caught rather than unhandled. */
const SEASON_SPECIES_TARGETS_ROUTE = '/api/v1/planting-seasons/:seasonId/species-targets';

/** Two strata so a site species target can be seeded across more than one substratum. */
const plantingSite = buildPlantingSite({
  id: SITE_ID,
  name: 'Kaupulehu',
  strata: [
    buildStratum({ id: 1, substrata: [buildSubstratum({ id: 1 }), buildSubstratum({ id: 2 })] }),
    buildStratum({ id: 2, substrata: [buildSubstratum({ id: 3 })] }),
  ],
});

const otherPlantingSite = buildPlantingSite({ id: OTHER_SITE_ID, name: 'Waikoloa', strata: [] });

const buildPlantingSeason = (overrides: Partial<PlantingSeasonPayload> = {}): PlantingSeasonPayload => ({
  endDate: '2026-09-30',
  id: 7,
  name: 'Winter 2026',
  plantingSiteId: SITE_ID,
  speciesTargets: [{ quantity: 100, speciesId: 10, substratumId: 1 }],
  startDate: '2026-06-01',
  status: 'Closed',
  ...overrides,
});

/** Renders the current location so a test can assert on where creating a season navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{`${location.pathname}${location.search}`}</div>;
};

// Web-components textfield labels target wrapper elements rather than inputs.
const seasonNameField = () => document.querySelector('#seasonName input') as HTMLInputElement;

const enterDate = async (user: UserEvent, label: string, isoDate: string) => {
  const field = screen.getByRole('textbox', { name: label });
  await user.click(field);
  await user.keyboard('{Control>}a{/Control}');
  await user.paste(isoDate);
};

const createButton = () => screen.getByRole('button', { name: strings.CREATE_SEASON });

/** Create is held until the chosen site's existing species targets are known, so wait for it. */
const create = async (user: UserEvent) => {
  await waitFor(() => expect(createButton()).toBeEnabled());
  await user.click(createButton());
};

const mockSites = (sites: PlantingSitePayload[]) => mockGet(SITES_URL, { sites });

type RenderOptions = {
  onClose?: () => void;
  sites?: PlantingSitePayload[];
  seasons?: PlantingSeasonPayload[];
  siteSpeciesTargets?: { speciesId: number; stratumIds: number[] }[];
};

const renderModal = ({ onClose = () => undefined, sites, seasons, siteSpeciesTargets }: RenderOptions = {}) => {
  mockSites(sites ?? [plantingSite]);
  mockGet(SEASONS_URL, { seasons: seasons ?? [] });
  mockGet(SITE_SPECIES_TARGETS_ROUTE, { targets: siteSpeciesTargets ?? [] });
  // Read to summarize what copying a season would bring over; tests that care override it.
  mockGet(SEASON_SPECIES_TARGETS_ROUTE, { targets: [] });

  return renderWithProviders(
    <>
      <AddPlantingSeasonModal onClose={onClose} />
      <LocationProbe />
    </>
  );
};

const fillSeason = async (user: UserEvent, name = 'Spring 2027') => {
  await user.type(seasonNameField(), name);
  await enterDate(user, strings.START_DATE_REQUIRED, '2027-03-01');
  await enterDate(user, strings.END_DATE_REQUIRED, '2027-05-31');
};

describe('AddPlantingSeasonModal validation', () => {
  it('flags every required field when nothing has been filled in', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal({ sites: [plantingSite, otherPlantingSite] });

    await user.click(createButton());

    // Planting site, season name, start date and end date are all required.
    expect(await screen.findAllByText(strings.REQUIRED_FIELD)).toHaveLength(4);
    expect(creates).toHaveLength(0);
  });

  it('will not create a season without a planting site', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal({ sites: [plantingSite, otherPlantingSite] });

    await fillSeason(user);
    await user.click(createButton());

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });

  it('will not create a season whose name is only whitespace', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal();

    await user.type(seasonNameField(), '   ');
    await enterDate(user, strings.START_DATE_REQUIRED, '2027-03-01');
    await enterDate(user, strings.END_DATE_REQUIRED, '2027-05-31');
    await create(user);

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });

  it('will not create a season that ends before it starts', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal();

    await user.type(seasonNameField(), 'Spring 2027');
    await enterDate(user, strings.START_DATE_REQUIRED, '2027-03-01');
    await enterDate(user, strings.END_DATE_REQUIRED, '2027-02-28');
    await create(user);

    expect(await screen.findByText(strings.END_DATE_ERROR)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });

  it('will not create a season that ends on the day it starts', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal();

    await user.type(seasonNameField(), 'Spring 2027');
    await enterDate(user, strings.START_DATE_REQUIRED, '2027-03-01');
    await enterDate(user, strings.END_DATE_REQUIRED, '2027-03-01');
    await create(user);

    expect(await screen.findByText(strings.END_DATE_ERROR)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });
});

describe('AddPlantingSeasonModal creating a season', () => {
  it('sends the trimmed name, the chosen planting site and the dates', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal({ sites: [plantingSite, otherPlantingSite] });

    await selectDropdownOption(user, 'plantingSite', 'Waikoloa');
    await fillSeason(user, '  Spring 2027  ');
    await create(user);

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toEqual({
      endDate: '2027-05-31',
      name: 'Spring 2027',
      plantingSiteId: OTHER_SITE_ID,
      startDate: '2027-03-01',
    });
  });

  it('uses the only planting site without making it be chosen', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal();

    await fillSeason(user);
    await create(user);

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ plantingSiteId: SITE_ID });
  });

  it('seeds the new season with a zero target for every substratum the site plants a species in', async () => {
    mockPost(SEASONS_URL, { id: NEW_SEASON_ID });
    const targetUpserts = captureRequests('put', SEASON_SPECIES_TARGETS_ROUTE);

    const { user } = renderModal({
      siteSpeciesTargets: [
        { speciesId: 10, stratumIds: [1] },
        { speciesId: 11, stratumIds: [2] },
      ],
    });

    await fillSeason(user);
    await create(user);

    await waitFor(() => expect(targetUpserts).toHaveLength(3));
    expect(targetUpserts.map((request) => new URL(request.url).pathname)).toEqual(
      Array(3).fill(`/api/v1/planting-seasons/${NEW_SEASON_ID}/species-targets`)
    );
    const bodies = await Promise.all(targetUpserts.map((request) => request.json()));
    expect(bodies).toEqual(
      expect.arrayContaining([
        { quantity: 0, speciesId: 10, substratumId: 1 },
        { quantity: 0, speciesId: 10, substratumId: 2 },
        { quantity: 0, speciesId: 11, substratumId: 3 },
      ])
    );
  });

  it('opens the new season on its species targets', async () => {
    mockPost(SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal();

    await fillSeason(user);
    await create(user);

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent(
        `/plants/planting-seasons/${NEW_SEASON_ID}?tab=species-targets`
      )
    );
  });

  it('keeps the modal open and reports the failure when the season cannot be created', async () => {
    const onClose = rstest.fn();
    mockError('post', SEASONS_URL);

    const { user, store } = renderModal({ onClose });

    await fillSeason(user);
    await create(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
    // Closing on failure would tell the user the season exists when it does not.
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText(strings.ADD_PLANTING_SEASON)).toBeInTheDocument();
  });

  it("reports the failure when the new season's species targets cannot be saved", async () => {
    mockPost(SEASONS_URL, { id: NEW_SEASON_ID });
    mockError('put', SEASON_SPECIES_TARGETS_ROUTE);

    const { user, store } = renderModal({ siteSpeciesTargets: [{ speciesId: 10, stratumIds: [2] }] });

    await fillSeason(user);
    await create(user);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
  });

  it('reports the failure when the site species targets cannot be loaded', async () => {
    mockSites([plantingSite]);
    mockGet(SEASONS_URL, { seasons: [] });
    mockError('get', SITE_SPECIES_TARGETS_ROUTE);

    const { store } = renderWithProviders(<AddPlantingSeasonModal onClose={() => undefined} />);

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        msg: strings.GENERIC_ERROR,
        priority: 'critical',
      })
    );
  });

  it('sends nothing when the modal is cancelled', async () => {
    const onClose = rstest.fn();
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal({ onClose });

    await fillSeason(user);
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(onClose).toHaveBeenCalled();
    expect(creates).toHaveLength(0);
  });
});

describe('AddPlantingSeasonModal copying a previous season', () => {
  const copyPreviousCheckbox = () => screen.findByRole('checkbox', { name: strings.COPY_PREVIOUS_SEASON });

  it('offers only the seasons of the selected site that have species targets', async () => {
    const { user } = renderModal({
      sites: [plantingSite, otherPlantingSite],
      seasons: [
        buildPlantingSeason({ id: 7, name: 'Winter 2026' }),
        buildPlantingSeason({ id: 8, name: 'Fallow 2026', speciesTargets: [] }),
      ],
    });

    await selectDropdownOption(user, 'plantingSite', 'Kaupulehu');
    await user.click(await copyPreviousCheckbox());
    await user.click(document.querySelector('#seasonToCopy input') as Element);

    const options = await screen.findByRole('list');
    expect(within(options).getByText('Winter 2026')).toBeInTheDocument();
    expect(within(options).queryByText('Fallow 2026')).not.toBeInTheDocument();
  });

  it('drops the copy option when the selected site has no season worth copying', async () => {
    const { user } = renderModal({
      sites: [plantingSite, otherPlantingSite],
      seasons: [buildPlantingSeason({ id: 7, name: 'Winter 2026' })],
    });

    await selectDropdownOption(user, 'plantingSite', 'Kaupulehu');
    await copyPreviousCheckbox();

    await selectDropdownOption(user, 'plantingSite', 'Waikoloa');

    await waitFor(() => expect(screen.queryByText(strings.COPY_PREVIOUS_SEASON)).not.toBeInTheDocument());
  });

  it('will not create a copy until a season to copy from is chosen', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });

    const { user } = renderModal({
      seasons: [buildPlantingSeason({ id: 7, name: 'Winter 2026' }), buildPlantingSeason({ id: 8, name: 'Fall 2026' })],
    });

    await user.click(await copyPreviousCheckbox());
    await fillSeason(user);
    await user.click(createButton());

    expect(await screen.findByText(strings.REQUIRED_FIELD)).toBeInTheDocument();
    expect(creates).toHaveLength(0);
  });

  it('copies from the chosen season instead of seeding targets from the site', async () => {
    const creates = captureRequests('post', SEASONS_URL, { id: NEW_SEASON_ID });
    const targetUpserts = captureRequests('put', SEASON_SPECIES_TARGETS_ROUTE);

    const { user } = renderModal({
      seasons: [buildPlantingSeason({ id: 7, name: 'Winter 2026' }), buildPlantingSeason({ id: 8, name: 'Fall 2026' })],
      siteSpeciesTargets: [{ speciesId: 10, stratumIds: [1] }],
    });

    await user.click(await copyPreviousCheckbox());
    await selectDropdownOption(user, 'seasonToCopy', 'Fall 2026');
    await fillSeason(user);
    await user.click(createButton());

    await waitFor(() => expect(creates).toHaveLength(1));
    expect(await creates[0].json()).toMatchObject({ fromPlantingSeasonId: 8 });
    expect(targetUpserts).toHaveLength(0);
  });

  it('says how many species and substrata the chosen season would copy', async () => {
    const { user } = renderModal({ seasons: [buildPlantingSeason({ id: 8, name: 'Fall 2026' })] });
    mockGet('/api/v1/planting-seasons/8/species-targets', {
      targets: [
        { quantity: 10, speciesId: 10, substratumId: 1 },
        { quantity: 20, speciesId: 10, substratumId: 2 },
        { quantity: 30, speciesId: 11, substratumId: 3 },
      ],
    });

    await user.click(await copyPreviousCheckbox());

    expect(
      await screen.findByText(strings.formatString(strings.COPYING_SPECIES_ACROSS_SUBSTRATUM, 2, 3).toString())
    ).toBeInTheDocument();
  });
});

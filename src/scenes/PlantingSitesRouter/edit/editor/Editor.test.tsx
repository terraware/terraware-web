import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import { FeatureCollection, MultiPolygon, Position } from 'geojson';
import { HttpResponse, http } from 'msw/http';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import ToastSnackbar from 'src/components/ToastSnackbar';
import Editor from 'src/scenes/PlantingSitesRouter/edit/editor/Editor';
import { defaultStratumPayload } from 'src/scenes/PlantingSitesRouter/edit/editor/utils';
import strings from 'src/strings';
import {
  buildDraftPlantingSite,
  captureRequests,
  mockDelete,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';
import { CreateDraftPlantingSiteRequestPayload, DraftPlantingSite, SiteEditStep } from 'src/types/PlantingSite';
import { fromDraft } from 'src/utils/draftPlantingSiteUtils';

// Mapbox needs a real GL context, so stand in for the map: name the read-only layers so a test can
// tell which step is showing, and expose the drawing of a boundary as a plain button.
const mapEdit = rstest.hoisted(() => ({ boundary: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/NewMap/EditableMap', () => {
  const MockEditableMap = ({ drawer, onEditableBoundaryChanged, overlay, readOnlyBoundary }: EditableMapProps) => (
    <div>
      <span>{`map layers: ${(readOnlyBoundary ?? []).map((layer) => layer.id).join(',') || 'none'}`}</span>
      <button onClick={() => onEditableBoundaryChanged(mapEdit.boundary)}>map edit boundary</button>
      {drawer}
      {overlay}
    </div>
  );

  return { __esModule: true, default: MockEditableMap };
});

// the layout only offers the editor on desktop
rstest.mock('src/utils/useDeviceInfo', () => ({
  __esModule: true,
  default: () => ({ isDesktop: true, isMobile: false }),
}));

/** Renders the current location so a test can assert on where the editor navigated. */
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const square = (west: number, south: number, east: number, north: number): Position[][] => [
  [
    [west, south],
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ],
];

const multiPolygon = (...polygons: Position[][][]): MultiPolygon => ({ type: 'MultiPolygon', coordinates: polygons });

const featureCollection = (geometry: MultiPolygon): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [{ type: 'Feature', id: 1, properties: {}, geometry }],
});

// ~2.2km by 1.1km: large enough to clear the minimum polygon size, small enough to stay under the
// bounding box limit, so neither error path interferes
const SITE_BOUNDARY = multiPolygon(square(0, 0, 0.02, 0.01));

const DRAFT_URL = '/api/v1/tracking/draftSites/1';
const VALIDATE_URL = '/api/v1/tracking/sites/validate';
const CREATE_URL = '/api/v1/tracking/sites';
const EDIT_ROUTE = '/planting-sites/draft/1/edit';
const PLANTING_SITES = '/planting-sites';

/** A site part way through the flow, with a boundary and the single stratum the editor defaults to. */
const siteAtStep = (siteEditStep: SiteEditStep, siteType: DraftPlantingSite['siteType'] = 'Detailed') =>
  buildDraftPlantingSite({
    boundary: SITE_BOUNDARY,
    siteEditStep,
    siteType,
    strata: [defaultStratumPayload({ boundary: SITE_BOUNDARY, id: 1, initialPlantingDensity: 1500, name: 'A' })],
  });

/**
 * Stands in for the draft the server holds: the GET reflects whatever the last PUT stored, which is
 * what the editor reads back after saving a step.
 */
const mockDraftServer = (site: DraftPlantingSite, persisted: DraftPlantingSite = site) => {
  const puts: Request[] = [];
  let stored = {
    ...fromDraft(persisted),
    createdBy: persisted.createdBy,
    id: persisted.id,
    strata: fromDraft(persisted).strata ?? [],
  };

  server.use(
    http.get(DRAFT_URL, () => HttpResponse.json({ site: stored, status: 'ok' })),
    http.put(DRAFT_URL, async ({ request }) => {
      puts.push(request.clone());
      const body = (await request.json()) as CreateDraftPlantingSiteRequestPayload;
      stored = { ...stored, ...body, strata: body.strata ?? [] };
      return HttpResponse.json({ status: 'ok' });
    })
  );

  return puts;
};

const renderEditor = (site: DraftPlantingSite = buildDraftPlantingSite(), persisted?: DraftPlantingSite) => {
  const puts = mockDraftServer(site, persisted ?? site);
  const result = renderWithProviders(
    <>
      <ToastSnackbar />
      <Editor site={site} />
      <LocationProbe />
    </>,
    {
      // the steps' tutorial dialogs open on mount otherwise, and cover the map
      currentUser: {
        userPreferences: {
          'dont-show-site-boundary-instructions': true,
          'dont-show-site-stratum-boundaries-instructions': true,
        },
      },
      route: EDIT_ROUTE,
    }
  );

  return { ...result, puts };
};

type User = ReturnType<typeof renderEditor>['user'];

const clickButton = async (user: User, name: string) => user.click(screen.getByRole('button', { name }));

// the edit route starts with the planting sites path, so compare the whole path rather than match on part of it
const currentPath = () => screen.getByTestId('location').textContent;

// each boundary method tile's accessible name is its label followed by its description
const drawBoundary = async (user: User) => {
  await user.click(
    screen.getByRole('button', { name: (name: string) => name.startsWith(strings.DRAW_BOUNDARY_WITHIN_MAP) })
  );
  await user.click(screen.getByRole('button', { name: 'map edit boundary' }));
  await waitFor(() => expect(screen.getByRole('button', { name: strings.NEXT })).toBeEnabled());
};

describe('Editor', () => {
  beforeEach(() => {
    mapEdit.boundary = featureCollection(SITE_BOUNDARY);
    mockPost(VALIDATE_URL, { isValid: true, problems: [] });
  });

  describe('header buttons', () => {
    it('offers nothing but Cancel until a boundary is drawn', async () => {
      renderEditor();

      expect(await screen.findByRole('button', { name: strings.CANCEL })).toBeEnabled();
      expect(screen.getByRole('button', { name: strings.SAVE_AND_EXIT })).toBeDisabled();
      expect(screen.getByRole('button', { name: strings.CREATE_SITE })).toBeDisabled();
      expect(screen.getByRole('button', { name: strings.NEXT })).toBeDisabled();
      expect(screen.queryByRole('button', { name: strings.BACK })).not.toBeInTheDocument();
    });

    it('enables saving and Next once a boundary is drawn, but not Create Site', async () => {
      const { user } = renderEditor();

      await drawBoundary(user);

      expect(screen.getByRole('button', { name: strings.SAVE_AND_EXIT })).toBeEnabled();
      expect(screen.getByRole('button', { name: strings.NEXT })).toBeEnabled();
      expect(screen.getByRole('button', { name: strings.CREATE_SITE })).toBeDisabled();
      expect(screen.queryByRole('button', { name: strings.BACK })).not.toBeInTheDocument();
    });

    it('offers Back and Create Site once the user is past the site boundary', async () => {
      renderEditor(siteAtStep('exclusion_areas'));

      expect(await screen.findByRole('button', { name: strings.BACK })).toBeEnabled();
      expect(screen.getByRole('button', { name: strings.CREATE_SITE })).toBeEnabled();
      expect(screen.getByRole('button', { name: strings.NEXT })).toBeEnabled();
    });

    it('drops Next on the last step', async () => {
      renderEditor(siteAtStep('substratum_boundaries'));

      expect(await screen.findByRole('button', { name: strings.CREATE_SITE })).toBeEnabled();
      expect(screen.queryByRole('button', { name: strings.NEXT })).not.toBeInTheDocument();
    });
  });

  describe('Next', () => {
    it('saves the draft and moves on', async () => {
      const { puts, user } = renderEditor();

      await drawBoundary(user);
      await clickButton(user, strings.NEXT);

      await waitFor(() => expect(puts).toHaveLength(1));
      expect(await puts[0].json()).toMatchObject({ boundary: SITE_BOUNDARY, siteEditStep: 'exclusion_areas' });
      expect(await screen.findByText(strings.PLANTING_SITE_SAVED_AS_DRAFT)).toBeInTheDocument();
      expect(await screen.findByText('map layers: site')).toBeInTheDocument();
    });

    it('records the step it moved to without reporting a save when nothing changed', async () => {
      const { puts, user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.NEXT);

      expect(await screen.findByText('map layers: site,stratum')).toBeInTheDocument();
      await waitFor(() => expect(puts).toHaveLength(1));
      expect(await puts[0].json()).toMatchObject({ siteEditStep: 'stratum_boundaries' });
      expect(screen.queryByText(strings.PLANTING_SITE_SAVED_AS_DRAFT)).not.toBeInTheDocument();
    });

    it('records the step against the draft the server holds, not the copy the editor started with', async () => {
      const site = siteAtStep('exclusion_areas');
      // another editor reshaped the site after this editor was handed its copy
      const theirBoundary = multiPolygon(square(0, 0, 0.03, 0.02));
      const { puts, user } = renderEditor(site, { ...site, boundary: theirBoundary });

      await clickButton(user, strings.NEXT);

      await waitFor(() => expect(puts).toHaveLength(1));
      expect(await puts[0].json()).toMatchObject({ boundary: theirBoundary, siteEditStep: 'stratum_boundaries' });
    });
  });

  describe('Save and exit', () => {
    it('saves the draft and returns to the planting sites list', async () => {
      const { puts, user } = renderEditor();

      await drawBoundary(user);
      await clickButton(user, strings.SAVE_AND_EXIT);

      await waitFor(() => expect(puts).toHaveLength(1));
      expect(await puts[0].json()).toMatchObject({ boundary: SITE_BOUNDARY });
      expect(await screen.findByText(strings.PLANTING_SITE_SAVED_AS_DRAFT)).toBeInTheDocument();
      expect(currentPath()).toBe(PLANTING_SITES);
    });
  });

  describe('Create Site', () => {
    it('creates the site from the last step and returns to the planting sites list', async () => {
      const creates = captureRequests('post', CREATE_URL, { id: 42 });
      mockDelete(DRAFT_URL);
      const { puts, user } = renderEditor(siteAtStep('substratum_boundaries'));

      await clickButton(user, strings.CREATE_SITE);

      await waitFor(() => expect(creates).toHaveLength(1));
      expect(await creates[0].json()).toMatchObject({ boundary: SITE_BOUNDARY, name: 'Draft Planting Site' });
      expect(await screen.findByText(strings.PLANTING_SITE_CREATED)).toBeInTheDocument();
      expect(currentPath()).toBe(PLANTING_SITES);
      expect(puts).toHaveLength(0);
    });
  });

  describe('Cancel', () => {
    it('leaves without asking when nothing has been drawn', async () => {
      const { user } = renderEditor();

      await clickButton(user, strings.CANCEL);

      expect(currentPath()).toBe(PLANTING_SITES);
      expect(screen.queryByText(strings.CANCEL_SITE_SETUP)).not.toBeInTheDocument();
    });

    it('asks before discarding the removal of a saved boundary', async () => {
      const { user } = renderEditor(siteAtStep('site_boundary'));

      mapEdit.boundary = undefined;
      await user.click(await screen.findByRole('button', { name: 'map edit boundary' }));
      await waitFor(() => expect(screen.getByRole('button', { name: strings.NEXT })).toBeDisabled());
      await clickButton(user, strings.CANCEL);

      const dialog = await screen.findByRole('dialog', { name: strings.CANCEL_SITE_SETUP });
      expect(within(dialog).getByRole('button', { name: strings.DISCARD_CHANGES })).toBeInTheDocument();
      expect(currentPath()).toBe(EDIT_ROUTE);
    });

    it('keeps the drawn boundary when the user chooses to keep editing', async () => {
      const { user } = renderEditor();

      await drawBoundary(user);
      await clickButton(user, strings.CANCEL);

      const dialog = await screen.findByRole('dialog', { name: strings.CANCEL_SITE_SETUP });
      await user.click(within(dialog).getByRole('button', { name: strings.KEEP_EDITING }));

      await waitFor(() => expect(screen.queryByText(strings.CANCEL_SITE_SETUP)).not.toBeInTheDocument());
      expect(currentPath()).toBe(EDIT_ROUTE);
    });

    it('discards the drawn boundary and leaves', async () => {
      const { puts, user } = renderEditor();

      await drawBoundary(user);
      await clickButton(user, strings.CANCEL);

      const dialog = await screen.findByRole('dialog', { name: strings.CANCEL_SITE_SETUP });
      await user.click(within(dialog).getByRole('button', { name: strings.DISCARD_CHANGES }));

      expect(currentPath()).toBe(PLANTING_SITES);
      expect(puts).toHaveLength(0);
    });

    it('offers a plain exit when there is nothing unsaved to discard', async () => {
      const { user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.CANCEL);

      const dialog = await screen.findByRole('dialog', { name: strings.CANCEL_SITE_SETUP });
      expect(within(dialog).queryByRole('button', { name: strings.DISCARD_CHANGES })).not.toBeInTheDocument();

      await user.click(within(dialog).getByRole('button', { name: strings.EXIT_SETUP }));

      expect(currentPath()).toBe(PLANTING_SITES);
    });
  });

  describe('creating a detailed site before its strata are set up', () => {
    const creates = () => captureRequests('post', CREATE_URL, { id: 42 });

    it('warns that the site would have no strata', async () => {
      const posts = creates();
      const { user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.CREATE_SITE);

      const dialog = await screen.findByRole('dialog', { name: strings.CREATE_SITE_WITHOUT_STRATA });
      expect(within(dialog).getByText(strings.CREATE_SITE_WITHOUT_STRATA_MESSAGE)).toBeInTheDocument();
      expect(posts).toHaveLength(0);
    });

    it('creates the site anyway when the user confirms', async () => {
      const posts = creates();
      mockDelete(DRAFT_URL);
      const { user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.CREATE_SITE);
      const dialog = await screen.findByRole('dialog', { name: strings.CREATE_SITE_WITHOUT_STRATA });
      await user.click(within(dialog).getByRole('button', { name: strings.CREATE_SITE }));

      await waitFor(() => expect(posts).toHaveLength(1));
      expect(await screen.findByText(strings.PLANTING_SITE_CREATED)).toBeInTheDocument();
      expect(currentPath()).toBe(PLANTING_SITES);
    });

    it('moves to the strata step instead when the user continues setup', async () => {
      const posts = creates();
      const { user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.CREATE_SITE);
      const dialog = await screen.findByRole('dialog', { name: strings.CREATE_SITE_WITHOUT_STRATA });
      await user.click(within(dialog).getByRole('button', { name: strings.CONTINUE_SETUP }));

      expect(await screen.findByText('map layers: site,stratum')).toBeInTheDocument();
      expect(posts).toHaveLength(0);
    });

    it('still warns after the user has looked at the strata step without drawing any', async () => {
      const posts = creates();
      const { user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.NEXT);
      expect(await screen.findByText('map layers: site,stratum')).toBeInTheDocument();
      await clickButton(user, strings.BACK);
      expect(await screen.findByText('map layers: site')).toBeInTheDocument();

      await clickButton(user, strings.CREATE_SITE);

      expect(await screen.findByRole('dialog', { name: strings.CREATE_SITE_WITHOUT_STRATA })).toBeInTheDocument();
      expect(posts).toHaveLength(0);
    });

    it('does not warn a simple site, which has no strata step to skip', async () => {
      const posts = creates();
      mockDelete(DRAFT_URL);
      const { user } = renderEditor(siteAtStep('exclusion_areas', 'Simple'));

      await clickButton(user, strings.CREATE_SITE);

      await waitFor(() => expect(posts).toHaveLength(1));
      expect(screen.queryByText(strings.CREATE_SITE_WITHOUT_STRATA)).not.toBeInTheDocument();
      expect(await screen.findByText(strings.PLANTING_SITE_CREATED)).toBeInTheDocument();
    });
  });

  describe('a draft the server reports problems with', () => {
    const EXCLUDED_SUBSTRATUM = {
      problemType: 'SubstratumInExclusionArea',
      stratum: 'Stratum 01',
      substratum: 'Excluded',
    };
    const problemText = 'Substratum Excluded in stratum Stratum 01 is inside an exclusion area.';

    it('lists the problems instead of saving when the user saves and exits', async () => {
      mockPost(VALIDATE_URL, { isValid: false, problems: [EXCLUDED_SUBSTRATUM] });
      const { puts, user } = renderEditor(siteAtStep('substratum_boundaries'));

      await clickButton(user, strings.SAVE_AND_EXIT);

      const dialog = await screen.findByRole('dialog', { name: strings.DRAFT_PLANTING_SITE_HAS_PROBLEMS });
      expect(within(dialog).getByText(problemText)).toBeInTheDocument();
      expect(puts).toHaveLength(0);
      expect(currentPath()).toBe(EDIT_ROUTE);
    });

    it('returns to the step being edited when the user goes back to edit', async () => {
      mockPost(VALIDATE_URL, { isValid: false, problems: [EXCLUDED_SUBSTRATUM] });
      const { puts, user } = renderEditor(siteAtStep('substratum_boundaries'));

      await clickButton(user, strings.SAVE_AND_EXIT);
      const dialog = await screen.findByRole('dialog', { name: strings.DRAFT_PLANTING_SITE_HAS_PROBLEMS });
      await user.click(within(dialog).getByRole('button', { name: strings.BACK_TO_EDIT }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(puts).toHaveLength(0);
      expect(currentPath()).toBe(EDIT_ROUTE);
    });

    it('saves and leaves anyway when the user confirms', async () => {
      mockPost(VALIDATE_URL, { isValid: false, problems: [EXCLUDED_SUBSTRATUM] });
      const { puts, user } = renderEditor(siteAtStep('substratum_boundaries'));

      await clickButton(user, strings.SAVE_AND_EXIT);
      const dialog = await screen.findByRole('dialog', { name: strings.DRAFT_PLANTING_SITE_HAS_PROBLEMS });
      await user.click(within(dialog).getByRole('button', { name: strings.SAVE_ANYWAY }));

      await waitFor(() => expect(puts).toHaveLength(1));
      expect(await screen.findByText(strings.PLANTING_SITE_SAVED_AS_DRAFT)).toBeInTheDocument();
      expect(currentPath()).toBe(PLANTING_SITES);
    });
  });

  describe('Back', () => {
    it('returns to the previous step without saving', async () => {
      const { puts, user } = renderEditor(siteAtStep('exclusion_areas'));

      await clickButton(user, strings.BACK);

      expect(await screen.findByText('map layers: none')).toBeInTheDocument();
      expect(puts).toHaveLength(0);
      expect(screen.queryByText(strings.PLANTING_SITE_SAVED_AS_DRAFT)).not.toBeInTheDocument();
    });
  });
});

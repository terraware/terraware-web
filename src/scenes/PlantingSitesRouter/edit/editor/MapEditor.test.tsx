import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';
import bbox from '@turf/bbox';
import { FeatureCollection, MultiPolygon, Position } from 'geojson';
import { HttpResponse, http } from 'msw/http';

import type { EditableMapProps } from 'src/components/NewMap/EditableMap';
import ToastSnackbar from 'src/components/ToastSnackbar';
import type { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import { EditorModeContext } from 'src/scenes/PlantingSitesRouter/edit/editor/EditorModeContext';
import MapEditor from 'src/scenes/PlantingSitesRouter/edit/editor/MapEditor';
import strings from 'src/strings';
import {
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  dialogTitled,
  renderWithProviders,
  server,
} from 'src/test-utils';

// Mapbox needs a real GL context, so stand in for the map: record what each render was handed,
// name the read-only layers so a test can tell which step is showing, and expose an edit button.
type MapRender = Pick<EditableMapProps, 'editableBoundary' | 'readOnlyBoundary'>;
const mapRenders = rstest.hoisted(() => [] as MapRender[]);
const mapEdit = rstest.hoisted(() => ({ boundary: undefined as FeatureCollection | undefined }));

rstest.mock('src/components/NewMap/EditableMap', () => {
  const MockEditableMap = ({
    drawer,
    editableBoundary,
    onEditableBoundaryChanged,
    overlay,
    readOnlyBoundary,
  }: EditableMapProps) => {
    mapRenders.push({ editableBoundary, readOnlyBoundary });
    return (
      <div>
        <span>{`map layers: ${(readOnlyBoundary ?? []).map((layer) => layer.id).join(',') || 'none'}`}</span>
        <button onClick={() => onEditableBoundaryChanged(mapEdit.boundary)}>map edit boundary</button>
        {drawer}
        {overlay}
      </div>
    );
  };

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

// ~2.2km by 1.1km, split into two ~1.1km strata with one substratum each
const SITE_BOUNDARY = multiPolygon(square(0, 0, 0.02, 0.01));
const WEST_BOUNDARY = multiPolygon(square(0, 0, 0.01, 0.01));
const EAST_BOUNDARY = multiPolygon(square(0.01, 0, 0.02, 0.01));
const EXCLUSION = multiPolygon(square(0.002, 0.002, 0.008, 0.008));

const buildSite = (plantingCompleted: boolean) =>
  buildPlantingSite({
    boundary: SITE_BOUNDARY,
    id: 1,
    name: 'Existing Site',
    strata: [
      buildStratum({
        boundary: WEST_BOUNDARY,
        id: 10,
        name: 'West',
        substrata: [
          buildSubstratum({ boundary: WEST_BOUNDARY, fullName: 'West-1', id: 100, name: '1', plantingCompleted }),
        ],
      }),
      buildStratum({
        boundary: EAST_BOUNDARY,
        id: 11,
        name: 'East',
        substrata: [
          buildSubstratum({ boundary: EAST_BOUNDARY, fullName: 'East-1', id: 110, name: '1', plantingCompleted }),
        ],
      }),
    ],
  });

const site = buildSite(false);
const completedSite = buildSite(true);

// cuts the east stratum in half, so only its substratum's boundary changes
const SHRUNK_SITE_BOUNDARY = multiPolygon(square(0, 0, 0.015, 0.01));

const MAP_URL = '/api/v1/tracking/sites/1/map';
const EDIT_ROUTE = '/planting-sites/1/edit';
const SITE_VIEW_PATH = '/planting-sites/1';

const renderMapEditor = (editedSite: PlantingSitePayload = site) =>
  renderWithProviders(
    <EditorModeContext.Provider value='edit'>
      <ToastSnackbar />
      <MapEditor site={editedSite} />
      <LocationProbe />
    </EditorModeContext.Provider>,
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

type User = ReturnType<typeof renderMapEditor>['user'];

const lastMapRender = (): MapRender => mapRenders[mapRenders.length - 1];

const readOnlyLayer = (id: string) => lastMapRender()?.readOnlyBoundary?.find((layer) => layer.id === id)?.data;

const nextTo = async (user: User, layers: string) => {
  await user.click(screen.getByRole('button', { name: strings.NEXT }));
  expect(await screen.findByText(`map layers: ${layers}`)).toBeInTheDocument();
};

const backTo = async (user: User, layers: string) => {
  await user.click(screen.getByRole('button', { name: strings.BACK }));
  expect(await screen.findByText(`map layers: ${layers}`)).toBeInTheDocument();
};

const goToFinalStep = async (user: User) => {
  await nextTo(user, 'site');
  await nextTo(user, 'site,stratum');
  await nextTo(user, 'stratum,substratum');
};

const editSiteBoundary = async (user: User, boundary: MultiPolygon) => {
  mapEdit.boundary = featureCollection(boundary);
  await user.click(screen.getByRole('button', { name: 'map edit boundary' }));
  await waitFor(() => expect(lastMapRender()?.editableBoundary).toEqual(mapEdit.boundary));
};

const saveRequests = (requests: Request[]) => requests.filter((request) => !request.url.includes('dryRun=true'));

const captureSaves = () => {
  const requests: Request[] = [];
  server.use(
    http.put(MAP_URL, ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json({ status: 'ok' });
    })
  );
  return requests;
};

describe('MapEditor', () => {
  beforeEach(() => {
    mapRenders.length = 0;
    mapEdit.boundary = undefined;
  });

  it('shows Edit Planting Site with all four steps', async () => {
    renderMapEditor();

    expect(await screen.findByText(strings.EDIT_PLANTING_SITE)).toBeInTheDocument();
    expect(screen.getByText(strings.SITE_BOUNDARY)).toBeInTheDocument();
    expect(screen.getByText(strings.EXCLUSION_AREAS)).toBeInTheDocument();
    expect(screen.getByText(strings.STRATUM_BOUNDARIES)).toBeInTheDocument();
    expect(screen.getByText(strings.SUBSTRATUM_BOUNDARIES)).toBeInTheDocument();

    // starts on the site boundary step, with the existing boundary open for editing
    expect(screen.queryByRole('button', { name: strings.BACK })).not.toBeInTheDocument();
    expect(bbox(lastMapRender().editableBoundary!)).toEqual([0, 0, 0.02, 0.01]);
    expect(screen.getByRole('button', { name: strings.SAVE_CHANGES })).toBeDisabled();
  });

  it('close without changes navigates to the site view', async () => {
    const { user } = renderMapEditor();

    await user.click(await screen.findByRole('button', { name: strings.CLOSE }));

    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
    expect(screen.queryByText(strings.CLOSE_SITE_EDITOR)).not.toBeInTheDocument();
  });

  it('close with changes asks to discard, without a save-as-draft button', async () => {
    const { user } = renderMapEditor();

    await editSiteBoundary(user, WEST_BOUNDARY);
    await user.click(screen.getByRole('button', { name: strings.CLOSE }));

    expect(await screen.findByText(strings.CLOSE_SITE_EDITOR)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.KEEP_EDITING })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.SAVE_AND_CLOSE })).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(EDIT_ROUTE);

    await user.click(screen.getByRole('button', { name: strings.DISCARD_CHANGES }));

    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });

  it('saves on the final step and sends only server ids', async () => {
    const requests: Request[] = [];
    server.use(
      http.put(MAP_URL, ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json({ status: 'ok' });
      })
    );
    const { user } = renderMapEditor();

    await goToFinalStep(user);
    expect(requests).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    await waitFor(() => expect(saveRequests(requests)).toHaveLength(1));
    expect(await saveRequests(requests)[0].json()).toEqual({
      boundary: SITE_BOUNDARY,
      strata: [
        { id: 10, name: 'West', substrata: [{ boundary: WEST_BOUNDARY, id: 100, name: '1' }] },
        { id: 11, name: 'East', substrata: [{ boundary: EAST_BOUNDARY, id: 110, name: '1' }] },
      ],
    });
    expect(await screen.findByText(strings.CHANGES_SAVED)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });

  it('keeps edits after a 409', async () => {
    const requests: Request[] = [];
    server.use(
      http.put(MAP_URL, ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json(
          { error: { message: 'Conflict' }, problems: [{ problemType: 'SiteTooLarge' }], status: 'error' },
          { status: 409 }
        );
      })
    );
    const { user } = renderMapEditor();

    await editSiteBoundary(user, WEST_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    expect(await screen.findByText(strings.PLANTING_SITE_MAP_PROBLEMS_TITLE)).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_SITE_PROBLEM_SITE_TOO_LARGE)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.SAVE_ANYWAY })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: strings.BACK_TO_EDIT }));

    await waitFor(() => expect(screen.queryByText(strings.PLANTING_SITE_MAP_PROBLEMS_TITLE)).not.toBeInTheDocument());
    expect(screen.getByTestId('location')).toHaveTextContent(EDIT_ROUTE);

    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    await waitFor(() => expect(saveRequests(requests)).toHaveLength(2));
    const retried = (await saveRequests(requests)[1].json()) as { boundary: MultiPolygon };
    expect(bbox(retried.boundary)).toEqual([0, 0, 0.01, 0.01]);
  });

  it('back with dirty step applies its data', async () => {
    const { user } = renderMapEditor();

    await editSiteBoundary(user, WEST_BOUNDARY);
    await nextTo(user, 'site');
    expect(bbox(readOnlyLayer('site')!)).toEqual([0, 0, 0.01, 0.01]);

    mapEdit.boundary = featureCollection(EXCLUSION);
    await user.click(screen.getByRole('button', { name: 'map edit boundary' }));
    await waitFor(() => expect(lastMapRender()?.editableBoundary).toEqual(mapEdit.boundary));
    await backTo(user, 'none');

    expect(bbox(lastMapRender().editableBoundary!)).toEqual([0, 0, 0.01, 0.01]);

    await nextTo(user, 'site');

    expect(bbox(readOnlyLayer('site')!)).toEqual([0, 0, 0.01, 0.01]);
    expect(bbox(lastMapRender().editableBoundary!)).toEqual([0.002, 0.002, 0.008, 0.008]);
  });
  it('asks which substrata to mark incomplete', async () => {
    const requests = captureSaves();
    const { user } = renderMapEditor(completedSite);

    await editSiteBoundary(user, SHRUNK_SITE_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    expect(await screen.findByText(strings.MARK_SUBSTRATA_INCOMPLETE)).toBeInTheDocument();
    const dialog = dialogTitled(strings.MARK_SUBSTRATA_INCOMPLETE);
    expect(within(dialog).getByText(strings.MARK_SUBSTRATA_INCOMPLETE_MESSAGE)).toBeInTheDocument();
    expect(saveRequests(requests)).toHaveLength(0);

    const checkbox = within(dialog).getByRole('checkbox', { name: 'East-1' });
    expect(checkbox).not.toBeChecked();
    expect(within(dialog).queryByRole('checkbox', { name: 'West-1' })).not.toBeInTheDocument();

    await user.click(checkbox);
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE_CHANGES }));

    await waitFor(() => expect(saveRequests(requests)).toHaveLength(1));
    expect(await saveRequests(requests)[0].json()).toMatchObject({ substratumIdsToMarkIncomplete: [110] });
    expect(await screen.findByText(strings.CHANGES_SAVED)).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });

  it('keeps substrata selected to mark incomplete after a failed save', async () => {
    server.use(
      http.put(MAP_URL, () =>
        HttpResponse.json(
          { error: { message: 'Conflict' }, problems: [{ problemType: 'SiteTooLarge' }], status: 'error' },
          { status: 409 }
        )
      )
    );
    const { user } = renderMapEditor(completedSite);

    await editSiteBoundary(user, SHRUNK_SITE_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));
    const dialog = await screen.findByRole('dialog', { name: strings.MARK_SUBSTRATA_INCOMPLETE });
    await user.click(within(dialog).getByRole('checkbox', { name: 'East-1' }));
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE_CHANGES }));

    await user.click(await screen.findByRole('button', { name: strings.BACK_TO_EDIT }));
    await waitFor(() => expect(screen.queryByText(strings.PLANTING_SITE_MAP_PROBLEMS_TITLE)).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    const retryDialog = await screen.findByRole('dialog', { name: strings.MARK_SUBSTRATA_INCOMPLETE });
    expect(within(retryDialog).getByRole('checkbox', { name: 'East-1' })).toBeChecked();
  });

  it('starting over clears substrata selected to mark incomplete', async () => {
    server.use(
      http.put(MAP_URL, () =>
        HttpResponse.json(
          { error: { message: 'Conflict' }, problems: [{ problemType: 'SiteTooLarge' }], status: 'error' },
          { status: 409 }
        )
      )
    );
    const { user } = renderMapEditor(completedSite);

    await editSiteBoundary(user, SHRUNK_SITE_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));
    const dialog = await screen.findByRole('dialog', { name: strings.MARK_SUBSTRATA_INCOMPLETE });
    await user.click(within(dialog).getByRole('checkbox', { name: 'East-1' }));
    await user.click(within(dialog).getByRole('button', { name: strings.SAVE_CHANGES }));

    await user.click(await screen.findByRole('button', { name: strings.BACK_TO_EDIT }));
    await waitFor(() => expect(screen.queryByText(strings.PLANTING_SITE_MAP_PROBLEMS_TITLE)).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: strings.RESET_BOUNDARY_SETUP }));
    const startOverDialog = await screen.findByRole('dialog', { name: strings.START_OVER });
    await user.click(within(startOverDialog).getByRole('button', { name: strings.START_OVER }));

    await editSiteBoundary(user, SHRUNK_SITE_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    const newDialog = await screen.findByRole('dialog', { name: strings.MARK_SUBSTRATA_INCOMPLETE });
    expect(within(newDialog).getByRole('checkbox', { name: 'East-1' })).not.toBeChecked();
  });

  it('cancelling the substrata prompt keeps editing', async () => {
    const requests = captureSaves();
    const { user } = renderMapEditor(completedSite);

    await editSiteBoundary(user, SHRUNK_SITE_BOUNDARY);
    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    expect(await screen.findByText(strings.MARK_SUBSTRATA_INCOMPLETE)).toBeInTheDocument();
    const dialog = dialogTitled(strings.MARK_SUBSTRATA_INCOMPLETE);
    await user.click(within(dialog).getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.MARK_SUBSTRATA_INCOMPLETE)).not.toBeInTheDocument());
    expect(saveRequests(requests)).toHaveLength(0);
    expect(screen.getByTestId('location')).toHaveTextContent(EDIT_ROUTE);
    expect(screen.getByText('map layers: stratum,substratum')).toBeInTheDocument();
  });

  it('stepping through without changes still counts as unchanged', async () => {
    const { user } = renderMapEditor(completedSite);

    await goToFinalStep(user);
    await backTo(user, 'site,stratum');

    expect(screen.queryByText(strings.UNSAVED_CHANGES)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: strings.CLOSE }));

    expect(screen.queryByText(strings.CLOSE_SITE_EDITOR)).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });

  it('skips the substrata prompt when no completed substratum changed', async () => {
    const requests = captureSaves();
    const { user } = renderMapEditor(completedSite);

    await goToFinalStep(user);
    await user.click(screen.getByRole('button', { name: strings.SAVE_CHANGES }));

    await waitFor(() => expect(saveRequests(requests)).toHaveLength(1));
    expect(await saveRequests(requests)[0].json()).not.toHaveProperty('substratumIdsToMarkIncomplete');
    expect(screen.queryByText(strings.MARK_SUBSTRATA_INCOMPLETE)).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });
});

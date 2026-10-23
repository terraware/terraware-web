import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import type { PlantingSitePayload } from 'src/queries/generated/plantingSites';
import { api as preferencesApi } from 'src/queries/generated/preferences';
import { makeStore } from 'src/redux/store';
import PlantingSiteMapEdit from 'src/scenes/PlantingSitesRouter/edit/PlantingSiteMapEdit';
import strings from 'src/strings';
import {
  buildOrganization,
  buildPlantingSite,
  buildStratum,
  buildSubstratum,
  buildUser,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';
import type { Organization } from 'src/types/Organization';

rstest.mock('./editor/MapEditor', () => ({
  __esModule: true,
  default: (props: { site: PlantingSitePayload }) => <div>{`editing ${props.site.name}`}</div>,
}));

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const SITE_URL = '/api/v1/tracking/sites/1';
const EDIT_ROUTE = '/planting-sites/1/edit';
const SITE_VIEW_PATH = '/planting-sites/1';

const site = buildPlantingSite({
  id: 1,
  name: 'Existing Site',
  strata: [buildStratum({ id: 10, name: 'West', substrata: [buildSubstratum({ id: 100, name: '1' })] })],
});

const renderPage = async ({
  featureEnabled = true,
  role = 'Admin',
}: { featureEnabled?: boolean; role?: Organization['role'] } = {}) => {
  mockGet('/api/v1/users/me', { user: buildUser() });
  mockGet('/api/v1/users/me/preferences', { preferences: featureEnabled ? { editPlantingSite: true } : {} });

  // the app loads preferences while bootstrapping, so the flag is known before this page mounts
  const store = makeStore();
  const preferences = store.dispatch(preferencesApi.endpoints.getUserPreferences.initiate(undefined));
  await preferences.unwrap();

  const result = renderWithProviders(
    <>
      <Routes>
        <Route path='/planting-sites/:plantingSiteId/edit' element={<PlantingSiteMapEdit />} />
        <Route path='*' element={null} />
      </Routes>
      <LocationProbe />
    </>,
    { organization: { selectedOrganization: buildOrganization({ role }) }, route: EDIT_ROUTE, store }
  );
  preferences.unsubscribe();
  return result;
};

describe('PlantingSiteMapEdit', () => {
  it('loads full-resolution geometry', async () => {
    const requests: Request[] = [];
    server.use(
      http.get(SITE_URL, ({ request }) => {
        requests.push(request.clone());
        return HttpResponse.json({ status: 'ok', site });
      })
    );

    await renderPage();

    expect(await screen.findByText('editing Existing Site')).toBeInTheDocument();
    expect(requests.length).toBeGreaterThan(0);
    requests.forEach((request) => expect(new URL(request.url).searchParams.get('simplified')).toBe('false'));
  });

  it("shows an error with a way back when the site can't be loaded", async () => {
    mockError('get', SITE_URL, 404);

    const { user } = await renderPage();

    expect(await screen.findByText(strings.GENERIC_ERROR)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.GO_TO_PLANTING_SITES }));

    expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH);
  });

  it('redirects to the site view when the feature is disabled', async () => {
    mockGet(SITE_URL, { site });

    await renderPage({ featureEnabled: false });

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH));
    expect(screen.queryByText('editing Existing Site')).not.toBeInTheDocument();
  });

  it("redirects to the site view when the user isn't an admin", async () => {
    mockGet(SITE_URL, { site });

    await renderPage({ role: 'Manager' });

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(SITE_VIEW_PATH));
    expect(screen.queryByText('editing Existing Site')).not.toBeInTheDocument();
  });
});

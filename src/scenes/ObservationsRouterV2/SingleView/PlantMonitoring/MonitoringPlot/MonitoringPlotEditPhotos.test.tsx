import React from 'react';
import { Route, Routes, useLocation } from 'react-router';

import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import MonitoringPlotEditPhotos from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/MonitoringPlot/MonitoringPlotEditPhotos';
import strings from 'src/strings';
import { captureRequests, mockGet, mockImage, renderWithProviders, server } from 'src/test-utils';

const OBSERVATION_ID = 1;
const PLOT_ID = 2;
const FILE_ID = 555;

const RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';
const UPLOAD_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/otherMedia';
const PHOTO_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/photos/:fileId';

// The component finds the plot under edit inside the observation results tree. An ad-hoc plot keeps
// the fixture flat: no stratum/substratum nesting is needed to reach it.
const buildResults = (media: Record<string, unknown>[] = []) => ({
  observation: {
    strata: [],
    adHocPlot: {
      boundary: { type: 'Polygon', coordinates: [] },
      conditions: [],
      coordinates: [],
      isAdHoc: true,
      isPermanent: false,
      media,
      monitoringPlotId: PLOT_ID,
      monitoringPlotName: 'Plot 42',
      monitoringPlotNumber: 42,
      overlappedByPlotIds: [],
      overlapsWithPlotIds: [],
      photos: [],
      sizeMeters: 30,
      species: [],
      status: 'Completed',
    },
  },
});

const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid='location'>{location.pathname}</div>;
};

const renderEditPhotos = () =>
  renderWithProviders(
    <>
      <Routes>
        <Route
          path='/observations/:observationId/plots/:monitoringPlotId/edit-photos'
          element={<MonitoringPlotEditPhotos />}
        />
        <Route path='/observations/:observationId' element={<div />} />
      </Routes>
      <LocationProbe />
    </>,
    { route: `/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/edit-photos` }
  );

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

const selectFile = (input: HTMLInputElement, file: File) => {
  fireEvent.change(input, { target: { files: { 0: file, item: () => file, length: 1 } } });
};

const saveChanges = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(screen.getByRole('button', { name: strings.SAVE }));
  await user.click(screen.getByRole('button', { name: strings.CONTINUE }));
};

describe('MonitoringPlotEditPhotos', () => {
  it('keeps every save and cancel disabled after one upload fails until the other settles', async () => {
    mockGet('/build-version.txt');
    mockGet(RESULTS_URL, buildResults());
    let release!: () => void;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let receivedFailure!: () => void;
    const failed = new Promise<void>((resolve) => {
      receivedFailure = resolve;
    });
    const onResponse = ({ response }: { response: Response }) => {
      if (response.status === 500) {
        receivedFailure();
      }
    };
    server.events.on('response:mocked', onResponse);
    const requests: Request[] = [];
    server.use(
      http.post(UPLOAD_URL, async ({ request }) => {
        requests.push(request.clone());
        if (requests.length === 1) {
          return HttpResponse.json({ status: 'error' }, { status: 500 });
        }
        await pending;
        return HttpResponse.json({ status: 'ok' });
      })
    );
    try {
      const { user, store } = renderEditPhotos();
      await screen.findByText('Plot 42');
      selectFile(fileInput(), new File(['x'], 'first.jpg', { type: 'image/jpeg' }));
      selectFile(fileInput(), new File(['y'], 'second.jpg', { type: 'image/jpeg' }));
      await saveChanges(user);
      await waitFor(() => expect(requests).toHaveLength(2));
      await act(async () => {
        await failed;
      });
      const save = screen.getByRole('button', { name: strings.SAVE });
      const confirm = screen.getByRole('button', { name: strings.CONTINUE });
      expect(save).toBeDisabled();
      expect(confirm).toBeDisabled();
      screen.getAllByRole('button', { name: strings.CANCEL }).forEach((cancel) => expect(cancel).toBeDisabled());
      confirm.click();
      expect(requests).toHaveLength(2);
      release();
      await waitFor(() => expect(confirm).toBeEnabled());
      expect(save).toBeEnabled();
      screen.getAllByRole('button', { name: strings.CANCEL }).forEach((cancel) => expect(cancel).toBeEnabled());
      await waitFor(() =>
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({
          priority: 'critical',
          msg: strings.GENERIC_ERROR,
        })
      );
      expect(screen.getByTestId('location').textContent).toBe('/observations/1/plots/2/edit-photos');
    } finally {
      release();
      server.events.removeListener('response:mocked', onResponse);
    }
  });

  it('uploads a selected image to the plot when the change is saved', async () => {
    mockGet(RESULTS_URL, buildResults());
    const requests = captureRequests('post', UPLOAD_URL);

    const { user } = renderEditPhotos();

    // Wait for the plot results to load. The plot name only renders once the fetched results have
    // populated state, and that same load resets the media list — so uploading before it settles
    // would have the file silently discarded.
    await screen.findByText('Plot 42');

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(fileInput(), file);

    expect(await screen.findByRole('button', { name: strings.DELETE })).toBeInTheDocument();

    await saveChanges(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toContain(`/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/otherMedia`);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(`/observations/${OBSERVATION_ID}`));
  });

  it('deletes an existing plot photo when its delete control is used and the change is saved', async () => {
    mockGet(
      RESULTS_URL,
      buildResults([
        {
          fileId: FILE_ID,
          isOriginal: false,
          mediaKind: 'Photo',
          // A plot photo with no assigned corner position is user-deletable.
          type: 'Plot',
        },
      ])
    );
    mockImage(PHOTO_URL);
    const requests = captureRequests('delete', PHOTO_URL);

    const { user } = renderEditPhotos();

    await user.click(await screen.findByRole('button', { name: strings.DELETE }));

    await saveChanges(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('DELETE');
    expect(requests[0].url).toContain(`/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/photos/${FILE_ID}`);
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe(`/observations/${OBSERVATION_ID}`));
  });
});

import React from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import MonitoringPlotEditPhotos from 'src/scenes/ObservationsRouterV2/SingleView/PlantMonitoring/MonitoringPlot/MonitoringPlotEditPhotos';
import strings from 'src/strings';
import { captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

const OBSERVATION_ID = 1;
const PLOT_ID = 2;
const FILE_ID = 555;

const RESULTS_URL = '/api/v1/tracking/observations/:observationId/results';
const UPLOAD_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/otherMedia';
const DELETE_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/photos/:fileId';

// jsdom does not implement object URLs, and the photo preview creates one to render a newly added
// file. Provide a stub so rendering a new media item does not throw.
const originalCreateObjectURL = URL.createObjectURL.bind(URL);
const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL);
beforeAll(() => {
  URL.createObjectURL = () => 'blob:stub';
  URL.revokeObjectURL = () => undefined;
});
afterAll(() => {
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

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

const renderEditPhotos = () =>
  renderWithProviders(<MonitoringPlotEditPhotos />, {
    route: `/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/edit-photos`,
    path: '/observations/:observationId/plots/:monitoringPlotId/edit-photos',
  });

const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

const selectFile = (input: HTMLInputElement, file: File) => {
  fireEvent.change(input, { target: { files: { 0: file, item: () => file, length: 1 } } });
};

const saveChanges = async (user: ReturnType<typeof renderWithProviders>['user']) => {
  await user.click(screen.getByRole('button', { name: strings.SAVE }));
  await user.click(screen.getByRole('button', { name: strings.CONTINUE }));
};

describe('MonitoringPlotEditPhotos', () => {
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

    // The newly chosen file is surfaced as an editable item (with a delete control) before saving.
    expect(await screen.findByRole('button', { name: strings.DELETE })).toBeInTheDocument();

    await saveChanges(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toContain(`/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/otherMedia`);
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
    const requests = captureRequests('delete', DELETE_URL);

    const { user } = renderEditPhotos();

    await user.click(await screen.findByRole('button', { name: strings.DELETE }));

    await saveChanges(user);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('DELETE');
    expect(requests[0].url).toContain(`/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/photos/${FILE_ID}`);
  });
});

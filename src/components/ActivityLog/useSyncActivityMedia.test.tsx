import React from 'react';

import { waitFor } from '@testing-library/react';

import { ActivityMediaItem, ExistingActivityMediaItem } from 'src/components/ActivityLog/ActivityMediaForm';
import useSyncActivityMedia from 'src/components/ActivityLog/useSyncActivityMedia';
import { captureRequests, mockPut, renderWithProviders } from 'src/test-utils';
import { ActivityMediaFile } from 'src/types/Activity';

const ACTIVITY_ID = 42;

const UPLOAD_URL = `/api/v1/accelerator/activities/${ACTIVITY_ID}/media`;
const MEDIA_ITEM_URL = `/api/v1/accelerator/activities/${ACTIVITY_ID}/media/:fileId`;
const OBS_UPLOAD_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/otherMedia';
const OBS_DELETE_URL = '/api/v1/tracking/observations/:observationId/plots/:plotId/photos/:fileId';

type SyncRequest = {
  activityId: number;
  mediaItems: ActivityMediaItem[];
  observationId?: number;
  plotNumberToIdMap?: Record<number, number>;
};

/** Renders the hook and exposes a button that runs a single sync against a fixed request. */
const SyncHarness = ({ request }: { request: SyncRequest }) => {
  const sync = useSyncActivityMedia();
  return (
    <button type='button' onClick={() => void sync(request)}>
      sync
    </button>
  );
};

const buildExistingItem = ({
  data = {},
  ...itemOverrides
}: Partial<Omit<ExistingActivityMediaItem, 'type' | 'data'>> & {
  data?: Partial<ActivityMediaFile>;
} = {}): ExistingActivityMediaItem => ({
  type: 'existing',
  data: {
    fileId: 900,
    fileName: 'existing.jpg',
    isCoverPhoto: false,
    isHiddenOnMap: false,
    listPosition: 1,
    type: 'Photo',
    ...data,
  },
  ...itemOverrides,
});

const runSync = async (request: SyncRequest) => {
  const { user, getByRole } = renderWithProviders(<SyncHarness request={request} />);
  await user.click(getByRole('button', { name: 'sync' }));
};

describe('useSyncActivityMedia', () => {
  it('uploads a newly added media file to the activity media endpoint with the file attached', async () => {
    const uploads = captureRequests('post', UPLOAD_URL, { fileId: 123 });
    // The hook follows every upload with a metadata update; mock it so the flow completes.
    mockPut(MEDIA_ITEM_URL);

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await runSync({
      activityId: ACTIVITY_ID,
      mediaItems: [
        {
          type: 'new',
          data: {
            file,
            fileName: 'photo.jpg',
            isCoverPhoto: false,
            isHiddenOnMap: false,
            listPosition: 1,
            type: 'Photo',
          },
        },
      ],
    });

    await waitFor(() => expect(uploads).toHaveLength(1));
    expect(uploads[0].method).toBe('POST');
    const formData = await uploads[0].formData();
    const uploadedFile = formData.get('file');
    expect(typeof uploadedFile).not.toBe('string');
    expect((uploadedFile as File).name).toBe('photo.jpg');
  });

  it('deletes a removed existing media item via the activity media endpoint', async () => {
    const deletes = captureRequests('delete', MEDIA_ITEM_URL);

    await runSync({
      activityId: ACTIVITY_ID,
      mediaItems: [buildExistingItem({ isDeleted: true, data: { fileId: 900 } })],
    });

    await waitFor(() => expect(deletes).toHaveLength(1));
    expect(deletes[0].method).toBe('DELETE');
    expect(deletes[0].url).toContain(`/api/v1/accelerator/activities/${ACTIVITY_ID}/media/900`);
  });

  it('routes an observation-linked upload to the observation otherMedia endpoint', async () => {
    const OBSERVATION_ID = 7;
    const PLOT_ID = 55;
    const obsUploads = captureRequests('post', OBS_UPLOAD_URL, { fileId: 321 });
    mockPut(MEDIA_ITEM_URL);
    // Guard: if the hook wrongly used the activity endpoint, this would capture it instead.
    const activityUploads = captureRequests('post', UPLOAD_URL, { fileId: 321 });

    const file = new File(['x'], 'plot.jpg', { type: 'image/jpeg' });
    await runSync({
      activityId: ACTIVITY_ID,
      observationId: OBSERVATION_ID,
      mediaItems: [
        {
          type: 'new',
          data: {
            file,
            fileName: 'plot.jpg',
            isCoverPhoto: false,
            isHiddenOnMap: false,
            listPosition: 1,
            type: 'Photo',
            monitoringPlotId: PLOT_ID,
          },
        },
      ],
    });

    await waitFor(() => expect(obsUploads).toHaveLength(1));
    expect(obsUploads[0].url).toContain(`/api/v1/tracking/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/otherMedia`);
    const formData = await obsUploads[0].formData();
    const uploadedFile = formData.get('file');
    expect(typeof uploadedFile).not.toBe('string');
    expect((uploadedFile as File).name).toBe('plot.jpg');
    expect(activityUploads).toHaveLength(0);
  });

  it('routes an observation-linked delete to the observation photos endpoint', async () => {
    const OBSERVATION_ID = 7;
    const PLOT_NUMBER = 3;
    const PLOT_ID = 55;
    const obsDeletes = captureRequests('delete', OBS_DELETE_URL);
    // Guard against a fall-through to the activity delete endpoint.
    const activityDeletes = captureRequests('delete', MEDIA_ITEM_URL);

    await runSync({
      activityId: ACTIVITY_ID,
      observationId: OBSERVATION_ID,
      plotNumberToIdMap: { [PLOT_NUMBER]: PLOT_ID },
      mediaItems: [
        buildExistingItem({
          isDeleted: true,
          data: { fileId: 900, observation: { monitoringPlotNumber: PLOT_NUMBER, type: 'Plot' } },
        }),
      ],
    });

    await waitFor(() => expect(obsDeletes).toHaveLength(1));
    expect(obsDeletes[0].url).toContain(`/api/v1/tracking/observations/${OBSERVATION_ID}/plots/${PLOT_ID}/photos/900`);
    expect(activityDeletes).toHaveLength(0);
  });
});

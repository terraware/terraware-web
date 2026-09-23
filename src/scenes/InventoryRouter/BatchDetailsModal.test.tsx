import React from 'react';

import { afterAll, beforeAll } from '@rstest/core';
import { screen, waitFor, within } from '@testing-library/react';

import BatchDetailsModal from 'src/scenes/InventoryRouter/BatchDetailsModal';
import strings from 'src/strings';
import { buildBatch, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

// The photo preview calls URL.createObjectURL on the newly selected file. Node's implementation
// rejects a File, so without a stub the modal throws while rendering the preview and unmounts.
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

const BATCH_ID = 42;
const PHOTOS_URL = `/api/v1/nursery/batches/${BATCH_ID}/photos`;
const PHOTO_URL = `/api/v1/nursery/batches/${BATCH_ID}/photos/:photoId`;

const fileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('BatchDetailsModal photos', () => {
  it('uploads a newly selected photo to the batch when the details are saved', async () => {
    mockGet(PHOTOS_URL, { photos: [] });
    const requests = captureRequests('post', PHOTOS_URL, { id: 7 });

    const { container, user } = renderWithProviders(
      <BatchDetailsModal batch={buildBatch({ id: BATCH_ID })} onClose={() => undefined} />
    );

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    await user.upload(fileInput(container), file);

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('POST');
    expect(requests[0].url).toContain(`/nursery/batches/${BATCH_ID}/photos`);
  });

  it('deletes an existing photo when its remove control is used and the details are saved', async () => {
    const PHOTO_ID = 99;
    mockGet(PHOTOS_URL, { photos: [{ id: PHOTO_ID }] });
    const requests = captureRequests('delete', PHOTO_URL);

    const { user } = renderWithProviders(
      <BatchDetailsModal batch={buildBatch({ id: BATCH_ID })} onClose={() => undefined} />
    );

    const photo = await screen.findByAltText('0');
    await user.click(within(photo.parentElement as HTMLElement).getByRole('button'));

    await user.click(screen.getByRole('button', { name: strings.SAVE }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].method).toBe('DELETE');
    expect(requests[0].url).toContain(`/nursery/batches/${BATCH_ID}/photos/${PHOTO_ID}`);
  });
});

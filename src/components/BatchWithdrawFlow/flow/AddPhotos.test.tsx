import React from 'react';

import { rs } from '@rstest/core';
import { screen } from '@testing-library/react';

import AddPhotos from 'src/components/BatchWithdrawFlow/flow/AddPhotos';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

// jsdom does not implement object URLs; PhotoChooser calls URL.createObjectURL to preview each
// newly added file, inside the same effect that reports the selection to the parent. Without a stub
// that call throws before the selection is surfaced.
beforeAll(() => {
  URL.createObjectURL = () => 'blob:stub';
  URL.revokeObjectURL = () => undefined;
});

// The uploader (SelectPhotos -> PhotoChooser -> FileChooser) renders a hidden file input with no
// label or test id, so it can only be reached through the DOM.
const selectPhoto = async (
  user: ReturnType<typeof renderWithProviders>['user'],
  container: HTMLElement,
  name = 'photo.jpg'
) => {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['x'], name, { type: 'image/jpeg' });
  await user.upload(input, file);
  return file;
};

describe('AddPhotos', () => {
  it('surfaces the selected photo file to the parent when the step is confirmed', async () => {
    const onNext = rs.fn<(photos: File[]) => Promise<void>>(() => Promise.resolve());
    const { user, container } = renderWithProviders(
      <AddPhotos onNext={onNext} onCancel={() => undefined} saveText={strings.WITHDRAW} />
    );

    await selectPhoto(user, container);
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    expect(onNext).toHaveBeenCalledTimes(1);
    const [photos] = onNext.mock.calls[0];
    expect(photos).toHaveLength(1);
    expect(photos[0]).toBeInstanceOf(File);
    expect(photos[0].name).toBe('photo.jpg');
  });

  it('carries every selected photo through, not just the first', async () => {
    const onNext = rs.fn<(photos: File[]) => Promise<void>>(() => Promise.resolve());
    const { user, container } = renderWithProviders(
      <AddPhotos onNext={onNext} onCancel={() => undefined} saveText={strings.WITHDRAW} />
    );

    await selectPhoto(user, container, 'first.jpg');
    await selectPhoto(user, container, 'second.jpg');
    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    expect(onNext).toHaveBeenCalledTimes(1);
    const [photos] = onNext.mock.calls[0];
    expect(photos.map((photo) => photo.name)).toEqual(['first.jpg', 'second.jpg']);
  });

  it('confirms with no photos when the user attaches none', async () => {
    const onNext = rs.fn<(photos: File[]) => Promise<void>>(() => Promise.resolve());
    const { user } = renderWithProviders(
      <AddPhotos onNext={onNext} onCancel={() => undefined} saveText={strings.WITHDRAW} />
    );

    await user.click(screen.getByRole('button', { name: strings.WITHDRAW }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0][0]).toEqual([]);
  });
});

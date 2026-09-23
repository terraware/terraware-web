import React, { useEffect, useState } from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import ActivityMediaForm, {
  ActivityMediaItem,
  ExistingActivityMediaItem,
} from 'src/components/ActivityLog/ActivityMediaForm';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';
import { ActivityMediaFile } from 'src/types/Activity';

const ACTIVITY_ID = 42;

// jsdom does not implement object URLs, and ActivityPhotoPreview creates one to preview a newly
// added file. Provide a stub so rendering a new media item does not throw.
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

const fileInput = (container: HTMLElement): HTMLInputElement =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

const selectFile = (input: HTMLInputElement, file: File) => {
  fireEvent.change(input, { target: { files: { 0: file, item: () => file, length: 1 } } });
};

const buildExistingMediaItem = (overrides: Partial<ActivityMediaFile> = {}): ExistingActivityMediaItem => ({
  type: 'existing',
  data: {
    fileId: 900,
    fileName: 'existing.jpg',
    isCoverPhoto: false,
    isHiddenOnMap: false,
    listPosition: 1,
    type: 'Photo',
    ...overrides,
  },
});

/**
 * ActivityMediaForm is controlled: its parent owns the media items and passes down the setter. This
 * harness stands in for that parent so a test can drive the form and read back whatever the form
 * pushed into that state.
 */
const Harness = ({
  initialItems = [],
  onItemsChange,
}: {
  initialItems?: ActivityMediaItem[];
  onItemsChange?: (items: ActivityMediaItem[]) => void;
}) => {
  const [items, setItems] = useState<ActivityMediaItem[]>(initialItems);

  useEffect(() => {
    onItemsChange?.(items);
  }, [items, onItemsChange]);

  return (
    <ActivityMediaForm
      activityId={ACTIVITY_ID}
      mediaItems={items}
      onChangeMediaItems={setItems}
      onClickMediaItem={() => () => undefined}
    />
  );
};

describe('ActivityMediaForm', () => {
  it('surfaces a chosen image file to the parent as a new media item', async () => {
    let latestItems: ActivityMediaItem[] = [];
    const { container } = renderWithProviders(<Harness onItemsChange={(items) => (latestItems = items)} />);

    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });
    selectFile(fileInput(container), file);

    await waitFor(() => expect(latestItems).toHaveLength(1));
    const added = latestItems[0];
    expect(added.type).toBe('new');
    expect(added.type === 'new' && added.data.file).toBe(file);
    expect(added.type === 'new' && added.data.fileName).toBe('photo.jpg');
    expect(added.type === 'new' && added.data.type).toBe('Photo');

    expect(await screen.findByRole('button', { name: strings.DELETE })).toBeInTheDocument();
  });

  it('classifies a chosen video file as a Video media item', async () => {
    let latestItems: ActivityMediaItem[] = [];
    const { container } = renderWithProviders(<Harness onItemsChange={(items) => (latestItems = items)} />);

    const clip = new File(['x'], 'clip.mp4', { type: 'video/mp4' });
    selectFile(fileInput(container), clip);

    await waitFor(() => expect(latestItems).toHaveLength(1));
    const added = latestItems[0];
    expect(added.type === 'new' && added.data.file).toBe(clip);
    expect(added.type === 'new' && added.data.type).toBe('Video');
  });

  it('marks an existing media item as deleted when its delete control is clicked', async () => {
    let latestItems: ActivityMediaItem[] = [];
    const { user } = renderWithProviders(
      <Harness initialItems={[buildExistingMediaItem()]} onItemsChange={(items) => (latestItems = items)} />
    );

    const deleteButton = await screen.findByRole('button', { name: strings.DELETE });
    await user.click(deleteButton);

    await waitFor(() => {
      const item = latestItems[0];
      expect(item.type === 'existing' && item.isDeleted).toBe(true);
    });

    expect(screen.queryByRole('button', { name: strings.DELETE })).not.toBeInTheDocument();
  });
});

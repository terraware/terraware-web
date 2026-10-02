import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponents from '@terraware/web-components' with { rstest: 'importActual' };
import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { EventLogEntryPayload, RecordedTreeSubjectPayload } from 'src/queries/generated/events';
import strings from 'src/strings';
import {
  captureRequests,
  dialogTitled,
  mockError,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

import EventLog from './EventLog';

// jsdom cannot play Mux streams; expose the player inputs while exercising the real query and dialog.
rstest.mock('@mux/mux-player-react', () => ({
  default: ({ playbackId, playbackToken }: { playbackId: string; playbackToken: string }) => (
    <div data-testid='video-player' data-playback-id={playbackId} data-playback-token={playbackToken} />
  ),
}));

// The external photo carousel relies on browser APIs unavailable in jsdom.
rstest.mock('@terraware/web-components', () => ({
  ...webComponents,
  ViewPhotosDialog: ({ photos, title }: { photos: { url: string }[]; title: string }) => (
    <div role='dialog' aria-label={title}>
      <img src={photos[0].url} alt={title} />
    </div>
  ),
}));

const STREAM_URL = '/api/v1/tracking/observations/1/plots/2/media/7592/stream';
const mediaEvent = (
  mediaKind: 'Photo' | 'Video',
  fileId: number,
  action: EventLogEntryPayload['action'] = { type: 'Created', fields: [] },
  isOriginal = false
): EventLogEntryPayload => ({
  action,
  subject: {
    type: 'ObservationPlotMedia',
    mediaKind,
    fileId,
    isOriginal,
    observationId: 1,
    monitoringPlotId: 2,
    plantingSiteId: 3,
    fullText: `${mediaKind} ${fileId}`,
    shortText: mediaKind,
  },
  timestamp: '2026-06-15T12:00:00Z',
  userId: 1,
  userName: 'Jennifer Yim',
});

const renderHistory = async (events = [mediaEvent('Video', 7592)]) => {
  mockGet('/api/v1/species', { species: [] });
  mockPost('/api/v1/events/list', { events });
  const rendered = renderWithProviders(<EventLog observationId={1} plotId={2} />);
  await rendered.user.click(await screen.findByRole('button', { name: strings.CHANGE_HISTORY }));
  return rendered;
};

describe('Observation EventLog trees and shrubs', () => {
  it.each([
    {
      fullText: 'Tree 1',
      shortText: 'Tree',
      treeGrowthForm: 'Tree',
      treeNumber: 1,
      trunkNumber: 1,
      fieldName: 'DBH',
      expectedLabel: 'Tree 1 DBH',
    },
    {
      fullText: 'Tree 1_2',
      shortText: 'Tree',
      treeGrowthForm: 'Trunk',
      treeNumber: 1,
      trunkNumber: 2,
      fieldName: 'tree crown diameter',
      expectedLabel: 'Tree 1_2 crown diameter',
    },
    {
      fullText: 'Shrub 2',
      shortText: 'Shrub',
      treeGrowthForm: 'Shrub',
      treeNumber: 2,
      trunkNumber: 1,
      fieldName: 'Shrub Diameter',
      expectedLabel: 'Shrub 2 Diameter',
    },
  ] satisfies (Pick<
    RecordedTreeSubjectPayload,
    'fullText' | 'shortText' | 'treeGrowthForm' | 'treeNumber' | 'trunkNumber'
  > & {
    fieldName: string;
    expectedLabel: string;
  })[])('identifies $fullText when its $fieldName changes', async ({ fieldName, expectedLabel, ...subject }) => {
    await renderHistory([
      {
        action: {
          type: 'FieldUpdated',
          fieldName,
          changedFrom: ['1,500'],
          changedTo: ['1,499'],
        },
        subject: {
          type: 'RecordedTree',
          ...subject,
          recordedTreeId: 123,
          observationId: 1,
          monitoringPlotId: 2,
          plantingSiteId: 3,
        },
        timestamp: '2026-06-15T12:00:00Z',
        userId: 1,
        userName: 'Jennifer Yim',
      },
    ]);

    expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('1,499')).toBeInTheDocument();
  });
});

describe('Observation EventLog media', () => {
  it('preserves photo numbers and opens the photo viewer while leaving deleted and original media unlinked', async () => {
    const { user } = await renderHistory([
      mediaEvent('Photo', 7599),
      mediaEvent('Photo', 7590, { type: 'Deleted' }),
      mediaEvent('Photo', 7591, { type: 'Created', fields: [] }, true),
    ]);

    expect(screen.getByText('Photo 7590 deleted')).toBeInTheDocument();
    expect(screen.queryByText('Photo 7591 added')).not.toBeInTheDocument();
    await user.click(screen.getByText('Photo 7599 added'));
    expect(await screen.findByRole('dialog', { name: strings.PHOTOS })).toBeInTheDocument();
    expect(document.querySelector('img[src*="/observations/1/plots/2/photos/7599"]')).toBeInTheDocument();
  });

  it.each(['oldest first', 'newest first'])(
    'shows a deleted-video message without requesting a stream with events %s',
    async (order) => {
      const added = mediaEvent('Video', 7590);
      const deleted = { ...mediaEvent('Video', 7590, { type: 'Deleted' }), timestamp: '2026-06-16T12:00:00Z' };
      const events = [added, deleted, mediaEvent('Video', 7592)];
      const deletedStreamRequests = captureRequests('get', STREAM_URL.replace('/7592/', '/7590/'));
      mockGet(STREAM_URL, { playbackId: 'live-video', playbackToken: 'live-token' });
      const { user } = await renderHistory(order === 'oldest first' ? events : [...events].reverse());

      expect(screen.getByText('Video 7590 deleted').closest('button, a')).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Video 7590 added' }));
      const deletedVideoDialog = dialogTitled('Video 7590');
      expect(within(deletedVideoDialog).getByText(strings.VIDEO_HAS_BEEN_DELETED)).toBeInTheDocument();
      expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      await user.click(within(deletedVideoDialog).getByRole('button'));
      expect(screen.queryByText('Video 7590')).not.toBeInTheDocument();
      expect(deletedStreamRequests).toHaveLength(0);

      await user.click(screen.getByRole('button', { name: 'Video 7592 added' }));
      expect(dialogTitled('Video 7592')).toBeInTheDocument();
      expect(await screen.findByTestId('video-player')).toHaveAttribute('data-playback-id', 'live-video');
    }
  );

  it('shows loading, plays the selected numbered video, and closes its titled dialog', async () => {
    let resolveStream: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      resolveStream = resolve;
    });
    server.use(
      http.get(STREAM_URL, async () => {
        await pending;
        return HttpResponse.json({ status: 'ok', playbackId: 'playback-7592', playbackToken: 'token-7592' });
      })
    );
    const { user } = await renderHistory();
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    await user.click(screen.getByText('Video 7592 added'));
    const dialog = dialogTitled('Video 7592');
    expect(dialog).toHaveClass('dialog-box--large');
    expect(await within(dialog).findByRole('progressbar')).toBeInTheDocument();
    resolveStream?.();
    const player = await screen.findByTestId('video-player');
    expect(player).toHaveAttribute('data-playback-id', 'playback-7592');
    expect(player).toHaveAttribute('data-playback-token', 'token-7592');
    await user.click(within(dialogTitled('Video 7592')).getByRole('button'));
    expect(screen.queryByText('Video 7592')).not.toBeInTheDocument();
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
  });

  it.each([412, 404])('shows the appropriate message for stream error %s', async (status) => {
    mockError('get', STREAM_URL, status);
    const { user } = await renderHistory();
    await user.click(screen.getByText('Video 7592 added'));
    expect(
      await screen.findByText(status === 412 ? strings.VIDEO_PROCESSING : strings.GENERIC_ERROR)
    ).toBeInTheDocument();
    expect(screen.queryByTestId('video-player')).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByText('Video 7592')).not.toBeInTheDocument();
    expect(
      screen.queryByText(status === 412 ? strings.VIDEO_PROCESSING : strings.GENERIC_ERROR)
    ).not.toBeInTheDocument();
  });
});

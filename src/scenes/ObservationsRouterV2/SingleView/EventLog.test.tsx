import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponents from '@terraware/web-components' with { rstest: 'importActual' };
import { screen, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { EventLogEntryPayload } from 'src/queries/generated/events';
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

type PlotSpecies = { scientificName?: string; totalDead: number; totalExisting: number; totalLive: number };

const renderHistory = async (events = [mediaEvent('Video', 7592)], plotSpecies: PlotSpecies[] = []) => {
  mockGet('/api/v1/species', { species: [] });
  mockPost('/api/v1/events/list', { events });
  // Summarizing species edits replays the log backwards from the counts the plot holds now, so the
  // results have to agree with the history the events describe.
  mockGet('/api/v1/tracking/observations/1/results', {
    observation: {
      observationId: 1,
      plantingSiteId: 3,
      isAdHoc: false,
      strata: [
        {
          substrata: [
            {
              monitoringPlots: [
                {
                  monitoringPlotId: 2,
                  species: plotSpecies.map(({ scientificName, ...totals }) => ({
                    certainty: scientificName ? 'Other' : 'Unknown',
                    speciesName: scientificName,
                    ...totals,
                  })),
                },
              ],
            },
          ],
        },
      ],
    },
  });
  const rendered = renderWithProviders(<EventLog observationId={1} plotId={2} />);
  await rendered.user.click(await screen.findByRole('button', { name: strings.CHANGE_HISTORY }));
  return rendered;
};

/** Plant counts in the order the fixtures list them: existing, live, dead. */
type Counts = [number, number, number];

const speciesCountEvent = (
  speciesName: string | undefined,
  fieldName: string,
  changedFrom: string,
  changedTo: string,
  timestamp: string
): EventLogEntryPayload => ({
  action: { type: 'FieldUpdated', fieldName, changedFrom: [changedFrom], changedTo: [changedTo] },
  subject: {
    type: 'MonitoringSpecies',
    scientificName: speciesName,
    monitoringPlotId: 2,
    observationId: 1,
    plantingSiteId: 3,
    fullText: `Species ${speciesName ?? 'Unknown'}`,
    // The API sends just the word "Species" here, so it cannot stand in for the name.
    shortText: 'Species',
  },
  timestamp,
  userId: 1,
  userName: 'Jennifer Yim',
});

/**
 * A plot's history, oldest edit first, with the counts those edits leave behind. Each edit lists
 * the species' existing/live/dead counts before and after; the API reports only the ones that
 * changed, so the fixture omits the rest the same way.
 */
const speciesHistory = (...edits: { from: Counts; name?: string; to: Counts }[]) => {
  const events: EventLogEntryPayload[] = [];
  const bySpecies = new Map<string, PlotSpecies>();
  edits.forEach(({ from, name, to }, editIndex) => {
    const timestamp = `2026-06-15T12:00:00.${String(editIndex).padStart(3, '0')}Z`;
    ['existing count', 'live count', 'dead count'].forEach((fieldName, position) => {
      if (from[position] !== to[position]) {
        events.push(speciesCountEvent(name, fieldName, String(from[position]), String(to[position]), timestamp));
      }
    });
    bySpecies.set(name ?? 'unknown', {
      scientificName: name,
      totalExisting: to[0],
      totalLive: to[1],
      totalDead: to[2],
    });
  });
  return { events, plotSpecies: [...bySpecies.values()] };
};

describe('Observation EventLog species changes', () => {
  it('reports an add that left a count at zero as the species being added', async () => {
    // The real-world shape: pre-existing stays 0, so the edit reports only two counts.
    const { events, plotSpecies } = speciesHistory({ name: 'Vigna owahuensis', from: [0, 0, 0], to: [0, 2, 1] });
    await renderHistory(events, plotSpecies);

    expect(
      screen.getByText(strings.formatString(strings.EVENT_SPECIES_ADDED, 'Vigna owahuensis') as string)
    ).toBeInTheDocument();
    // The individual count lines are replaced by the one message, not shown alongside it.
    expect(screen.queryByText(/live count/)).not.toBeInTheDocument();
  });

  it('reports an edit that emptied the species as it being removed', async () => {
    const { events, plotSpecies } = speciesHistory(
      { name: 'Dracaena acuminata', from: [0, 0, 0], to: [2, 6, 1] },
      { name: 'Dracaena acuminata', from: [2, 6, 1], to: [0, 0, 0] }
    );
    await renderHistory(events, plotSpecies);

    expect(
      screen.getByText(strings.formatString(strings.EVENT_SPECIES_REMOVED, 'Dracaena acuminata') as string)
    ).toBeInTheDocument();
  });

  it('reports a removal next to an addition of the same counts as the species being changed', async () => {
    const { events, plotSpecies } = speciesHistory(
      { name: 'Duosperma angolense', from: [0, 0, 0], to: [2, 6, 1] },
      { name: 'Duosperma angolense', from: [2, 6, 1], to: [0, 0, 0] },
      { name: 'Abutilon eremitopetalum', from: [0, 0, 0], to: [2, 6, 1] }
    );
    await renderHistory(events, plotSpecies);

    expect(
      screen.getByText(
        strings.formatString(strings.EVENT_SPECIES_CHANGED, 'Duosperma angolense', 'Abutilon eremitopetalum') as string
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(strings.formatString(strings.EVENT_SPECIES_REMOVED, 'Duosperma angolense') as string)
    ).not.toBeInTheDocument();
  });

  it('names the plot unknown species the way the plant count table does', async () => {
    // An unknown species carries neither a name nor an id.
    const { events, plotSpecies } = speciesHistory(
      { from: [0, 0, 0], to: [2, 6, 1] },
      { from: [2, 6, 1], to: [0, 0, 0] }
    );
    await renderHistory(events, plotSpecies);

    expect(
      screen.getByText(strings.formatString(strings.EVENT_SPECIES_REMOVED, strings.UNKNOWN) as string)
    ).toBeInTheDocument();
  });

  it('still reports raising one count on a species that already had plants as a value change', async () => {
    const { events, plotSpecies } = speciesHistory(
      { name: 'Acacia koa', from: [0, 0, 0], to: [0, 4, 0] },
      { name: 'Acacia koa', from: [0, 4, 0], to: [0, 4, 2] }
    );
    await renderHistory(events, plotSpecies);

    expect(screen.getByText(/dead count/)).toBeInTheDocument();
    // Only the first edit added the species; the second just adjusted a count.
    expect(screen.getAllByText(strings.formatString(strings.EVENT_SPECIES_ADDED, 'Acacia koa') as string)).toHaveLength(
      1
    );
  });

  it('still reports an ordinary count edit as a value change', async () => {
    const { events, plotSpecies } = speciesHistory(
      { name: 'Acacia koa', from: [0, 0, 0], to: [1, 4, 1] },
      { name: 'Acacia koa', from: [1, 4, 1], to: [2, 9, 3] }
    );
    await renderHistory(events, plotSpecies);

    expect(screen.getByText(/live count/)).toBeInTheDocument();
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

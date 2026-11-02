import React from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor } from '@testing-library/react';

import ThumbnailImage from 'src/components/common/ThumbnailImage';
import { mockImage, renderWithProviders } from 'src/test-utils';

const PHOTO_URL = '/api/v1/nursery/batches/42/photos/99';
const ALT_TEXT = 'Seedling batch';
const PLACEHOLDER_IMAGE = '/assets/activity-media.svg';

const TOO_MANY_REQUESTS = 429;
// The longest the component ever waits before one retry.
const RETRY_WINDOW_MS = 10000;
// Four attempts in total: the first request and three retries.
const EXPECTED_ATTEMPTS = 4;

const thumbnail = () => screen.getByAltText(ALT_TEXT);

const tick = () =>
  act(async () => {
    await rs.advanceTimersByTimeAsync(RETRY_WINDOW_MS);
  });

/**
 * Step the clock through the component's backoff. A retry is only scheduled once the previous
 * response has come back, so the clock has to move in steps that leave room for the request in
 * flight to settle rather than jumping past the whole window at once.
 */
const advanceThroughRetries = async (requests: Request[], expected: number) => {
  for (let step = 0; step < EXPECTED_ATTEMPTS && requests.length < expected; step += 1) {
    await tick();
  }
};

describe('ThumbnailImage', () => {
  beforeEach(() => {
    // Only the retry scheduling is under the test's control; everything else runs in real time so
    // Testing Library can keep polling while the clock is faked.
    rs.useFakeTimers({ shouldAdvanceTime: true, toFake: ['setTimeout', 'clearTimeout'] });
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  it('shows the image the server returns', async () => {
    mockImage(PHOTO_URL);

    renderWithProviders(<ThumbnailImage alt={ALT_TEXT} src={PHOTO_URL} />);

    await waitFor(() => expect(thumbnail()).toHaveAttribute('src', expect.stringMatching(/^blob:/)));
  });

  it('keeps waiting while the server is too busy and shows the image once a retry succeeds', async () => {
    const onError = rs.fn();
    const requests = mockImage(PHOTO_URL, [TOO_MANY_REQUESTS, 200]);

    renderWithProviders(<ThumbnailImage alt={ALT_TEXT} onError={onError} src={PHOTO_URL} />);

    // A busy server means "not ready yet", so nothing stands in for the photo while it is retried.
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(thumbnail()).not.toHaveAttribute('src');

    await advanceThroughRetries(requests, 2);

    await waitFor(() => expect(thumbnail()).toHaveAttribute('src', expect.stringMatching(/^blob:/)));
    expect(requests).toHaveLength(2);
    expect(onError).not.toHaveBeenCalled();
  });

  it('falls back to the placeholder and reports the failure once the retries run out', async () => {
    const onError = rs.fn();
    const requests = mockImage(PHOTO_URL, TOO_MANY_REQUESTS);

    renderWithProviders(<ThumbnailImage alt={ALT_TEXT} onError={onError} src={PHOTO_URL} />);

    await advanceThroughRetries(requests, EXPECTED_ATTEMPTS);

    await waitFor(() => expect(thumbnail()).toHaveAttribute('src', PLACEHOLDER_IMAGE));
    expect(onError).toHaveBeenCalledTimes(1);

    // The point of the retry cap is that a busy server eventually gets left alone.
    await tick();
    expect(requests).toHaveLength(EXPECTED_ATTEMPTS);
  });

  it('does not retry a request the server rejected outright', async () => {
    const onError = rs.fn();
    const requests = mockImage(PHOTO_URL, 404);

    renderWithProviders(<ThumbnailImage alt={ALT_TEXT} onError={onError} src={PHOTO_URL} />);

    await waitFor(() => expect(thumbnail()).toHaveAttribute('src', PLACEHOLDER_IMAGE));

    await tick();
    expect(requests).toHaveLength(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  // No image handler is registered: the harness fails a test that makes an unmocked request, so
  // these pass only if the component never asked the network for them.
  it.each(['blob:local-preview', '/assets/logo.svg'])('shows %s as given, without fetching it', async (src) => {
    renderWithProviders(<ThumbnailImage alt={ALT_TEXT} src={src} />);

    expect(thumbnail()).toHaveAttribute('src', src);

    await tick();
  });
});

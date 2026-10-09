import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import useStickyPlantingSiteId from 'src/hooks/useStickyPlantingSiteId';
import { buildOrganization, captureRequests, renderWithProviders, server } from 'src/test-utils';

const ORGANIZATION_ID = 7;
const PREFERENCE_NAME = 'plants.dashboard.lastPlantingSite';
const PREFERENCES_URL = '/api/v1/users/me/preferences';

type Snapshot = { isRestoring: boolean; selectedPlantingSiteId: number | 'all' };

const describeSnapshot = ({ isRestoring, selectedPlantingSiteId }: Snapshot) =>
  `${isRestoring ? 'restoring' : 'restored'}:${selectedPlantingSiteId}`;

const Harness = ({ renders }: { renders: Snapshot[] }) => {
  const { isRestoring, selectedPlantingSiteId } = useStickyPlantingSiteId(PREFERENCE_NAME);
  const snapshot = { isRestoring, selectedPlantingSiteId };
  renders.push(snapshot);
  return <div>{describeSnapshot(snapshot)}</div>;
};

// Holds the preferences response until the test releases it, so the loading phase is observable.
const mockPreferencesHeldUntilReleased = (preferences: Record<string, unknown>) => {
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  const organizationIds: (string | null)[] = [];

  server.use(
    http.get(PREFERENCES_URL, async ({ request }) => {
      organizationIds.push(new URL(request.url).searchParams.get('organizationId'));
      await released;
      return HttpResponse.json({ status: 'ok', preferences });
    })
  );

  return { organizationIds, release };
};

const renderHarness = () => {
  const renders: Snapshot[] = [];
  renderWithProviders(<Harness renders={renders} />, {
    organization: { selectedOrganization: buildOrganization({ id: ORGANIZATION_ID }) },
  });
  return renders;
};

describe('useStickyPlantingSiteId', () => {
  it('reports restoring with the placeholder selection until the stored site is applied', async () => {
    const { organizationIds, release } = mockPreferencesHeldUntilReleased({
      [PREFERENCE_NAME]: { plantingSiteId: 3 },
    });

    renderHarness();

    await waitFor(() => expect(organizationIds).toEqual([`${ORGANIZATION_ID}`]));
    expect(screen.getByText('restoring:all')).toBeInTheDocument();

    release();

    expect(await screen.findByText('restored:3')).toBeInTheDocument();
  });

  it('never reports restored while still showing the placeholder selection', async () => {
    const { release } = mockPreferencesHeldUntilReleased({ [PREFERENCE_NAME]: { plantingSiteId: 3 } });

    const renders = renderHarness();
    release();
    await screen.findByText('restored:3');

    // A consumer that falls back to a default when the selection is invalid would act on a
    // "restored, all" render and overwrite the stored site.
    expect(renders.map(describeSnapshot)).not.toContain('restored:all');
  });

  it('finishes restoring on all sites when no site is stored', async () => {
    const { release } = mockPreferencesHeldUntilReleased({});

    renderHarness();
    expect(screen.getByText('restoring:all')).toBeInTheDocument();

    release();

    expect(await screen.findByText('restored:all')).toBeInTheDocument();
  });

  it('restores the legacy -1 value as all sites', async () => {
    const { release } = mockPreferencesHeldUntilReleased({ [PREFERENCE_NAME]: { plantingSiteId: -1 } });

    renderHarness();
    release();

    expect(await screen.findByText('restored:all')).toBeInTheDocument();
  });

  it('does not save preferences merely by restoring', async () => {
    const { release } = mockPreferencesHeldUntilReleased({ [PREFERENCE_NAME]: { plantingSiteId: 3 } });
    const puts = captureRequests('put', PREFERENCES_URL);

    renderHarness();
    release();
    await screen.findByText('restored:3');
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(puts).toHaveLength(0);
  });
});

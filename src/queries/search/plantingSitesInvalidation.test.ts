import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import { describe, expect, it } from '@rstest/core';
import { HttpResponse, http } from 'msw/http';

import { api as draftPlantingSitesApi } from 'src/queries/generated/draftPlantingSites';
import { api as plantingSitesApi } from 'src/queries/generated/plantingSites';
import { draftPlantingSitesSearchApi } from 'src/queries/search/draftPlantingSites';
import { plantingSitesSearchApi } from 'src/queries/search/plantingSites';
import { type AppStore, type RootState, makeStore } from 'src/redux/store';
import { server } from 'src/test-utils/msw/server';

const ORGANIZATION_ID = 1;

/**
 * Counts the searches each prefix runs, so a search that reads the cache instead of the network is
 * distinguishable from one that goes out again.
 */
const trackSearches = () => {
  const prefixes: string[] = [];

  server.use(
    http.post('/api/v1/search', async ({ request }) => {
      const body = (await request.json()) as { prefix: string };
      prefixes.push(body.prefix);
      return HttpResponse.json({ results: [] });
    }),
    http.post('/api/v1/search/count', async ({ request }) => {
      const body = (await request.json()) as { prefix: string };
      prefixes.push(body.prefix);
      return HttpResponse.json({ count: 0 });
    }),
    http.post('/api/v1/tracking/sites', () => HttpResponse.json({ id: 42, status: 'ok' })),
    http.delete('/api/v1/tracking/draftSites/:id', () => HttpResponse.json({ status: 'ok' }))
  );

  return (prefix: string) => prefixes.filter((searched) => searched === prefix).length;
};

/** Subscription bookkeeping is not observable from the outside, so yield and let it settle. */
const yieldToStore = () => new Promise((resolve) => setTimeout(resolve, 0));

type QuerySubscription = PromiseLike<unknown> & { unsubscribe: () => void };

/**
 * Runs a query the way the planting sites list does, then drops its subscription the way navigating
 * away from the list does.
 */
const searchAndLeave = async (
  store: AppStore,
  thunk: ThunkAction<QuerySubscription, RootState, unknown, AnyAction>
) => {
  const subscription = store.dispatch(thunk);
  await subscription;
  subscription.unsubscribe();
  await yieldToStore();
};

describe('planting sites list cache invalidation', () => {
  it('searches again for the sites and their count after a site is created', async () => {
    const searchesFor = trackSearches();
    const store = makeStore();

    await searchAndLeave(
      store,
      plantingSitesSearchApi.endpoints.searchPlantingSites.initiate({ organizationId: ORGANIZATION_ID })
    );
    await searchAndLeave(store, plantingSitesSearchApi.endpoints.countPlantingSites.initiate(ORGANIZATION_ID));
    expect(searchesFor('plantingSites')).toBe(2);

    await store.dispatch(
      plantingSitesApi.endpoints.createPlantingSite.initiate({ name: 'New Site', organizationId: ORGANIZATION_ID })
    );

    // the list prefers whatever is cached, so the stale results must be gone rather than merely stale
    await searchAndLeave(
      store,
      plantingSitesSearchApi.endpoints.searchPlantingSites.initiate({ organizationId: ORGANIZATION_ID })
    );
    await searchAndLeave(store, plantingSitesSearchApi.endpoints.countPlantingSites.initiate(ORGANIZATION_ID));
    expect(searchesFor('plantingSites')).toBe(4);
  });

  it('searches again for the drafts and their count after a draft is deleted', async () => {
    const searchesFor = trackSearches();
    const store = makeStore();

    await searchAndLeave(
      store,
      draftPlantingSitesSearchApi.endpoints.searchDraftPlantingSites.initiate({ organizationId: ORGANIZATION_ID })
    );
    await searchAndLeave(
      store,
      draftPlantingSitesSearchApi.endpoints.countDraftPlantingSites.initiate(ORGANIZATION_ID)
    );
    expect(searchesFor('draftPlantingSites')).toBe(2);

    await store.dispatch(draftPlantingSitesApi.endpoints.deleteDraftPlantingSite.initiate(7));

    await searchAndLeave(
      store,
      draftPlantingSitesSearchApi.endpoints.searchDraftPlantingSites.initiate({ organizationId: ORGANIZATION_ID })
    );
    await searchAndLeave(
      store,
      draftPlantingSitesSearchApi.endpoints.countDraftPlantingSites.initiate(ORGANIZATION_ID)
    );
    expect(searchesFor('draftPlantingSites')).toBe(4);
  });
});

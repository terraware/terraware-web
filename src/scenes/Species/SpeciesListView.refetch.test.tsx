import React from 'react';

import { act, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';
import { buildOrganization, buildSpeciesList, mockGet, mockPost, renderWithProviders, server } from 'src/test-utils';

describe('SpeciesListView refetch behaviour', () => {
  it('keeps the loaded page mounted while the species list refetches', async () => {
    // Hold the second (refetch) response open so the in-flight window stays open for a deterministic
    // assertion, rather than racing a fast response with a sampling interval.
    let releaseRefetch: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      releaseRefetch = resolve;
    });
    let resolveStarted: () => void = () => undefined;
    const refetchStarted = new Promise<void>((resolve) => {
      resolveStarted = resolve;
    });
    let calls = 0;
    server.use(
      http.get('/api/v1/species', async () => {
        calls += 1;
        if (calls > 1) {
          resolveStarted();
          await held;
        }
        return HttpResponse.json({ status: 'ok', species: buildSpeciesList() });
      })
    );
    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search', { results: [] });

    const { store } = renderWithProviders(<SpeciesListView />, {
      organization: { selectedOrganization: buildOrganization() },
    });

    expect(await screen.findByText('Acacia koa')).toBeInTheDocument();

    // What updateProject does: invalidate the species list (extensions/projects.ts). Under the old
    // gate this flipped isFetching, replaced the whole page with the initial-load spinner, and
    // unmounted SpeciesCheckModal mid-flow.
    await act(async () => {
      store.dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.Species, id: 'LIST' }]));
      await refetchStarted;
    });

    // The refetch is in flight and held open. The loaded page must still be mounted, not replaced by
    // the initial-load spinner.
    expect(screen.getByText('Acacia koa')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    await act(async () => {
      releaseRefetch();
      await held;
    });
  });
});

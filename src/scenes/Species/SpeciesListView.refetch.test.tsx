import React from 'react';

import { screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { baseApi } from 'src/queries/baseApi';
import { QueryTagTypes } from 'src/queries/tags';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';
import { buildOrganization, buildSpeciesList, mockGet, mockPost, renderWithProviders, server } from 'src/test-utils';

const tableIsRendered = () => (document.body.textContent ?? '').includes('Acacia koa');

describe('SpeciesListView refetch behaviour', () => {
  it('keeps the loaded page mounted for the whole species refetch', async () => {
    let releaseRefetch: () => void = () => undefined;
    const refetchStarted = new Promise<void>((resolveStarted) => {
      const held = new Promise<void>((resolveHeld) => {
        releaseRefetch = resolveHeld;
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
    });
    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search', { results: [] });

    const { store } = renderWithProviders(<SpeciesListView />, {
      organization: { selectedOrganization: buildOrganization() },
    });

    expect(await screen.findByText('Acacia koa')).toBeInTheDocument();

    // Sample the DOM across the whole in-flight window rather than checking the end state, which
    // looks identical whether or not the page blanked in between.
    const samples: boolean[] = [];
    const sampler = setInterval(() => samples.push(tableIsRendered()), 2);

    // What updateProject does (extensions/projects.ts invalidates Species LIST).
    store.dispatch(baseApi.util.invalidateTags([{ type: QueryTagTypes.Species, id: 'LIST' }]));

    await refetchStarted;
    await new Promise((resolve) => setTimeout(resolve, 40));
    releaseRefetch();
    await new Promise((resolve) => setTimeout(resolve, 40));
    clearInterval(sampler);

    expect(samples.length).toBeGreaterThan(5);
    expect(samples.filter((rendered) => !rendered)).toHaveLength(0);
    expect(screen.getByText('Acacia koa')).toBeInTheDocument();
  });
});

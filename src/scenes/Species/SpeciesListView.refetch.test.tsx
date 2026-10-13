import React from 'react';

import { act, screen } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { baseApi } from 'src/queries/baseApi';
import { api as speciesApi } from 'src/queries/generated/species';
import { QueryTagTypes } from 'src/queries/tags';
import SpeciesListView from 'src/scenes/Species/SpeciesListView';
import {
  buildOrganization,
  buildSpecies,
  buildSpeciesList,
  mockGet,
  mockPost,
  renderWithProviders,
  server,
} from 'src/test-utils';

describe('SpeciesListView refetch behaviour', () => {
  it('restores the saved page after the forced refresh of cached species finishes', async () => {
    const pageIndexKey = 'species-list-table-pageIndex';
    const pageSizeKey = 'species-list-table-pageSize';
    const cachedSpecies = Array.from({ length: 30 }, (_, index) =>
      buildSpecies({ id: index + 1, scientificName: `Species ${String(index + 1).padStart(3, '0')}` })
    );
    let releaseRefetch: () => void = () => undefined;
    const held = new Promise<void>((resolve) => {
      releaseRefetch = resolve;
    });
    let calls = 0;
    server.use(
      http.get('/api/v1/species', async () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ status: 'ok', species: cachedSpecies });
        }
        await held;
        return HttpResponse.json({
          status: 'ok',
          species: cachedSpecies.map((species) => ({
            ...species,
            scientificName: `${species.scientificName} refreshed`,
          })),
        });
      })
    );
    mockGet('/api/v1/projects', { projects: [] });
    mockPost('/api/v1/search', {
      results: [{ id: 21, participantProjectSpecies: [{ project: { name: 'Accelerator response complete' } }] }],
    });
    const organization = buildOrganization();
    const requests: string[] = [];
    server.events.on('request:start', ({ request }) => {
      requests.push(`${request.method} ${new URL(request.url).pathname}`);
    });
    const { store, rerender } = renderWithProviders(<></>, {
      organization: { selectedOrganization: organization },
    });
    const cachedQuery = store.dispatch(speciesApi.endpoints.listSpecies.initiate({ organizationId: organization.id }));
    await cachedQuery.unwrap();
    cachedQuery.unsubscribe();
    sessionStorage.setItem(pageIndexKey, '2');
    localStorage.setItem(pageSizeKey, '10');

    try {
      rerender(<SpeciesListView />);
      try {
        await screen.findByText('Accelerator response complete');
      } catch {
        const links = screen.queryAllByRole('link').map((el) => el.textContent);
        throw new Error(
          'DIAG ' +
            JSON.stringify({
              savedPageIndex: sessionStorage.getItem(pageIndexKey),
              savedPageSize: localStorage.getItem(pageSizeKey),
              bodyRowCount: document.querySelectorAll('tbody tr').length,
              linkCount: links.length,
              firstLinks: links.slice(0, 4),
              lastLinks: links.slice(-2),
              progressbars: screen.queryAllByRole('progressbar').length,
              noRecords: Boolean(screen.queryByText('No records to display')),
              emptyStatePage: Boolean(screen.queryByText(/Add Species to get started/i)),
              pageButtons: screen
                .queryAllByRole('button', { name: /Go to/ })
                .map((el) => `${el.getAttribute('aria-label')}=${(el as HTMLButtonElement).disabled}`),
              speciesCalls: calls,
              requests,
              queries: Object.entries(
                (store.getState() as unknown as Record<string, { queries?: Record<string, unknown> }>)['rtk-query']
                  ?.queries ?? {}
              ).map(([key, value]) => {
                const entry = value as { status?: string; error?: unknown; data?: unknown };
                return `${key}|${entry?.status}|${entry?.error ? 'ERR' : 'ok'}|${
                  entry?.data === undefined ? 'nodata' : JSON.stringify(entry.data).slice(0, 80)
                }`;
              }),
            })
        );
      }
      expect(screen.getByText('Accelerator response complete')).toBeVisible();
      expect(screen.getByRole('link', { name: 'Species 021' })).toBeVisible();

      await act(async () => {
        releaseRefetch();
        await held;
      });

      expect(await screen.findByRole('link', { name: 'Species 021 refreshed' })).toBeVisible();
      expect(screen.queryByRole('link', { name: 'Species 001 refreshed' })).not.toBeInTheDocument();
      expect(sessionStorage.getItem(pageIndexKey)).toBe('2');
    } finally {
      server.events.removeAllListeners('request:start');
      releaseRefetch();
      sessionStorage.removeItem(pageIndexKey);
      localStorage.removeItem(pageSizeKey);
    }
  });

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

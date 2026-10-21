import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';

import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { DraftPlantingSitePayload, useGetDraftPlantingSiteQuery } from 'src/queries/generated/draftPlantingSites';
import { makeStore } from 'src/redux/store';
import { buildDraftPlantingSite, mockPost, server } from 'src/test-utils';
import { MultiPolygon } from 'src/types/Tracking';

import useDraftPlantingSiteUpdate from './useDraftPlantingSiteUpdate';

const draftUrl = '/api/v1/tracking/draftSites/1';

const boundary: MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [0, 0],
        [0, 2],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
    ],
  ],
};

const beforeSave: DraftPlantingSitePayload = {
  createdBy: 1,
  createdTime: '2026-01-01T00:00:00Z',
  data: {},
  id: 1,
  modifiedTime: '2026-01-01T00:00:00Z',
  name: 'Draft Planting Site',
  organizationId: 1,
  siteEditStep: 'site_boundary',
  siteType: 'Detailed',
  strata: [],
};

const afterSave: DraftPlantingSitePayload = {
  ...beforeSave,
  boundary,
  modifiedTime: '2026-01-02T00:00:00Z',
  siteEditStep: 'exclusion_areas',
};

const renderEditor = () => {
  const store = makeStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );

  return renderHook(() => ({ cached: useGetDraftPlantingSiteQuery(1), update: useDraftPlantingSiteUpdate(1) }), {
    wrapper,
  });
};

const problems = [{ problemType: 'StratumTooSmall', stratum: 'stratum1' }];

const mockDraftEndpoints = () => {
  const state = { saved: false };
  server.use(
    http.get(draftUrl, () => HttpResponse.json({ site: state.saved ? afterSave : beforeSave, status: 'ok' })),
    http.put(draftUrl, () => {
      state.saved = true;
      return HttpResponse.json({ status: 'ok' });
    })
  );
  return state;
};

const renderWithProblems = async () => {
  const state = mockDraftEndpoints();
  mockPost('/api/v1/tracking/sites/validate', { isValid: false, problems });

  const rendered = renderEditor();
  await waitFor(() => expect(rendered.result.current.cached.isSuccess).toBe(true));

  act(() =>
    rendered.result.current.update.updateDraft(
      { draft: buildDraftPlantingSite({ boundary, siteEditStep: 'exclusion_areas' }), nextStep: 'exclusion_areas' },
      false
    )
  );
  await waitFor(() => expect(rendered.result.current.update.problems).toEqual(problems));

  return { ...rendered, state };
};

describe('useDraftPlantingSiteUpdate', () => {
  test('continues from the saved draft rather than the copy cached before saving', async () => {
    let saved = false;
    server.use(
      http.get(draftUrl, () => HttpResponse.json({ site: saved ? afterSave : beforeSave, status: 'ok' })),
      http.put(draftUrl, () => {
        saved = true;
        return HttpResponse.json({ status: 'ok' });
      })
    );
    mockPost('/api/v1/tracking/sites/validate', { isValid: true, problems: [] });

    const { result } = renderEditor();
    await waitFor(() => expect(result.current.cached.isSuccess).toBe(true));

    act(() =>
      result.current.update.updateDraft(
        { draft: buildDraftPlantingSite({ boundary, siteEditStep: 'exclusion_areas' }), nextStep: 'exclusion_areas' },
        false
      )
    );

    await waitFor(() => expect(result.current.update.updatedDraft).toBeDefined());
    expect(saved).toBe(true);
    expect(result.current.update.updatedDraft?.draft.boundary).toEqual(boundary);
    expect(result.current.update.updatedDraft?.draft.siteEditStep).toBe('exclusion_areas');
  });

  test('returns validation problems without saving the draft', async () => {
    const { result, state } = await renderWithProblems();

    expect(state.saved).toBe(false);
    expect(result.current.update.updatedDraft).toBeUndefined();
  });

  test('saves the draft despite validation problems when the user chooses to save anyway', async () => {
    const { result, state } = await renderWithProblems();

    act(() => result.current.update.onSaveAnyway());

    expect(result.current.update.problems).toBeUndefined();
    await waitFor(() => expect(result.current.update.updatedDraft).toBeDefined());
    expect(state.saved).toBe(true);
    expect(result.current.update.updatedDraft?.draft.boundary).toEqual(boundary);
  });

  test('discards the pending save when the user cancels after seeing validation problems', async () => {
    const { result, state } = await renderWithProblems();

    act(() => result.current.update.onCancelSave());

    expect(result.current.update.problems).toBeUndefined();
    await waitFor(() => expect(result.current.update.isUpdating).toBe(false));
    expect(state.saved).toBe(false);
    expect(result.current.update.updatedDraft).toBeUndefined();
  });
});

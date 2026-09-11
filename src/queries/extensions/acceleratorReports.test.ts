import { describe, expect, it } from '@rstest/core';
import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import { api } from 'src/queries/generated/acceleratorReports';
import { makeStore } from 'src/redux/store';
import { server } from 'src/test-utils/msw/server';

const PROJECT_ID = 100;

const buildReport = (id: number, overrides: Record<string, unknown> = {}) => ({
  achievements: [],
  autoCalculatedIndicators: [],
  challenges: [],
  commonIndicators: [],
  endDate: '2026-03-31',
  id,
  modifiedBy: 1,
  modifiedByUser: { email: 'a@b.com', firstName: 'A', id: 1, lastName: 'B' },
  modifiedTime: '2026-02-01T00:00:00Z',
  photos: [],
  projectId: PROJECT_ID,
  projectIndicators: [],
  quarter: 'Q1',
  startDate: '2026-01-01',
  status: 'Not Submitted',
  unpublishedProperties: [],
  ...overrides,
});

/** Counts GET requests per report id, so a refetch is observable. */
const trackReportFetches = (reports: Record<number, Record<string, unknown>>) => {
  const fetches: number[] = [];

  server.use(
    http.get('/api/v1/accelerator/reports/:reportId', ({ params }) => {
      const reportId = Number(params.reportId);
      fetches.push(reportId);
      return HttpResponse.json({ status: 'ok', report: reports[reportId] });
    }),
    http.post('/api/v1/accelerator/reports/:reportId', () => HttpResponse.json({ status: 'ok' })),
    http.post('/api/v1/accelerator/reports/:reportId/indicators/review', () => HttpResponse.json({ status: 'ok' })),
    http.post('/api/v1/accelerator/reports/:reportId/indicators/refresh', () => HttpResponse.json({ status: 'ok' })),
    http.post('/api/v1/accelerator/projects/:projectId/reports/projectIndicatorTarget', () =>
      HttpResponse.json({ status: 'ok' })
    ),
    http.post('/api/v1/accelerator/projects/:projectId/reports/projectIndicatorTarget/baseline', () =>
      HttpResponse.json({ status: 'ok' })
    )
  );

  return {
    countFor: (reportId: number) => fetches.filter((id) => id === reportId).length,
    fetches,
  };
};

/**
 * A dropped subscription is not observable from the outside, so there is no condition for `waitFor`
 * to poll; yield the event loop instead and let RTK Query's subscription bookkeeping settle.
 */
const yieldToStore = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('accelerator report cache invalidation', () => {
  it("refetches the project's other reports when one report's values are edited", async () => {
    const tracker = trackReportFetches({ 1: buildReport(1), 2: buildReport(2, { quarter: 'Q3' }) });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));
    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 2, includeIndicators: true }));

    expect(tracker.countFor(1)).toBe(1);
    expect(tracker.countFor(2)).toBe(1);

    await store.dispatch(
      api.endpoints.updateOneAcceleratorReportValues.initiate({
        reportId: 1,
        updateAcceleratorReportValuesRequestPayload: { achievements: [], challenges: [], projectIndicators: [] },
      })
    );

    await waitFor(() => expect(tracker.countFor(2)).toBe(2));
  });

  it("refetches the project's other reports when one report's indicators are reviewed", async () => {
    const tracker = trackReportFetches({ 1: buildReport(1), 2: buildReport(2, { quarter: 'Q3' }) });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));
    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 2, includeIndicators: true }));

    expect(tracker.countFor(1)).toBe(1);
    expect(tracker.countFor(2)).toBe(1);

    await store.dispatch(
      api.endpoints.reviewOneAcceleratorReportIndicators.initiate({
        reportId: 1,
        reviewAcceleratorReportIndicatorsRequestPayload: {
          autoCalculatedIndicators: [],
          commonIndicators: [],
          projectIndicators: [],
        },
      })
    );

    await waitFor(() => expect(tracker.countFor(2)).toBe(2));
  });

  it("refetches the project's other reports when one report's auto calculated indicators are refreshed", async () => {
    const tracker = trackReportFetches({ 1: buildReport(1), 2: buildReport(2, { quarter: 'Q3' }) });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));
    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 2, includeIndicators: true }));

    expect(tracker.countFor(1)).toBe(1);
    expect(tracker.countFor(2)).toBe(1);

    await store.dispatch(
      api.endpoints.refreshOneAcceleratorReportAutoCalculatedIndicators.initiate({
        reportId: 1,
        indicators: ['Seeds Collected'],
      })
    );

    await waitFor(() => expect(tracker.countFor(2)).toBe(2));
  });
  it('refetches a report when a yearly target it renders is updated', async () => {
    const tracker = trackReportFetches({ 1: buildReport(1) });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));

    expect(tracker.countFor(1)).toBe(1);

    await store.dispatch(
      api.endpoints.updateProjectIndicatorTarget.initiate({
        projectId: PROJECT_ID,
        updateProjectIndicatorTargetRequestPayload: { indicatorId: 5, target: 10, year: 2026 },
      })
    );

    await waitFor(() => expect(tracker.countFor(1)).toBe(2));
  });

  it('refetches a report whose yearly target was updated while the report had no subscribers', async () => {
    const tracker = trackReportFetches({ 1: buildReport(1) });
    const store = makeStore();

    const subscription = store.dispatch(
      api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true })
    );
    await subscription;

    subscription.unsubscribe();
    await yieldToStore();

    await store.dispatch(
      api.endpoints.updateProjectIndicatorTarget.initiate({
        projectId: PROJECT_ID,
        updateProjectIndicatorTargetRequestPayload: { indicatorId: 5, target: 10, year: 2026 },
      })
    );
    await yieldToStore();

    await store.dispatch(
      api.endpoints.getOneAcceleratorReport.initiate(
        { reportId: 1, includeIndicators: true },
        { forceRefetch: false, subscribe: true }
      )
    );

    await waitFor(() => expect(tracker.countFor(1)).toBe(2));
  });

  it('refetches a report from another year when a yearly target is updated', async () => {
    const tracker = trackReportFetches({
      1: buildReport(1, { endDate: '2027-03-31', startDate: '2027-01-01' }),
    });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));

    await store.dispatch(
      api.endpoints.updateProjectIndicatorTarget.initiate({
        projectId: PROJECT_ID,
        updateProjectIndicatorTargetRequestPayload: { indicatorId: 5, target: 10, year: 2026 },
      })
    );

    await waitFor(() => expect(tracker.countFor(1)).toBe(2));
  });

  it('refetches a report when the end of project target it renders is updated', async () => {
    const tracker = trackReportFetches({ 1: buildReport(1) });
    const store = makeStore();

    await store.dispatch(api.endpoints.getOneAcceleratorReport.initiate({ reportId: 1, includeIndicators: true }));

    await store.dispatch(
      api.endpoints.updateProjectIndicatorBaselineTarget.initiate({
        projectId: PROJECT_ID,
        updateProjectIndicatorBaselineTargetRequestPayload: { endOfProjectTarget: 500, indicatorId: 5 },
      })
    );

    await waitFor(() => expect(tracker.countFor(1)).toBe(2));
  });
});

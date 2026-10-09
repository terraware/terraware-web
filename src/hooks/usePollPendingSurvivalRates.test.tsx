import React from 'react';

import { rs } from '@rstest/core';
import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, delay, http } from 'msw';

import { API_PULL_INTERVAL } from 'src/constants';
import usePollPendingSurvivalRates from 'src/hooks/usePollPendingSurvivalRates';
import { ObservationResultsPayload, useGetObservationResultsQuery } from 'src/queries/generated/observations';
import { renderWithProviders, server } from 'src/test-utils';
import { hasPendingResults } from 'src/utils/observation';

const OBSERVATION_ID = 11;
const PLANTING_SITE_ID = 22;
const RESULTS_URL = `/api/v1/tracking/observations/${OBSERVATION_ID}/results`;
const STATUS_URL = `/api/v1/tracking/sites/${PLANTING_SITE_ID}/calculationInProgress`;

const buildResults = (overrides: Partial<ObservationResultsPayload>): ObservationResultsPayload => ({
  isAdHoc: false,
  observationId: OBSERVATION_ID,
  pending: false,
  plantingSiteId: PLANTING_SITE_ID,
  species: [],
  startDate: '2026-01-01',
  state: 'Completed',
  strata: [],
  survivalRate: 72,
  type: 'Monitoring',
  ...overrides,
});

/**
 * Serves each response in turn, repeating the last one, and counts the requests. Without a short
 * response delay, the status check and refetch finish before the pending results can be observed.
 */
const mockSequence = <T,>(path: string, responses: T[], wrap: (response: T) => Record<string, unknown>) => {
  const requests = { count: 0 };
  server.use(
    http.get(path, async () => {
      const response = responses[Math.min(requests.count, responses.length - 1)];
      requests.count += 1;
      await delay(10);
      return HttpResponse.json({ status: 'ok', ...wrap(response) });
    })
  );
  return requests;
};

const mockResults = (responses: ObservationResultsPayload[]) =>
  mockSequence(RESULTS_URL, responses, (observation) => ({ observation }));

const mockStatus = (responses: boolean[]) =>
  mockSequence(STATUS_URL, responses, (calculationInProgress) => ({ calculationInProgress }));

const SurvivalRate = () => {
  const { currentData } = useGetObservationResultsQuery({ observationId: OBSERVATION_ID });
  const results = currentData?.observation;
  const pending = hasPendingResults(results);

  usePollPendingSurvivalRates(results?.plantingSiteId, pending);

  if (!results) {
    return null;
  }

  return (
    <div>
      <p>Survival rate {results.survivalRate}%</p>
      {pending && <p>Recalculating</p>}
    </div>
  );
};

const advancePastPollInterval = () => rs.advanceTimersByTimeAsync(API_PULL_INTERVAL + 1000);

describe('usePollPendingSurvivalRates', () => {
  beforeEach(() => {
    // Date stays real so the hook's "is this status newer than the pending results" comparison sees
    // real elapsed time; only the scheduling of RTK Query's poll is under the test's control.
    rs.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
    });
  });

  afterEach(() => {
    rs.useRealTimers();
  });

  it('does not check calculation status when the results are up to date', async () => {
    mockResults([buildResults({ pending: false })]);
    const statusRequests = mockStatus([false]);

    renderWithProviders(<SurvivalRate />);

    expect(await screen.findByText('Survival rate 72%')).toBeInTheDocument();
    expect(screen.queryByText('Recalculating')).not.toBeInTheDocument();

    await advancePastPollInterval();

    expect(statusRequests.count).toBe(0);
  });

  it('shows recalculated results as soon as the calculation is already done, then stops polling', async () => {
    const resultsRequests = mockResults([
      buildResults({ pending: true, survivalRate: 72 }),
      buildResults({ pending: false, survivalRate: 65 }),
    ]);
    const statusRequests = mockStatus([false]);

    renderWithProviders(<SurvivalRate />);

    expect(await screen.findByText('Survival rate 72%')).toBeInTheDocument();
    expect(screen.getByText('Recalculating')).toBeInTheDocument();

    expect(await screen.findByText('Survival rate 65%')).toBeInTheDocument();
    expect(screen.queryByText('Recalculating')).not.toBeInTheDocument();
    expect(resultsRequests.count).toBe(2);
    expect(statusRequests.count).toBe(1);

    await advancePastPollInterval();
    await advancePastPollInterval();

    expect(statusRequests.count).toBe(1);
    expect(resultsRequests.count).toBe(2);
  });

  it('keeps showing the pending results while the calculation runs, and refreshes once a later poll reports it done', async () => {
    const resultsRequests = mockResults([
      buildResults({ pending: true, survivalRate: 72 }),
      buildResults({ pending: false, survivalRate: 65 }),
    ]);
    const statusRequests = mockStatus([true, false]);

    renderWithProviders(<SurvivalRate />);

    expect(await screen.findByText('Survival rate 72%')).toBeInTheDocument();
    await waitFor(() => expect(statusRequests.count).toBe(1));

    // Give an erroneous refetch a chance to happen before asserting it didn't.
    await rs.advanceTimersByTimeAsync(1000);
    expect(resultsRequests.count).toBe(1);
    expect(screen.getByText('Recalculating')).toBeInTheDocument();

    await advancePastPollInterval();

    await waitFor(() => expect(statusRequests.count).toBe(2));
    expect(await screen.findByText('Survival rate 65%')).toBeInTheDocument();
    expect(screen.queryByText('Recalculating')).not.toBeInTheDocument();
    expect(resultsRequests.count).toBe(2);
  });

  it('keeps polling when the refetched results are still pending', async () => {
    const resultsRequests = mockResults([
      buildResults({ pending: true, survivalRate: 72 }),
      buildResults({ pending: true, survivalRate: 68 }),
      buildResults({ pending: false, survivalRate: 65 }),
    ]);
    const statusRequests = mockStatus([false]);

    renderWithProviders(<SurvivalRate />);

    expect(await screen.findByText('Survival rate 68%')).toBeInTheDocument();
    expect(screen.getByText('Recalculating')).toBeInTheDocument();
    expect(resultsRequests.count).toBe(2);
    expect(statusRequests.count).toBe(1);

    await advancePastPollInterval();

    await waitFor(() => expect(statusRequests.count).toBe(2));
    expect(await screen.findByText('Survival rate 65%')).toBeInTheDocument();
    expect(screen.queryByText('Recalculating')).not.toBeInTheDocument();
    expect(resultsRequests.count).toBe(3);

    await advancePastPollInterval();

    expect(statusRequests.count).toBe(2);
  });
});

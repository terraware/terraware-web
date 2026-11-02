import React, { useState } from 'react';

import { rs } from '@rstest/core';
import { act, screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw/http';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import { OrganizationContext } from 'src/providers/contexts';
import { OrganizationNurserySummaryPayload } from 'src/queries/generated/nurserySummaries';
import SeedlingsDashboard from 'src/scenes/SeedlingsDashboard';
import strings from 'src/strings';
import { buildOrganization, captureRequests, mockError, mockGet, renderWithProviders, server } from 'src/test-utils';

const SUMMARY_URL = '/api/v1/nursery/summary';
const summary: OrganizationNurserySummaryPayload = {
  totalQuantity: 12960,
  batchesWithInventory: 15,
  speciesWithInventory: 7,
  germinatingQuantity: 1200,
  activeGrowthQuantity: 3400,
  hardeningOffQuantity: 560,
  readyQuantity: 9000,
  notReadyQuantity: 0,
  totalDead: 130,
  totalWithdrawn: 2500,
};

const SwitchableDashboard = () => {
  const organization = useOrganization();
  const [selectedOrganization, setSelectedOrganization] = useState(organization.selectedOrganization);

  return (
    <OrganizationContext.Provider value={{ ...organization, selectedOrganization }}>
      <button onClick={() => setSelectedOrganization(buildOrganization({ id: 2 }))}>Switch organization</button>
      <SeedlingsDashboard />
    </OrganizationContext.Provider>
  );
};

describe('SeedlingsDashboard', () => {
  beforeEach(() => {
    mockGet(SUMMARY_URL, { summary });
  });

  it('identifies the dashboard as Seedlings Dashboard', () => {
    renderWithProviders(<SeedlingsDashboard />);

    expect(screen.getByRole('heading', { name: strings.SEEDLINGS_DASHBOARD, level: 1 })).toBeInTheDocument();
  });

  it('links the server totals to inventory and the explicit batch and species tabs', async () => {
    renderWithProviders(<SeedlingsDashboard />);

    expect(await screen.findByRole('link', { name: '12,960' })).toHaveAttribute('href', '/inventory');
    expect(within(screen.getByRole('region', { name: strings.TOTAL_BATCHES })).getByRole('link')).toHaveAttribute(
      'href',
      '/inventory?tab=batches_by_batch'
    );
    expect(screen.getByRole('link', { name: '15' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '7' })).toHaveAttribute('href', '/inventory?tab=batches_by_species');
  });

  it('shows loading instead of fabricated zeros before the response arrives', async () => {
    renderWithProviders(<SeedlingsDashboard />);

    expect(screen.getAllByRole('progressbar')).toHaveLength(7);
    expect(
      within(screen.getByRole('region', { name: strings.TOTAL_SEEDLINGS })).queryByRole('link')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText(strings.SEEDLINGS_DASHBOARD_MESSAGE_TITLE)).not.toBeInTheDocument();
    expect(await screen.findByRole('link', { name: '12,960' })).toBeInTheDocument();
  });

  it('shows all four stage counts without filtered inventory links', async () => {
    renderWithProviders(<SeedlingsDashboard />);
    await screen.findByRole('link', { name: '12,960' });

    for (const [label, quantity] of [
      [strings.GERMINATING, '1,200'],
      [strings.ACTIVE_GROWTH, '3,400'],
      [strings.HARDENING_OFF, '560'],
      [strings.READY, '9,000'],
    ]) {
      const stage = within(screen.getByRole('region', { name: label }));
      expect(stage.getByText(quantity)).toBeInTheDocument();
      expect(stage.queryByRole('link')).not.toBeInTheDocument();
      expect(stage.queryByRole('button')).not.toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: strings.SEE_ALL_INVENTORY })).toHaveAttribute('href', '/inventory');
  });

  it('shows an error in every summary and stage card without inventing totals', async () => {
    mockError('get', SUMMARY_URL);

    renderWithProviders(<SeedlingsDashboard />);

    expect(await screen.findAllByText(strings.GENERIC_ERROR)).toHaveLength(7);
    expect(
      within(screen.getByRole('region', { name: strings.TOTAL_SEEDLINGS })).queryByRole('link')
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
    expect(screen.queryByText(strings.SEEDLINGS_DASHBOARD_MESSAGE_TITLE)).not.toBeInTheDocument();
  });

  it('formats quantities using the active locale', async () => {
    renderWithProviders(<SeedlingsDashboard />, {
      localization: { activeLocale: 'fr', selectedLocale: 'fr' },
    });

    expect(await screen.findByText('12\u202f960', { normalizer: (text) => text.trim() })).toBeInTheDocument();
  });

  it('shows the onboarding banner and zero cards when no batches contain inventory', async () => {
    mockGet(SUMMARY_URL, {
      summary: {
        ...summary,
        totalQuantity: 0,
        batchesWithInventory: 0,
        speciesWithInventory: 0,
        germinatingQuantity: 0,
        activeGrowthQuantity: 0,
        hardeningOffQuantity: 0,
        readyQuantity: 0,
      },
    });
    renderWithProviders(<SeedlingsDashboard />);

    expect(await screen.findByText(strings.SEEDLINGS_DASHBOARD_MESSAGE_TITLE)).toBeInTheDocument();
    expect(screen.getByText(strings.SEEDLINGS_DASHBOARD_MESSAGE)).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(7);
    expect(screen.getByRole('button', { name: strings.ADD_INVENTORY })).toBeInTheDocument();
  });

  it('does not show onboarding when the inventory is only germinating', async () => {
    mockGet(SUMMARY_URL, {
      summary: {
        ...summary,
        totalQuantity: 0,
        activeGrowthQuantity: 0,
        hardeningOffQuantity: 0,
        readyQuantity: 0,
      },
    });
    renderWithProviders(<SeedlingsDashboard />);

    expect(await screen.findByRole('link', { name: '0' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '15' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: strings.GERMINATING })).getByText('1,200')).toBeInTheDocument();
    expect(screen.queryByText(strings.SEEDLINGS_DASHBOARD_MESSAGE_TITLE)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.ADD_INVENTORY })).not.toBeInTheDocument();
  });

  it('does not request or show metrics until an organization is selected', () => {
    const requests = captureRequests('get', SUMMARY_URL, { summary });
    renderWithProviders(<SeedlingsDashboard />, { organization: { selectedOrganization: undefined } });

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('hides the previous organization totals while fetching the new organization', async () => {
    let resolveSecond!: () => void;
    const secondResponse = new Promise<void>((resolve) => {
      resolveSecond = resolve;
    });
    const requestedOrganizations: string[] = [];
    server.use(
      http.get(SUMMARY_URL, async ({ request }) => {
        const organizationId = new URL(request.url).searchParams.get('organizationId')!;
        requestedOrganizations.push(organizationId);
        if (organizationId === '2') {
          await secondResponse;
        }
        return HttpResponse.json({
          status: 'ok',
          summary: {
            ...summary,
            totalQuantity: organizationId === '2' ? 4321 : summary.totalQuantity,
          },
        });
      })
    );

    const { user } = renderWithProviders(<SwitchableDashboard />);
    expect(await screen.findByRole('link', { name: '12,960' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Switch organization' }));

    expect(screen.queryByText('12,960')).not.toBeInTheDocument();
    expect(screen.getAllByRole('progressbar')).toHaveLength(7);
    resolveSecond();
    expect(await screen.findByRole('link', { name: '4,321' })).toBeInTheDocument();
    expect(requestedOrganizations).toEqual(['1', '2']);
  });

  describe('refreshing totals', () => {
    beforeEach(() => {
      rs.stubEnv('PUBLIC_DISABLE_RECURRENT_REQUESTS', undefined);
      rs.useFakeTimers({
        shouldAdvanceTime: true,
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
      });
    });

    afterEach(() => {
      rs.useRealTimers();
      rs.unstubAllEnvs();
    });

    it('refreshes the displayed totals at the shared polling interval', async () => {
      renderWithProviders(<SeedlingsDashboard />);
      expect(await screen.findByRole('link', { name: '12,960' })).toBeInTheDocument();

      mockGet(SUMMARY_URL, { summary: { ...summary, totalQuantity: 5432 } });
      await act(async () => {
        await rs.advanceTimersByTimeAsync(API_PULL_INTERVAL + 1000);
      });

      expect(await screen.findByRole('link', { name: '5,432' })).toBeInTheDocument();
      expect(screen.queryByText('12,960')).not.toBeInTheDocument();
    });

    it('replaces stale totals with errors when a refresh fails', async () => {
      renderWithProviders(<SeedlingsDashboard />);
      expect(await screen.findByRole('link', { name: '12,960' })).toBeInTheDocument();

      mockError('get', SUMMARY_URL);
      await act(async () => {
        await rs.advanceTimersByTimeAsync(API_PULL_INTERVAL + 1000);
      });

      await waitFor(() => expect(screen.getAllByText(strings.GENERIC_ERROR)).toHaveLength(7));
      expect(screen.queryByText('12,960')).not.toBeInTheDocument();
      expect(
        within(screen.getByRole('region', { name: strings.TOTAL_SEEDLINGS })).queryByRole('link')
      ).not.toBeInTheDocument();
    });

    it('does not refresh when recurrent requests are disabled', async () => {
      rs.stubEnv('PUBLIC_DISABLE_RECURRENT_REQUESTS', 'true');
      renderWithProviders(<SeedlingsDashboard />);
      expect(await screen.findByRole('link', { name: '12,960' })).toBeInTheDocument();

      const requests = captureRequests('get', SUMMARY_URL, { summary: { ...summary, totalQuantity: 5432 } });
      await act(async () => {
        await rs.advanceTimersByTimeAsync(API_PULL_INTERVAL * 2);
      });

      expect(requests).toHaveLength(0);
      expect(screen.getByRole('link', { name: '12,960' })).toBeInTheDocument();
    });
  });
});

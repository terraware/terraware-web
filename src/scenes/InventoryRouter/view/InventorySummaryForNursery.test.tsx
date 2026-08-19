import React from 'react';

import { screen, waitFor } from '@testing-library/react';

import InventorySummaryForNursery from 'src/scenes/InventoryRouter/view/InventorySummaryForNursery';
import strings from 'src/strings';
import { mockError, mockGet, renderWithProviders } from 'src/test-utils';

const NURSERY_ID = 42;
const SUMMARY_URL = `/api/v1/nursery/facilities/${NURSERY_ID}/summary`;

const summary = {
  germinatingQuantity: 1200,
  activeGrowthQuantity: 3400,
  hardeningOffQuantity: 560,
  notReadyQuantity: 0,
  readyQuantity: 7800,
  totalQuantity: 12960,
  germinationRate: 87,
  lossRate: 4,
  totalDead: 130,
  totalWithdrawn: 2500,
  species: [
    { id: 1, scientificName: 'Acacia koa' },
    { id: 2, scientificName: 'Metrosideros polymorpha' },
  ],
};

describe('InventorySummaryForNursery', () => {
  it('renders the nursery quantities once the summary loads', async () => {
    mockGet(SUMMARY_URL, { summary });

    renderWithProviders(<InventorySummaryForNursery nurseryId={NURSERY_ID} />);

    expect(await screen.findByText('12,960')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('3,400')).toBeInTheDocument();
    expect(screen.getByText('7,800')).toBeInTheDocument();
    expect(screen.getByText('2,500')).toBeInTheDocument();
  });

  it('renders rates as percentages', async () => {
    mockGet(SUMMARY_URL, { summary });

    renderWithProviders(<InventorySummaryForNursery nurseryId={NURSERY_ID} />);

    expect(await screen.findByText('87%')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
  });

  it('formats quantities using the active locale', async () => {
    mockGet(SUMMARY_URL, { summary });

    renderWithProviders(<InventorySummaryForNursery nurseryId={NURSERY_ID} />, {
      localization: { activeLocale: 'fr', selectedLocale: 'fr' },
    });

    // French groups with a narrow no-break space rather than a comma. Match on the digits alone so
    // the assertion doesn't depend on which space character the runtime's ICU data picks.
    expect(await screen.findByText((content) => content.replace(/\s/g, '') === '12960')).toBeInTheDocument();
  });

  it('renders nothing until the summary arrives', () => {
    mockGet(SUMMARY_URL, { summary });

    renderWithProviders(<InventorySummaryForNursery nurseryId={NURSERY_ID} />);

    expect(screen.queryByText(strings.TOTAL_QUANTITY)).not.toBeInTheDocument();
  });

  it('raises a toast when the summary request fails', async () => {
    mockError('get', SUMMARY_URL);

    const { store } = renderWithProviders(<InventorySummaryForNursery nurseryId={NURSERY_ID} />);

    await waitFor(() => {
      expect(store.getState().snackbar.snackbars.toast).not.toBeNull();
    });

    expect(store.getState().snackbar.snackbars.toast).toMatchObject({
      type: 'toast',
      priority: 'critical',
    });
  });
});

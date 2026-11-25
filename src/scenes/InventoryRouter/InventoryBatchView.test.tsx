import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponentUtils from '@terraware/web-components/utils' with { rstest: 'importActual' };
import { screen } from '@testing-library/react';

import InventoryBatchView from 'src/scenes/InventoryRouter/InventoryBatchView';
import strings from 'src/strings';
import { buildBatch, buildOrganization, buildSpecies, mockGet, renderWithProviders } from 'src/test-utils';

/** Page reads this to size its own header insets, which differ between phone and desktop. */
let isMobile: boolean;
rstest.mock('@terraware/web-components/utils', () => ({
  ...webComponentUtils,
  useDeviceInfo: () => ({ isMobile, isTablet: false, isDesktop: !isMobile }),
}));

// Each tab body fetches its own data; this view's job is the page frame around them.
rstest.mock('./BatchDetails', () => ({ default: () => <div>batch details</div> }));
rstest.mock('./BatchHistory', () => ({ default: () => <div>batch history</div> }));
rstest.mock('./BatchSummary', () => ({ default: () => <div>batch summary</div> }));

const BATCH = buildBatch({ id: 7, speciesId: 3, facilityId: 100 });

const renderView = (origin: 'Batches' | 'Species' | 'Nursery' = 'Batches') => {
  mockGet(`/api/v1/nursery/batches/${BATCH.id}`, { batch: BATCH });
  mockGet('/api/v1/species', { species: [] });
  return renderWithProviders(
    <InventoryBatchView
      origin={origin}
      species={[buildSpecies({ id: 3, scientificName: 'Acacia koa', commonName: 'Koa' })]}
    />,
    {
      organization: { selectedOrganization: buildOrganization() },
      route: `/inventory/batch/${BATCH.id}`,
      path: '/inventory/batch/:batchId',
    }
  );
};

beforeEach(() => {
  isMobile = false;
});

describe('InventoryBatchView', () => {
  it('heads the page with the batch, its species and its nursery', async () => {
    renderView();

    expect(await screen.findByText(BATCH.batchNumber)).toBeInTheDocument();
    expect(screen.getByText('Acacia koa (Koa)')).toBeInTheDocument();
    expect(screen.getByText('Test Nursery')).toBeInTheDocument();
    expect(await screen.findByRole('tab', { name: strings.DETAILS })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: strings.HISTORY })).toBeInTheDocument();
  });

  it('keeps the Withdraw button at the end of the heading row', async () => {
    renderView();

    const withdraw = await screen.findByRole('button', { name: strings.WITHDRAW });

    // Page right-aligns its action slot with text-align, which does nothing to a flex child, so
    // without this the button sits at the left edge of its third of the row.
    expect(getComputedStyle(withdraw.parentElement as HTMLElement).justifyContent).toBe('flex-end');
  });

  // Page insets the heading by 16px on a desktop and not at all on a phone, so both have to be
  // checked: a fix pinned to one width silently regresses the other.
  it.each([
    ['a desktop', false],
    ['a phone', true],
  ])("insets the heading, but not the row's right edge, on %s", async (_label, mobile) => {
    isMobile = mobile;

    renderView();

    const row = (await screen.findByText(BATCH.batchNumber)).parentElement?.parentElement?.parentElement as HTMLElement;
    const { paddingLeft, paddingRight } = getComputedStyle(row);

    expect({ paddingLeft, paddingRight }).toEqual({ paddingLeft: '24px', paddingRight: '0px' });
  });

  it('offers a way back to where the batch was opened from', async () => {
    renderView('Nursery');

    const back = await screen.findByRole('link', { name: /Inventory/ });
    expect(back).toHaveAttribute('href', expect.stringContaining('/inventory'));
  });
});

import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponentUtils from '@terraware/web-components/utils' with { rstest: 'importActual' };
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, renderWithProviders } from 'src/test-utils';

import InventoryForNurseryView from './InventoryForNurseryView';

/** Page reads this to size its own header insets, which differ between phone and desktop. */
let isMobile: boolean;
rstest.mock('@terraware/web-components/utils', () => ({
  ...webComponentUtils,
  useDeviceInfo: () => ({ isMobile, isTablet: false, isDesktop: !isMobile }),
}));

// Both children fetch their own batch data; this view's job is the page frame around them.
rstest.mock('src/scenes/InventoryRouter/view/InventorySummaryForNursery', () => ({
  default: () => <div>nursery summary</div>,
}));
rstest.mock('src/scenes/InventoryRouter/view/InventorySeedlingsTableForNursery', () => ({
  default: () => <div>seedling batches</div>,
}));

const renderView = () =>
  renderWithProviders(<InventoryForNurseryView />, {
    organization: { selectedOrganization: buildOrganization() },
    path: '/inventory/nursery/:nurseryId',
    route: '/inventory/nursery/100?tab=batches_by_nursery',
  });

beforeEach(() => {
  isMobile = false;
});

describe('InventoryForNurseryView', () => {
  it('heads the page with the nursery it is showing batches for', () => {
    renderView();

    const title = screen.getByText(strings.formatString(strings.BATCHES_AT, 'Test Nursery').toString());
    expect(title).toBeInTheDocument();

    // Page butts the title against the breadcrumbs unless a page asks for a gap.
    expect(getComputedStyle(title).marginTop).toBe('24px');

    expect(screen.getByText('nursery summary')).toBeInTheDocument();
    expect(screen.getByText('seedling batches')).toBeInTheDocument();
  });

  it('offers a way back to the nursery tab of the inventory list', () => {
    renderView();

    const back = screen.getByRole('link', { name: strings.INVENTORY });
    expect(back).toHaveAttribute('href', expect.stringContaining('tab=batches_by_nursery'));
  });

  // Page insets the title by 40px on a desktop and not at all on a phone, so both have to be
  // checked: a fix pinned to one width silently regresses the other.
  it.each([
    ['a desktop', false],
    ['a phone', true],
  ])('lines the title up with the content on %s', (_label, mobile) => {
    isMobile = mobile;

    renderView();

    const title = screen.getByText(strings.formatString(strings.BATCHES_AT, 'Test Nursery').toString());
    const row = title.parentElement?.parentElement as HTMLElement;
    const inset = parseInt(getComputedStyle(row).paddingLeft, 10) + parseInt(getComputedStyle(title).paddingLeft, 10);

    expect(inset).toBe(24);
  });

  it('leaves the content laid out by a plain grid container, as it was before using Page', () => {
    renderView();

    // The table scrolls inside itself, which relies on its wrappers not introducing a column flex
    // context that it could widen instead. See InventoryV2View, where exactly that broke it.
    const contentWrapper = screen.getByText('nursery summary').parentElement?.parentElement as HTMLElement;
    const { display, flexDirection } = getComputedStyle(contentWrapper);
    expect({ display, flexDirection }).toEqual({ display: 'flex', flexDirection: 'row' });
  });
});

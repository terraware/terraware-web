import React from 'react';

import { rstest } from '@rstest/core';
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildOrganization, renderWithProviders } from 'src/test-utils';

import InventoryForNurseryView from './InventoryForNurseryView';

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

describe('InventoryForNurseryView', () => {
  it('heads the page with the nursery it is showing batches for', () => {
    renderView();

    const title = screen.getByText(strings.formatString(strings.BATCHES_AT, 'Test Nursery').toString());
    expect(title).toBeInTheDocument();

    // Page's defaults butt the title against the breadcrumbs and indent it 40px, past the back
    // link and the content; this page keeps the spacing it had before it used Page.
    const titleStyle = getComputedStyle(title);
    const rowStyle = getComputedStyle(title.parentElement?.parentElement as HTMLElement);
    expect(titleStyle.marginTop).toBe('24px');
    expect(`${parseInt(rowStyle.paddingLeft, 10) + parseInt(titleStyle.paddingLeft, 10)}px`).toBe('24px');

    expect(screen.getByText('nursery summary')).toBeInTheDocument();
    expect(screen.getByText('seedling batches')).toBeInTheDocument();
  });

  it('offers a way back to the nursery tab of the inventory list', () => {
    renderView();

    const back = screen.getByRole('link', { name: strings.INVENTORY });
    expect(back).toHaveAttribute('href', expect.stringContaining('tab=batches_by_nursery'));
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

import React from 'react';

import { rstest } from '@rstest/core';
import * as webComponentUtils from '@terraware/web-components/utils' with { rstest: 'importActual' };
import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { buildSpecies, renderWithProviders } from 'src/test-utils';

import InventoryForSpeciesView from './InventoryForSpeciesView';

/** Page reads this to size its own header insets, which differ between phone and desktop. */
let isMobile: boolean;
rstest.mock('@terraware/web-components/utils', () => ({
  ...webComponentUtils,
  useDeviceInfo: () => ({ isMobile, isTablet: false, isDesktop: !isMobile }),
}));

// Both children fetch their own batch data; this view's job is the page frame around them.
rstest.mock('src/scenes/InventoryRouter/view/InventorySummaryForSpecies', () => ({
  default: () => <div>species summary</div>,
}));
rstest.mock('src/scenes/InventoryRouter/view/InventorySeedlingsTableForSpecies', () => ({
  default: () => <div>seedling batches</div>,
}));

const species = [buildSpecies({ id: 7, scientificName: 'Acacia koa', commonName: 'Koa' })];

const renderView = (speciesList = species) =>
  renderWithProviders(<InventoryForSpeciesView species={speciesList} />, {
    path: '/inventory/:speciesId',
    route: '/inventory/7?batch=23-1',
  });

beforeEach(() => {
  isMobile = false;
});

describe('InventoryForSpeciesView', () => {
  it('heads the page with the species it is showing batches for', () => {
    renderView();

    const title = screen.getByText('Acacia koa (Koa)');
    expect(title).toBeInTheDocument();
    // The scientific name is set in italics, as it was before this view used Page.
    expect(getComputedStyle(title).fontStyle).toBe('italic');

    expect(screen.getByText('species summary')).toBeInTheDocument();
    expect(screen.getByText('seedling batches')).toBeInTheDocument();
  });

  it('falls back to the scientific name alone when the species has no common name', () => {
    renderView([buildSpecies({ id: 7, scientificName: 'Acacia koa', commonName: undefined })]);

    expect(screen.getByText('Acacia koa')).toBeInTheDocument();
  });

  it('offers a way back to the inventory list', () => {
    renderView();

    const back = screen.getByRole('link', { name: strings.INVENTORY });
    expect(back).toHaveAttribute('href', expect.stringContaining('/inventory'));
  });

  // Page insets the title by 40px on a desktop and not at all on a phone, so both have to be
  // checked: a fix pinned to one width silently regresses the other.
  it.each([
    ['a desktop', false],
    ['a phone', true],
  ])('lines the title up with the content on %s', (_label, mobile) => {
    isMobile = mobile;

    renderView();

    const title = screen.getByText('Acacia koa (Koa)');
    const row = title.parentElement?.parentElement as HTMLElement;
    const inset = parseInt(getComputedStyle(row).paddingLeft, 10) + parseInt(getComputedStyle(title).paddingLeft, 10);

    expect(inset).toBe(24);
    expect(getComputedStyle(title).marginTop).toBe('24px');
  });

  it('leaves the content laid out by a plain grid container, as it was before using Page', () => {
    renderView();

    // The table scrolls inside itself, which relies on its wrappers not introducing a column flex
    // context that it could widen instead. See InventoryV2View, where exactly that broke it.
    const contentWrapper = screen.getByText('species summary').parentElement?.parentElement as HTMLElement;
    const { display, flexDirection } = getComputedStyle(contentWrapper);
    expect({ display, flexDirection }).toEqual({ display: 'flex', flexDirection: 'row' });
  });
});

import React from 'react';
import { useLocation } from 'react-router';

import { rstest } from '@rstest/core';
import * as webComponentUtils from '@terraware/web-components/utils' with { rstest: 'importActual' };
import { screen } from '@testing-library/react';

import InventoryCreateView from 'src/scenes/InventoryRouter/InventoryCreateView';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

/** Page reads this to size its own header insets, which differ between phone and desktop. */
let isMobile: boolean;
rstest.mock('@terraware/web-components/utils', () => ({
  ...webComponentUtils,
  useDeviceInfo: () => ({ isMobile, isTablet: false, isDesktop: !isMobile }),
}));

// The form fetches species, nurseries and sub-locations of its own; this view frames it.
rstest.mock('src/scenes/InventoryRouter/form/BatchDetailsForm', () => ({
  default: () => <div>batch form</div>,
}));

/** Renders the current location so a test can assert on where a click navigated. */
const LocationProbe = () => <div data-testid='location'>{useLocation().pathname}</div>;

const renderView = () =>
  renderWithProviders(
    <>
      <InventoryCreateView />
      <LocationProbe />
    </>,
    { route: '/inventory/new' }
  );

beforeEach(() => {
  isMobile = false;
});

describe('InventoryCreateView', () => {
  it('frames the batch form with the page title and the save and cancel actions', () => {
    renderView();

    expect(screen.getAllByText(strings.ADD_INVENTORY).length).toBeGreaterThan(0);
    expect(screen.getByText(strings.ADD_INVENTORY_DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByText('batch form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.CANCEL })).toBeInTheDocument();
  });

  it('sends Cancel back to the inventory list', async () => {
    const { user } = renderView();

    await user.click(screen.getByRole('button', { name: strings.CANCEL }));

    expect(screen.getByTestId('location')).toHaveTextContent('/inventory');
  });

  it('lets TfMain lay the form out, so its body and bottom bar keep the full width', () => {
    renderView();

    // PageForm's body and bottom bar are siblings. Page's content wrapper is a row by default,
    // which would shrink them to their contents and throw the centred card off centre.
    const formBody = screen.getByText('batch form').parentElement?.parentElement?.parentElement as HTMLElement;
    expect(getComputedStyle(formBody.parentElement as HTMLElement).display).toBe('contents');
    expect((formBody.parentElement as HTMLElement).parentElement?.tagName).toBe('MAIN');
  });

  // Page insets the title by 40px on a desktop and not at all on a phone, so both have to be
  // checked: a fix pinned to one width silently regresses the other.
  it.each([
    ['a desktop', false],
    ['a phone', true],
  ])('insets the page title by the same amount on %s', (_label, mobile) => {
    isMobile = mobile;

    renderView();

    const title = screen.getAllByText(strings.ADD_INVENTORY)[0];
    const row = title.parentElement?.parentElement as HTMLElement;
    const inset = parseInt(getComputedStyle(row).paddingLeft, 10) + parseInt(getComputedStyle(title).paddingLeft, 10);

    expect(inset).toBe(24);
  });
});

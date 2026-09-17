import React, { act } from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PageHeaderWrapper from 'src/components/common/PageHeaderWrapper';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

const scrollTo = (scrollY: number) =>
  act(() => {
    window.scrollY = scrollY;
    window.dispatchEvent(new Event('scroll'));
  });

const renderHeader = (collapsible: boolean) =>
  renderWithProviders(
    <PageHeaderWrapper alwaysVisible collapsible={collapsible}>
      <div>Observations</div>
    </PageHeaderWrapper>
  );

describe('PageHeaderWrapper', () => {
  it('has no ear unless the header is collapsible', () => {
    renderHeader(false);
    scrollTo(400);

    expect(screen.getByText('Observations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.HIDE_TITLE_BAR })).not.toBeInTheDocument();
  });

  it('has no ear while the page is at the top', () => {
    renderHeader(true);

    expect(screen.getByText('Observations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.HIDE_TITLE_BAR })).not.toBeInTheDocument();
  });

  it('hides the header when the ear is clicked, leaving the ear to bring it back', async () => {
    renderHeader(true);
    scrollTo(400);

    await userEvent.click(screen.getByRole('button', { name: strings.HIDE_TITLE_BAR }));

    expect(screen.queryByText('Observations')).not.toBeInTheDocument();
    const ear = screen.getByRole('button', { name: strings.SHOW_TITLE_BAR });

    await userEvent.click(ear);

    expect(screen.getByText('Observations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: strings.HIDE_TITLE_BAR })).toBeInTheDocument();
  });

  it('shows a hidden header again once the page is scrolled back to the top', async () => {
    renderHeader(true);
    scrollTo(400);

    await userEvent.click(screen.getByRole('button', { name: strings.HIDE_TITLE_BAR }));
    expect(screen.queryByText('Observations')).not.toBeInTheDocument();

    scrollTo(0);

    expect(screen.getByText('Observations')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: strings.HIDE_TITLE_BAR })).not.toBeInTheDocument();
  });
});

import React from 'react';

import { screen } from '@testing-library/react';

import PendingSurvivalRate from 'src/components/SurvivalRate/PendingSurvivalRate';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

describe('PendingSurvivalRate', () => {
  it('shows the survival rate unmarked when no recalculation is pending', async () => {
    const { user } = renderWithProviders(<PendingSurvivalRate pending={false}>72%</PendingSurvivalRate>);

    const value = screen.getByText('72%');
    expect(screen.queryByText('72%*')).not.toBeInTheDocument();
    expect(value).not.toHaveStyle({ fontStyle: 'italic' });

    await user.hover(value);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('marks a pending survival rate with an italic asterisk', () => {
    renderWithProviders(<PendingSurvivalRate pending>72%</PendingSurvivalRate>);

    expect(screen.getByText('72%*')).toHaveStyle({ fontStyle: 'italic' });
  });

  it('explains that calculations are in progress when hovering a pending survival rate', async () => {
    const { user } = renderWithProviders(<PendingSurvivalRate pending>72%</PendingSurvivalRate>);

    await user.hover(screen.getByText('72%*'));

    expect(await screen.findByRole('tooltip')).toHaveTextContent(strings.SURVIVAL_RATE_CALCULATION_IN_PROGRESS_TOOLTIP);
  });

  it.each([
    ['undefined', undefined],
    ['an empty string', ''],
  ])('does not show a lone asterisk when the pending value is %s', (_label, value) => {
    renderWithProviders(<PendingSurvivalRate pending>{value}</PendingSurvivalRate>);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });
});

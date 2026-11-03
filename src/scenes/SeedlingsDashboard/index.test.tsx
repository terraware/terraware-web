import React from 'react';

import { screen } from '@testing-library/react';

import SeedlingsDashboard from 'src/scenes/SeedlingsDashboard';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

describe('SeedlingsDashboard', () => {
  it('identifies the dashboard as Seedlings Dashboard', () => {
    renderWithProviders(<SeedlingsDashboard />);

    expect(screen.getByRole('heading', { name: strings.SEEDLINGS_DASHBOARD, level: 1 })).toBeInTheDocument();
  });
});

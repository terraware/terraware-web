import React from 'react';

import { screen } from '@testing-library/react';

import { NurseryWithdrawalPayload } from 'src/queries/generated/nurseryWithdrawals';
import { SearchNurseryWithdrawalPayload } from 'src/queries/search/nurseries';
import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import WithdrawalOverview from './WithdrawalOverview';

const withdrawal: NurseryWithdrawalPayload = {
  batchWithdrawals: [],
  facilityId: 1,
  id: 2,
  purpose: 'Out Plant',
  withdrawnDate: '2026-09-27',
};

const withdrawalSummary: SearchNurseryWithdrawalPayload = {
  hasReassignments: false,
  nurseryName: 'Green Valley Nursery',
  purpose: 'Out Plant',
  totalWithdrawn: 2,
  withdrawalId: withdrawal.id,
  withdrawnDate: withdrawal.withdrawnDate,
};

describe('WithdrawalOverview', () => {
  it('does not show planting season fields for a withdrawal without a planting season', () => {
    renderWithProviders(<WithdrawalOverview withdrawal={withdrawal} withdrawalSummary={withdrawalSummary} />);

    expect(screen.queryByText(strings.PLANTING_SEASON)).not.toBeInTheDocument();
    expect(screen.queryByText(strings.PLANTING_DATE)).not.toBeInTheDocument();
  });

  it('shows the planting season and date associated with a withdrawal', () => {
    renderWithProviders(
      <WithdrawalOverview
        withdrawal={{ ...withdrawal, plantingSeasonId: 3, scheduledPlantingDateRequestId: 4 }}
        withdrawalSummary={{
          ...withdrawalSummary,
          plantingSeasonName: 'Fall 2026',
          plantingDate: '2026-10-15',
        }}
      />
    );

    expect(screen.getByText(strings.PLANTING_SEASON)).toBeInTheDocument();
    expect(screen.getByText('Fall 2026')).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_DATE)).toBeInTheDocument();
    expect(screen.getByText('2026-10-15')).toBeInTheDocument();
  });

  it('shows a fallback when the withdrawal has a planting season but no planting date', () => {
    renderWithProviders(
      <WithdrawalOverview
        withdrawal={{ ...withdrawal, plantingSeasonId: 3 }}
        withdrawalSummary={{ ...withdrawalSummary, plantingSeasonName: 'Fall 2026' }}
      />
    );

    expect(screen.getByText(strings.PLANTING_SEASON)).toBeInTheDocument();
    expect(screen.getByText(strings.PLANTING_DATE)).toBeInTheDocument();
    expect(screen.getByText(strings.NOT_WITHDRAWN_TO_DATE)).toBeInTheDocument();
  });
});

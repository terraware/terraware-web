import React, { useState } from 'react';

import { screen } from '@testing-library/react';

import strings from 'src/strings';
import { renderWithProviders } from 'src/test-utils';

import WithdrawDateWarningModal from './WithdrawDateWarningModal';

const Warning = () => {
  const [outcome, setOutcome] = useState<'cancelled' | 'continued'>();
  return outcome ? (
    <p>{outcome}</p>
  ) : (
    <WithdrawDateWarningModal onClose={() => setOutcome('cancelled')} onContinue={() => setOutcome('continued')} />
  );
};

describe('WithdrawDateWarningModal', () => {
  it('explains that the withdrawal predates receipt and allows cancellation', async () => {
    const { user } = renderWithProviders(<Warning />);
    expect(screen.getByText(strings.WITHDRAW_DATE_PREDATES_RECEIVED_DATE_WARNING)).toBeVisible();
    await user.click(screen.getByRole('button', { name: strings.CANCEL }));
    expect(screen.getByText('cancelled')).toBeVisible();
    expect(screen.queryByText('continued')).not.toBeInTheDocument();
  });

  it('continues only when the user confirms the warning', async () => {
    const { user } = renderWithProviders(<Warning />);
    expect(screen.queryByText('continued')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: strings.CONTINUE }));
    expect(screen.getByText('continued')).toBeVisible();
    expect(screen.queryByText('cancelled')).not.toBeInTheDocument();
  });
});

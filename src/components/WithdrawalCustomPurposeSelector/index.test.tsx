import React, { useState } from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import WithdrawalCustomPurposeSelector from 'src/components/WithdrawalCustomPurposeSelector';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import strings from 'src/strings';
import { buildOrganization, captureRequests, mockGet, renderWithProviders } from 'src/test-utils';

const CUSTOM_PURPOSES_URL = '/api/v1/withdrawalCustomPurposes';

const savedPurpose = (id: number, name: string): WithdrawalCustomPurposePayload => ({ id, name, isArchived: false });

const SAVED_PURPOSES = [savedPurpose(3, 'Sale'), savedPurpose(1, 'Donation'), savedPurpose(2, 'Research')];

/** Holds the value the way the withdrawal forms do, so typing round-trips through the parent. */
const Host = () => {
  const [value, setValue] = useState('');
  return <WithdrawalCustomPurposeSelector value={value} onChange={setValue} />;
};

const field = () => screen.getByPlaceholderText(strings.ENTER_OR_SELECT);

const openSuggestions = async (user: UserEvent) => {
  await user.click(field());
  return screen.findByRole('listbox');
};

/** The names the list is offering, in the order they are shown. */
const suggestions = () => screen.queryAllByRole('option').map((option) => option.textContent?.trim() ?? '');

describe('WithdrawalCustomPurposeSelector', () => {
  it("asks only for the selected organization's nursery purposes", async () => {
    const requests = captureRequests('get', CUSTOM_PURPOSES_URL, { customPurposes: [] });

    renderWithProviders(<Host />, {
      organization: { selectedOrganization: buildOrganization({ id: 77 }) },
    });

    await waitFor(() => expect(requests).toHaveLength(1));
    const params = new URL(requests[0].url).searchParams;
    expect(params.get('organizationId')).toBe('77');
    expect(params.get('type')).toBe('Nursery');
  });

  it('offers the saved purposes in alphabetical order', async () => {
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });

    const { user } = renderWithProviders(<Host />);

    const listbox = await openSuggestions(user);

    await waitFor(() => expect(within(listbox).getAllByRole('option')).toHaveLength(3));
    expect(suggestions()).toEqual(['Donation', 'Research', 'Sale']);
  });

  // The server matches a typed name to a saved purpose the same way, so a user who types "sale"
  // must be shown the "Sale" they already have rather than appearing to create a second one.
  it.each(['SALE', ' sale ', 'sále', 'al'])('narrows the suggestions to those matching %p', async (typed) => {
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });

    const { user } = renderWithProviders(<Host />);

    await openSuggestions(user);
    await user.paste(typed);

    await waitFor(() => expect(suggestions()).toEqual(['Sale']));
  });

  it('suggests nothing for a name the organization has not saved', async () => {
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });

    const { user } = renderWithProviders(<Host />);

    await openSuggestions(user);
    await user.paste('Giveaway');

    await waitFor(() => expect(suggestions()).toEqual([]));
  });
});

import React, { useState } from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';
import { http } from 'msw/http';

import WithdrawalCustomPurposeSelector from 'src/components/WithdrawalCustomPurposeSelector';
import { WithdrawalCustomPurposePayload } from 'src/queries/generated/withdrawalCustomPurposes';
import strings from 'src/strings';
import { buildOrganization, captureRequests, dialogTitled, mockGet, renderWithProviders, server } from 'src/test-utils';
import { OrganizationRole } from 'src/types/Organization';

const CUSTOM_PURPOSES_URL = '/api/v1/withdrawalCustomPurposes';
const CUSTOM_PURPOSE_URL = '/api/v1/withdrawalCustomPurposes/:customPurposeId';

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

/**
 * The names the list is offering, in the order they are shown. Read as text rather than by
 * accessible name, which also picks up the labels of the per-row buttons an admin sees.
 */
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

describe('WithdrawalCustomPurposeSelector reporting work in flight', () => {
  // The form holds the user on the purpose step while this is true, so a selector that goes away
  // mid-rename has to say so: otherwise the step it belongs to can never be left again.
  it('reports that nothing is in flight once it goes away mid-rename', async () => {
    const busy: boolean[] = [];
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });
    server.use(http.put(CUSTOM_PURPOSE_URL, () => new Promise(() => undefined)));

    const Toggle = () => {
      const [shown, setShown] = useState(true);
      return (
        <>
          <button onClick={() => setShown(false)}>hide</button>
          {shown && (
            <WithdrawalCustomPurposeSelector
              value=''
              onChange={() => undefined}
              onBusyChange={(next) => busy.push(next)}
            />
          )}
        </>
      );
    };

    const { user } = renderWithProviders(<Toggle />, {
      organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) },
    });

    await user.click(screen.getByPlaceholderText(strings.ENTER_OR_SELECT));
    await user.click(screen.getByRole('button', { name: strings.formatString(strings.RENAME_X, 'Sale') as string }));
    const listbox = await screen.findByRole('listbox');
    await user.clear(within(listbox).getByRole('textbox'));
    await user.paste('Resale');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(busy.at(-1)).toBe(true));

    await user.click(screen.getByRole('button', { name: 'hide' }));

    expect(busy.at(-1)).toBe(false);
  });
});

describe('WithdrawalCustomPurposeSelector managing the saved purposes', () => {
  const renderAs = (role: OrganizationRole) => {
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });
    return renderWithProviders(<Host />, {
      organization: { selectedOrganization: buildOrganization({ role }) },
    });
  };

  const renameButton = (name: string) =>
    screen.getByRole('button', { name: strings.formatString(strings.RENAME_X, name) as string });
  const archiveButton = (name: string) =>
    screen.getByRole('button', { name: strings.formatString(strings.ARCHIVE_X, name) as string });

  /** The inline name input, which only exists while a row is being renamed. */
  const nameInput = (listbox: HTMLElement) => within(listbox).getByRole('textbox');

  const startRenaming = async (user: UserEvent, name: string) => {
    const listbox = await openSuggestions(user);
    await user.click(renameButton(name));
    return listbox;
  };

  const typeNewName = async (user: UserEvent, listbox: HTMLElement, newName: string) => {
    await user.clear(nameInput(listbox));
    await user.paste(newName);
  };

  it('offers an admin a way to rename and archive each saved purpose', async () => {
    const { user } = renderAs('Admin');

    await openSuggestions(user);

    expect(renameButton('Sale')).toBeInTheDocument();
    expect(archiveButton('Sale')).toBeInTheDocument();
    expect(renameButton('Donation')).toBeInTheDocument();
    expect(archiveButton('Donation')).toBeInTheDocument();
  });

  // Renaming and archiving change what the whole organization sees on past withdrawals, so they
  // are not for everyone who can record a withdrawal.
  it.each(['Manager', 'Contributor'] as const)('shows a %s the names only', async (role) => {
    const { user } = renderAs(role);

    await openSuggestions(user);

    expect(suggestions()).toContain('Sale');
    expect(screen.queryAllByRole('button', { name: /Sale/ })).toHaveLength(0);
  });

  it('saves a renamed purpose under the name the admin typed, trimmed', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, '  Resale  ');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(new URL(updates[0].url).pathname).toBe(`${CUSTOM_PURPOSES_URL}/3`);
    expect(await updates[0].json()).toEqual({ name: 'Resale' });
  });

  it('follows the new name in the field when the renamed purpose is the one being withdrawn under', async () => {
    captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    await openSuggestions(user);
    await user.click(await screen.findByRole('option', { name: /Sale/ }));
    expect(field()).toHaveValue('Sale');

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, 'Resale');
    await user.keyboard('{Enter}');

    // Leaving "Sale" behind would submit the withdrawal under a name that no longer exists.
    await waitFor(() => expect(field()).toHaveValue('Resale'));
  });

  it('refuses a name another saved purpose already has, without asking the server', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user, store } = renderAs('Admin');

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, ' donation ');
    await user.keyboard('{Enter}');

    await waitFor(() =>
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'critical',
        msg: strings.CUSTOM_PURPOSE_NAME_EXISTS,
      })
    );
    expect(updates).toHaveLength(0);

    // The rejected name is still the one being corrected. Handing focus to the field beside it
    // would quietly turn the correction into a change to the withdrawal's own purpose.
    const nameBeingCorrected = nameInput(listbox);
    expect(nameBeingCorrected).toHaveFocus();

    await user.clear(nameBeingCorrected);
    await user.paste('Resale');

    expect(nameBeingCorrected).toHaveValue('Resale');
    expect(field()).toHaveValue('');
  });

  // The combobox blurred when the editor took focus, so it has no blur left to report: without
  // the editor noticing, the suggestions would hang over the form until the user came back to it.
  it('puts the list away when the admin looks away mid-rename', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    mockGet(CUSTOM_PURPOSES_URL, { customPurposes: SAVED_PURPOSES });
    const { user } = renderWithProviders(
      <>
        <Host />
        <button>somewhere else</button>
      </>,
      { organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) } }
    );

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, 'Resale');
    await user.click(screen.getByRole('button', { name: 'somewhere else' }));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(updates).toHaveLength(0);
  });

  it('abandons a rename when the admin picks another suggestion instead', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, 'Resale');
    await user.click(within(listbox).getByRole('option', { name: /Donation/ }));

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(field()).toHaveValue('Donation');
    expect(updates).toHaveLength(0);
  });

  it('abandons a rename on Escape', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    const listbox = await startRenaming(user, 'Sale');
    await typeNewName(user, listbox, 'Resale');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(within(listbox).queryByRole('textbox')).not.toBeInTheDocument());
    expect(suggestions()).toContain('Sale');
    expect(updates).toHaveLength(0);
  });

  it('archives a purpose once the admin confirms', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    await openSuggestions(user);
    await user.click(archiveButton('Sale'));

    const dialog = dialogTitled(strings.formatString(strings.ARCHIVE_X, 'Sale') as string);
    // The warning and the question are separate paragraphs; as one run of text neither is findable.
    expect(
      within(dialog).getByText(strings.formatString(strings.ARCHIVE_CUSTOM_PURPOSE_MESSAGE, 'Sale') as string)
    ).toBeInTheDocument();
    expect(within(dialog).getByText(strings.ARE_YOU_SURE)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: strings.ARCHIVE }));

    await waitFor(() => expect(updates).toHaveLength(1));
    expect(new URL(updates[0].url).pathname).toBe(`${CUSTOM_PURPOSES_URL}/3`);
    expect(await updates[0].json()).toEqual({ isArchived: true });
  });

  it('archives nothing when the admin backs out of the confirmation', async () => {
    const updates = captureRequests('put', CUSTOM_PURPOSE_URL);
    const { user } = renderAs('Admin');

    await openSuggestions(user);
    await user.click(archiveButton('Sale'));

    const dialog = dialogTitled(strings.formatString(strings.ARCHIVE_X, 'Sale') as string);
    await user.click(within(dialog).getByRole('button', { name: strings.CANCEL }));

    await waitFor(() => expect(screen.queryByText(strings.ARE_YOU_SURE)).not.toBeInTheDocument());
    expect(updates).toHaveLength(0);
  });
});

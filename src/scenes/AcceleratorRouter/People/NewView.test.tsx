import React from 'react';

import { act, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import strings from 'src/strings';
import { buildUser, captureRequests, mockGet, renderWithProviders, server } from 'src/test-utils';

import NewView from './NewView';

const existingEmail = 'existing@terraformation.com';
const newEmail = 'new@terraformation.com';

// The shared Textfield does not associate its visible label with the native input.
const textbox = (id: string) => {
  const input = document.querySelector<HTMLInputElement>(`#${id} input`);
  if (!input) {
    throw new Error(`Missing ${id} input`);
  }
  return input;
};

const setup = (returnedEmail = existingEmail) => {
  const existingUser = buildUser({
    id: 42,
    email: returnedEmail,
    firstName: 'Ada',
    lastName: 'Lovelace',
    globalRoles: ['TF Expert'],
  });
  const searchedEmails: string[] = [];
  server.use(
    http.get('/api/v1/users', ({ request }) => {
      const email = new URL(request.url).searchParams.get('email') || '';
      searchedEmails.push(email);
      return email === existingEmail
        ? HttpResponse.json({ status: 'ok', user: existingUser })
        : HttpResponse.json({ status: 'error', error: { message: 'User not found' } }, { status: 404 });
    })
  );
  mockGet('/api/v1/users/42', { user: existingUser });
  mockGet('/api/v1/users/42/internalInterests', { internalInterests: ['GIS'] });
  const rendered = renderWithProviders(<NewView />, {
    currentUser: { user: buildUser({ globalRoles: ['Super-Admin'] }) },
  });
  return { ...rendered, searchedEmails, existingUser, email: textbox('email') };
};

const expectEmptyPerson = () => {
  expect(textbox('firstName')).toHaveValue('');
  expect(textbox('lastName')).toHaveValue('');
  expect(textbox('globalRole')).toHaveValue('');
  expect(screen.queryByText(strings.GIS)).not.toBeInTheDocument();
};

describe('NewView', () => {
  it.each(['user details', 'internal interests'])(
    'keeps Save disabled until the existing account’s %s finish loading',
    async (pendingRequest) => {
      const { user, email, existingUser } = setup();
      let releaseResponse: () => void = () => undefined;
      const pendingResponse = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });
      let requestStarted = false;
      const endpoint = pendingRequest === 'user details' ? '/api/v1/users/42' : '/api/v1/users/42/internalInterests';
      server.use(
        http.get(endpoint, async () => {
          requestStarted = true;
          await pendingResponse;
          return HttpResponse.json({
            status: 'ok',
            ...(pendingRequest === 'user details' ? { user: existingUser } : { internalInterests: ['GIS'] }),
          });
        })
      );

      try {
        await user.type(email, existingEmail);
        await user.tab();
        await waitFor(() => expect(requestStarted).toBe(true));
        expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
      } finally {
        releaseResponse();
      }

      await waitFor(() => expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled());
      expect(textbox('firstName')).toHaveValue('Ada');
      expect(textbox('lastName')).toHaveValue('Lovelace');
      expect(textbox('globalRole')).toHaveValue(strings.GLOBAL_ROLE_TF_EXPERT);
      expect(screen.getByText(strings.GIS)).toBeInTheDocument();
    }
  );

  it('waits until email loses focus to look up and autofill the person', async () => {
    const { user, email, searchedEmails } = setup();
    await user.type(email, existingEmail);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
    });
    expect(searchedEmails).toEqual([]);
    await user.tab();
    await waitFor(() => expect(textbox('firstName')).toHaveValue('Ada'));
    expect(searchedEmails).toEqual([existingEmail]);
  });

  it('keeps the entered email when the account stores different capitalization', async () => {
    const { user, email } = setup('Existing@terraformation.com');
    await user.type(email, existingEmail);
    await user.tab();
    await waitFor(() => expect(textbox('firstName')).toHaveValue('Ada'));
    expect(textbox('lastName')).toHaveValue('Lovelace');
    expect(textbox('globalRole')).toHaveValue(strings.GLOBAL_ROLE_TF_EXPERT);
    expect(screen.getByText(strings.GIS)).toBeInTheDocument();
    expect(email).toHaveValue(existingEmail);
  });

  it('clears the previous person when a different email has no account', async () => {
    const { user, email, searchedEmails } = setup();
    await user.type(email, existingEmail);
    await user.tab();
    await waitFor(() => expect(textbox('firstName')).toHaveValue('Ada'), {
      timeout: 2500,
    });
    expect(textbox('globalRole')).toHaveValue(strings.GLOBAL_ROLE_TF_EXPERT);
    expect(screen.getByText(strings.GIS)).toBeInTheDocument();
    await user.clear(email);
    await user.type(email, newEmail);
    await user.tab();
    await waitFor(() => expect(searchedEmails).toContain(newEmail), { timeout: 2500 });
    await waitFor(expectEmptyPerson);
    expect(email).toHaveValue(newEmail);

    const invitations = captureRequests('post', '/api/v1/globalRoles/invite', {
      user: buildUser({ id: 43, email: newEmail }),
    });
    await user.click(textbox('globalRole'));
    await user.click(screen.getByText(strings.GLOBAL_ROLE_READ_ONLY));
    await user.click(screen.getByRole('button', { name: strings.SAVE }));
    await waitFor(() => expect(invitations).toHaveLength(1));
    expect(await invitations[0].json()).toEqual({ email: newEmail, globalRoles: ['Read Only'] });
  });

  it('ignores a pending account lookup after the email changes', async () => {
    const { user, email, searchedEmails } = setup();
    let releaseLookup: () => void = () => undefined;
    const pendingLookup = new Promise<void>((resolve) => {
      releaseLookup = resolve;
    });
    server.use(
      http.get('/api/v1/users', async ({ request }) => {
        const requestedEmail = new URL(request.url).searchParams.get('email') || '';
        searchedEmails.push(requestedEmail);
        await pendingLookup;
        return requestedEmail === existingEmail
          ? HttpResponse.json({ status: 'ok', user: buildUser({ id: 42, email: existingEmail }) })
          : HttpResponse.json({ status: 'error', error: { message: 'User not found' } }, { status: 404 });
      })
    );
    await user.type(email, existingEmail);
    await user.tab();
    await waitFor(() => expect(searchedEmails).toContain(existingEmail));
    expect(screen.getByRole('button', { name: strings.SAVE })).toBeDisabled();
    await user.clear(email);
    await user.type(email, newEmail);
    await user.tab();
    await waitFor(() => expect(searchedEmails).toContain(newEmail));
    releaseLookup();
    await waitFor(() => expect(screen.getByRole('button', { name: strings.SAVE })).toBeEnabled());
    expectEmptyPerson();
    expect(email).toHaveValue(newEmail);
  });

  it('clears the previous person when the email is emptied', async () => {
    const { user, email } = setup();
    await user.type(email, existingEmail);
    await user.tab();
    await waitFor(() => expect(textbox('firstName')).toHaveValue('Ada'), {
      timeout: 2500,
    });
    await user.clear(email);
    await user.tab();
    await waitFor(expectEmptyPerson);
    expect(email).toHaveValue('');
  });
});

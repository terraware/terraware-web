import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';

import PeopleListView from 'src/scenes/PeopleRouter/PeopleListView';
import strings from 'src/strings';
import {
  type PersonSearchResult,
  buildOrganization,
  buildPersonSearchResult,
  buildUser,
  captureRequests,
  mockDelete,
  mockError,
  mockGet,
  renderWithProviders,
  server,
} from 'src/test-utils';

const ORG_ID = 1;
const SEARCH_URL = '/api/v1/search';
const ORG_ROLES_URL = `/api/v1/organizations/${ORG_ID}/roles`;
const ORG_URL = `/api/v1/organizations/${ORG_ID}`;
const ORG_USER_URL = `/api/v1/organizations/${ORG_ID}/users/:userId`;
const userUrl = (userId: string) => `/api/v1/organizations/${ORG_ID}/users/${userId}`;

// The signed-in user, who is also the organization's owner in most of these tests
const CURRENT_USER_ID = 1;

const OWNER = buildPersonSearchResult({
  user_id: `${CURRENT_USER_ID}`,
  user_firstName: 'Olive',
  user_lastName: 'Owner',
  user_email: 'owner@terraware.io',
  roleName: 'Owner',
});
const ADMIN = buildPersonSearchResult({
  user_id: '2',
  user_firstName: 'Adam',
  user_lastName: 'Admin',
  user_email: 'admin@terraware.io',
  roleName: 'Admin',
});
const CONTRIBUTOR = buildPersonSearchResult({
  user_id: '3',
  user_firstName: 'Connie',
  user_lastName: 'Contributor',
  user_email: 'contributor@terraware.io',
  roleName: 'Contributor',
});
const MANAGER = buildPersonSearchResult({
  user_id: '4',
  user_firstName: 'Mel',
  user_lastName: 'Manager',
  user_email: 'manager@terraware.io',
  roleName: 'Manager',
});
const TF_CONTACT = buildPersonSearchResult({
  user_id: '9',
  user_firstName: 'Terra',
  user_lastName: 'Contact',
  user_email: 'tf-contact@terraware.io',
  roleName: 'Terraformation Contact',
});

/**
 * The view drives everything off one search endpoint, switching on the `prefix` in the body: the
 * people list (twice on mount — once for the table, once for the removable-user count) and the
 * internal project roles shown next to a Terraformation Contact.
 *
 * Returns the prefixes requested so far, so a test can wait for the mount searches to settle before
 * touching the table.
 */
const mockSearches = (people: PersonSearchResult[], projectInternalUsers: Record<string, string>[] = []) => {
  const prefixes: string[] = [];

  server.use(
    http.post(SEARCH_URL, async ({ request }) => {
      const body = (await request.json()) as { prefix: string };
      prefixes.push(body.prefix);
      return HttpResponse.json({
        status: 'ok',
        results: body.prefix === 'projectInternalUsers' ? projectInternalUsers : people,
      });
    })
  );

  return prefixes;
};

const MOUNT_SEARCHES = 3;

const waitForPeople = async (prefixes: string[]) => {
  await waitFor(() => expect(prefixes.length).toBeGreaterThanOrEqual(MOUNT_SEARCHES));
};

const rowFor = (email: string) => screen.getByText(email).closest('tr') as HTMLElement;

/** The Remove button in the table's top bar, which only appears once rows are selected. */
const topBarRemoveButton = () => screen.getByRole('button', { name: strings.REMOVE });

/** The open dialog with this title */
const dialogTitled = (title: string): HTMLElement => {
  const box = screen.getByText(title).closest('.dialog-box');
  if (!box) {
    throw new Error(`No open dialog titled "${title}"`);
  }
  return box as HTMLElement;
};

describe('PeopleListView', () => {
  describe('permission gating', () => {
    it('gives a contributor no way to add or remove people', async () => {
      const prefixes = mockSearches([OWNER, CONTRIBUTOR]);

      renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Contributor' }) },
      });

      expect(await screen.findByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      expect(screen.queryByRole('button', { name: strings.ADD_PERSON })).not.toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    it('gives an admin the add button and per-person selection', async () => {
      const prefixes = mockSearches([OWNER, CONTRIBUTOR]);

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) },
      });

      expect(await screen.findByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      expect(screen.getByRole('button', { name: strings.ADD_PERSON })).toBeInTheDocument();

      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));

      expect(topBarRemoveButton()).toBeEnabled();
    });
  });

  describe('Terraformation Contact protection', () => {
    it('disables removal and explains why when a Terraformation Contact is selected', async () => {
      const prefixes = mockSearches([OWNER, CONTRIBUTOR, TF_CONTACT]);

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Admin' }) },
      });

      expect(await screen.findByText(TF_CONTACT.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(TF_CONTACT.user_email)).getByRole('checkbox'));

      expect(topBarRemoveButton()).toBeDisabled();

      // The disabled button carries `pointer-events: none`, so the hover lands on the tooltip
      // wrapper around it — which is where a real pointer lands too.
      await user.hover(topBarRemoveButton().parentElement as HTMLElement);
      expect(await screen.findByText(strings.CANNOT_REMOVE_TF_CONTACT)).toBeInTheDocument();
    });

    it('does not count Terraformation Contacts as people who could be left behind', async () => {
      // Two removable people plus a Terraformation Contact. Selecting both removable people empties
      // the organization as far as removal is concerned, even though a third row is still listed.
      const prefixes = mockSearches([OWNER, CONTRIBUTOR, TF_CONTACT]);
      const deletes = captureRequests('delete', ORG_USER_URL);

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(await screen.findByText(TF_CONTACT.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      expect(await screen.findByText(strings.CANNOT_REMOVE_MSG)).toBeInTheDocument();
      expect(screen.queryByText(strings.REMOVE_PEOPLE_DESC)).not.toBeInTheDocument();
      expect(deletes).toHaveLength(0);
    });

    it('does not offer a Terraformation Contact as the replacement owner', async () => {
      const prefixes = mockSearches([OWNER, ADMIN, CONTRIBUTOR, TF_CONTACT]);
      mockGet(ORG_ROLES_URL, { roles: [{ role: 'Owner', totalUsers: 1 }] });

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(await screen.findByText(TF_CONTACT.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      expect(await screen.findByText(strings.ASSIGN_NEW_OWNER_DESC)).toBeInTheDocument();

      const dialog = dialogTitled(strings.ASSIGN_NEW_OWNER);
      await user.click(within(dialog).getByRole('textbox'));

      expect(within(dialog).getByText(ADMIN.user_email)).toBeInTheDocument();
      expect(within(dialog).getByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
      expect(within(dialog).queryByText(TF_CONTACT.user_email)).not.toBeInTheDocument();
      expect(within(dialog).queryByText(OWNER.user_email)).not.toBeInTheDocument();
    });

    it('appends the internal project roles a Terraformation Contact holds', async () => {
      const prefixes = mockSearches(
        [OWNER, TF_CONTACT],
        [
          {
            role: strings.PROJECT_INTERNAL_USER_ROLE_RESTORATION_LEAD,
            user_id: TF_CONTACT.user_id,
            project_name: 'Kona Restoration',
          },
        ]
      );

      renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      await waitForPeople(prefixes);

      expect(
        await screen.findByText(
          `${strings.TERRAFORMATION_CONTACT} - ${strings.PROJECT_INTERNAL_USER_ROLE_RESTORATION_LEAD} (Kona Restoration)`
        )
      ).toBeInTheDocument();
    });
  });

  describe('emptying the organization', () => {
    it('offers to delete the organization instead of removing everyone', async () => {
      const prefixes = mockSearches([OWNER, CONTRIBUTOR]);
      const deletes = captureRequests('delete', ORG_USER_URL);

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner', name: 'Kona Reforest' }) },
      });

      expect(await screen.findByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      expect(await screen.findByText(strings.CANNOT_REMOVE_MSG)).toBeInTheDocument();
      expect(deletes).toHaveLength(0);

      await user.click(within(dialogTitled(strings.CANNOT_REMOVE)).getByRole('button', { name: strings.DELETE }));

      expect(
        await screen.findByText(strings.formatString(strings.DELETE_ORGANIZATION_MSG, 'Kona Reforest') as string)
      ).toBeInTheDocument();
      expect(deletes).toHaveLength(0);
    });

    it('removes everyone but one owner, then deletes the organization', async () => {
      const prefixes = mockSearches([OWNER, CONTRIBUTOR]);
      const userDeletes = captureRequests('delete', ORG_USER_URL);
      const orgDeletes = captureRequests('delete', ORG_URL);

      const { user, store } = renderWithProviders(<PeopleListView />, {
        currentUser: { user: buildUser({ id: CURRENT_USER_ID }) },
        organization: { selectedOrganization: buildOrganization({ role: 'Owner', name: 'Kona Reforest' }) },
      });

      expect(await screen.findByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      await screen.findByText(strings.CANNOT_REMOVE_MSG);
      await user.click(within(dialogTitled(strings.CANNOT_REMOVE)).getByRole('button', { name: strings.DELETE }));
      await screen.findByText(strings.formatString(strings.DELETE_ORGANIZATION_MSG, 'Kona Reforest') as string);
      await user.click(within(dialogTitled(strings.DELETE_ORGANIZATION)).getByRole('button', { name: strings.DELETE }));

      await waitFor(() => expect(orgDeletes).toHaveLength(1));

      // The signed-in owner is left in place for the organization delete itself; everyone else goes
      // first.
      expect(userDeletes.map((request) => new URL(request.url).pathname)).toEqual([userUrl(CONTRIBUTOR.user_id)]);
      expect(store.getState().snackbar.snackbars.toast).toMatchObject({
        priority: 'success',
        msg: strings.CHANGES_SAVED,
      });
    });
  });

  describe('removing the last owner', () => {
    it('requires a new owner before it will confirm the removal', async () => {
      const prefixes = mockSearches([OWNER, ADMIN, CONTRIBUTOR]);
      mockGet(ORG_ROLES_URL, { roles: [{ role: 'Owner', totalUsers: 1 }] });
      const deletes = captureRequests('delete', ORG_USER_URL);

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(await screen.findByText(ADMIN.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      expect(await screen.findByText(strings.ASSIGN_NEW_OWNER_DESC)).toBeInTheDocument();
      expect(
        screen.queryByText(strings.formatString(strings.REMOVE_PERSON_DESC, OWNER.user_firstName) as string)
      ).not.toBeInTheDocument();
      expect(deletes).toHaveLength(0);
    });

    it('promotes the new owner before deleting the outgoing one', async () => {
      const prefixes = mockSearches([OWNER, ADMIN, CONTRIBUTOR]);
      mockGet(ORG_ROLES_URL, { roles: [{ role: 'Owner', totalUsers: 1 }] });

      // One ordered log across both endpoints: an owner deleted before their replacement is
      // promoted would leave the organization ownerless.
      const calls: string[] = [];
      const putBodies: unknown[] = [];
      server.use(
        http.put(ORG_USER_URL, async ({ request, params }) => {
          calls.push(`PUT ${params.userId as string}`);
          putBodies.push(await request.json());
          return HttpResponse.json({ status: 'ok' });
        }),
        http.delete(ORG_USER_URL, ({ params }) => {
          calls.push(`DELETE ${params.userId as string}`);
          return HttpResponse.json({ status: 'ok' });
        })
      );

      const { user } = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });

      expect(await screen.findByText(ADMIN.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(OWNER.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      await screen.findByText(strings.ASSIGN_NEW_OWNER_DESC);
      await user.click(within(dialogTitled(strings.ASSIGN_NEW_OWNER)).getByRole('textbox'));
      await user.click(within(dialogTitled(strings.ASSIGN_NEW_OWNER)).getByText(ADMIN.user_email));
      await user.click(within(dialogTitled(strings.ASSIGN_NEW_OWNER)).getByRole('button', { name: strings.ASSIGN }));

      await screen.findByText(strings.formatString(strings.REMOVE_PERSON_DESC, OWNER.user_firstName) as string);
      await user.click(within(dialogTitled(strings.REMOVE_PERSON)).getByRole('button', { name: strings.REMOVE }));

      await waitFor(() => expect(calls).toEqual([`PUT ${ADMIN.user_id}`, `DELETE ${OWNER.user_id}`]));
      expect(putBodies).toEqual([{ role: 'Owner' }]);
    });
  });

  describe('removing people', () => {
    const renderWithFourPeople = () => {
      const prefixes = mockSearches([OWNER, ADMIN, CONTRIBUTOR, MANAGER]);
      const rendered = renderWithProviders(<PeopleListView />, {
        organization: { selectedOrganization: buildOrganization({ role: 'Owner' }) },
      });
      return { ...rendered, prefixes };
    };

    it('sends one delete per selected person and no role changes', async () => {
      const puts = captureRequests('put', ORG_USER_URL);
      const deletes = captureRequests('delete', ORG_USER_URL);

      const { user, prefixes, store } = renderWithFourPeople();

      expect(await screen.findByText(MANAGER.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(ADMIN.user_email)).getByRole('checkbox'));
      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      await screen.findByText(strings.REMOVE_PEOPLE_DESC);
      await user.click(within(dialogTitled(strings.REMOVE_PEOPLE)).getByRole('button', { name: strings.REMOVE }));

      await waitFor(() => expect(deletes).toHaveLength(2));
      expect(deletes.map((request) => new URL(request.url).pathname).sort()).toEqual([
        userUrl(ADMIN.user_id),
        userUrl(CONTRIBUTOR.user_id),
      ]);
      expect(puts).toHaveLength(0);

      await waitFor(() =>
        expect(store.getState().snackbar.snackbars.toast).toMatchObject({
          priority: 'success',
          msg: strings.CHANGES_SAVED,
        })
      );
    });

    it('reports an error and keeps the confirmation open when one delete fails', async () => {
      mockDelete(userUrl(ADMIN.user_id));
      mockError('delete', userUrl(CONTRIBUTOR.user_id));

      const { user, prefixes, store } = renderWithFourPeople();

      expect(await screen.findByText(MANAGER.user_email)).toBeInTheDocument();
      await waitForPeople(prefixes);

      await user.click(within(rowFor(ADMIN.user_email)).getByRole('checkbox'));
      await user.click(within(rowFor(CONTRIBUTOR.user_email)).getByRole('checkbox'));
      await user.click(topBarRemoveButton());

      await screen.findByText(strings.REMOVE_PEOPLE_DESC);
      await user.click(within(dialogTitled(strings.REMOVE_PEOPLE)).getByRole('button', { name: strings.REMOVE }));

      await waitFor(() => expect(store.getState().snackbar.snackbars.toast).toMatchObject({ priority: 'critical' }));

      // Closing here would tell the user both people were removed when only one was.
      expect(screen.getByText(strings.REMOVE_PEOPLE_DESC)).toBeInTheDocument();
      expect(screen.getByText(CONTRIBUTOR.user_email)).toBeInTheDocument();
    });
  });
});

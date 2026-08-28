/**
 * A row as the `organizationUsers` search prefix returns it. The search API returns every field as
 * a string, including ids, which is why `user_id` is not a number here — components that turn these
 * rows into `OrganizationUser` inherit that.
 */
export type PersonSearchResult = {
  user_id: string;
  user_firstName: string;
  user_lastName: string;
  user_email: string;
  roleName: string;
  createdTime: string;
};

/**
 * ```ts
 * buildPersonSearchResult({ user_id: '2', user_email: 'ada@terraware.io', roleName: 'Owner' })
 * ```
 */
export const buildPersonSearchResult = (overrides: Partial<PersonSearchResult> = {}): PersonSearchResult => ({
  user_id: '2',
  user_firstName: 'Test',
  user_lastName: 'Person',
  user_email: 'person@terraware.io',
  roleName: 'Contributor',
  createdTime: '2026-01-15T10:00:00Z',
  ...overrides,
});

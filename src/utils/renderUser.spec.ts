import { OrganizationUser } from 'src/types/User';
import { renderUser } from 'src/utils/renderUser';

describe('renderUser', () => {
  const baseUser: OrganizationUser = {
    email: 'jane.doe@terraformation.com',
    id: 1,
    role: 'Contributor',
  };

  it('returns "firstName lastName" when both are present', () => {
    const user: OrganizationUser = { ...baseUser, firstName: 'Jane', lastName: 'Doe' };
    expect(renderUser(user)).toBe('Jane Doe');
  });

  it('returns firstName when lastName is missing', () => {
    const user: OrganizationUser = { ...baseUser, firstName: 'Jane' };
    expect(renderUser(user)).toBe('Jane');
  });

  it('returns lastName when firstName is missing', () => {
    const user: OrganizationUser = { ...baseUser, lastName: 'Doe' };
    expect(renderUser(user)).toBe('Doe');
  });

  it('returns email when neither firstName nor lastName is present', () => {
    const user: OrganizationUser = { ...baseUser };
    expect(renderUser(user)).toBe('jane.doe@terraformation.com');
  });

  it('returns email when firstName and lastName are empty strings', () => {
    const user: OrganizationUser = { ...baseUser, firstName: '', lastName: '' };
    expect(renderUser(user)).toBe('jane.doe@terraformation.com');
  });
});

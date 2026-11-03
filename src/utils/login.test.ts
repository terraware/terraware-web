import { rs } from '@rstest/core';

import { LOGIN_LINK } from 'src/constants';

const realLocation = Object.getOwnPropertyDescriptor(window, 'location') as PropertyDescriptor;

/**
 * jsdom will not follow a navigation, so `location` is stood in for and the assignment read back.
 */
const standInForLocation = (href: string) => {
  const stub = { href, origin: 'https://terraware.io' };
  Object.defineProperty(window, 'location', { configurable: true, value: stub, writable: true });
  return stub;
};

// The helper only ever redirects once per page load, so each test needs its own copy of it.
const loadRedirectToLogin = async () => {
  rs.resetModules();
  return (await import('src/utils/login')).redirectToLogin;
};

describe('redirectToLogin', () => {
  afterEach(() => {
    Object.defineProperty(window, 'location', realLocation);
  });

  it('comes back to the page the user was on, query string and all', async () => {
    const location = standInForLocation('https://terraware.io/accessions/42?tab=photos');
    const redirectToLogin = await loadRedirectToLogin();

    redirectToLogin();

    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io%2Faccessions%2F42%3Ftab%3Dphotos`);
  });

  it('comes back to the home page rather than to the error page, which the user could not leave', async () => {
    const location = standInForLocation('https://terraware.io/error/generic');
    const redirectToLogin = await loadRedirectToLogin();

    redirectToLogin();

    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io`);
  });

  it('keeps the original page as the destination when several requests get a 401 at once', async () => {
    const location = standInForLocation('https://terraware.io/accessions/42');
    const redirectToLogin = await loadRedirectToLogin();

    redirectToLogin();
    const firstDestination = location.href;
    redirectToLogin();

    expect(location.href).toBe(firstDestination);
    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io%2Faccessions%2F42`);
  });

  it('never sends the user back to login itself', async () => {
    const location = standInForLocation(`https://terraware.io${LOGIN_LINK}?redirect=somewhere`);
    const redirectToLogin = await loadRedirectToLogin();

    redirectToLogin();

    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io`);
  });
});

import { LOGIN_LINK } from 'src/constants';
import { redirectToLogin } from 'src/utils/login';

const realLocation = Object.getOwnPropertyDescriptor(window, 'location') as PropertyDescriptor;

/**
 * jsdom will not follow a navigation, so `location` is stood in for and the assignment read back.
 */
const standInForLocation = (href: string) => {
  const stub = { href, origin: 'https://terraware.io' };
  Object.defineProperty(window, 'location', { configurable: true, value: stub, writable: true });
  return stub;
};

describe('redirectToLogin', () => {
  afterEach(() => {
    Object.defineProperty(window, 'location', realLocation);
  });

  it('comes back to the page the user was on, query string and all', () => {
    const location = standInForLocation('https://terraware.io/accessions/42?tab=photos');

    redirectToLogin();

    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io%2Faccessions%2F42%3Ftab%3Dphotos`);
  });

  it('comes back to the home page rather than to the error page, which the user could not leave', () => {
    const location = standInForLocation('https://terraware.io/error/generic');

    redirectToLogin();

    expect(location.href).toBe(`${LOGIN_LINK}?redirect=https%3A%2F%2Fterraware.io`);
  });
});

import { LOGIN_LINK } from 'src/constants';

/**
 * Sends the browser to the login page and back to where the user was once they are signed in. The
 * error page is never used as the return destination, since landing back on it would leave the
 * user stuck there.
 *
 * Anything that talks to the API is expected to do this on a 401, so that an expired session takes
 * the user to login no matter which request noticed it first.
 */
export const redirectToLogin = () => {
  const href = location.href.match('/error') ? location.origin : location.href;
  location.href = `${LOGIN_LINK}?redirect=${encodeURIComponent(href)}`;
};

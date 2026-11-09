import { LOGIN_LINK } from 'src/constants';

// The error page and the login page itself would both leave the user stuck where they started.
const isDeadEnd = (href: string) => href.includes('/error') || href.includes(LOGIN_LINK);

let redirecting = false;

/**
 * Sends the browser to the login page and back to where the user was once they are signed in.
 *
 * Anything that talks to the API is expected to call this on a 401, so that an expired session
 * takes the user to login no matter which request noticed it first. Several requests can get a 401
 * at once, so the destination is captured on the first call and later calls do nothing: by then
 * `location.href` can already read as the login URL, and capturing that would send the user back
 * to login instead of to the page they were looking at.
 */
export const redirectToLogin = () => {
  if (redirecting) {
    return;
  }

  redirecting = true;
  const href = isDeadEnd(location.href) ? location.origin : location.href;
  location.href = `${LOGIN_LINK}?redirect=${encodeURIComponent(href)}`;
};

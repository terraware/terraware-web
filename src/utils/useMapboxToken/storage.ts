import { isNumber, isString } from 'lodash';

// The token will last in session storage for 30 minutes
export const MAPBOX_TOKEN_TTL_MS = 30 * 60 * 1000;
export const MAPBOX_SESSION_KEY = 'mapbox-token';

type SessionToken = {
  expiresAt: number;
  token: string;
};

const isSessionToken = (input: unknown): input is SessionToken => {
  const castInput = input as SessionToken;
  return !!(isNumber(castInput.expiresAt) && isString(castInput.token));
};

// Get the token from the session, if it has not expired
export const getTokenFromSession = (): string => {
  try {
    const sessionToken = JSON.parse(sessionStorage.getItem(MAPBOX_SESSION_KEY) || '');

    if (!isSessionToken(sessionToken) || Date.now() > sessionToken.expiresAt) {
      return '';
    }

    return sessionToken.token;
  } catch (e) {
    return '';
  }
};

export const writeTokenToSession = (token: string): void => {
  try {
    const sessionToken: SessionToken = {
      expiresAt: Date.now() + MAPBOX_TOKEN_TTL_MS,
      token,
    };

    sessionStorage.setItem(MAPBOX_SESSION_KEY, JSON.stringify(sessionToken));
    // tslint:disable-next-line:no-empty
  } catch (e) {}
};

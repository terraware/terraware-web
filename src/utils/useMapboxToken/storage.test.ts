import { getTokenFromSession, MAPBOX_SESSION_KEY, MAPBOX_TOKEN_TTL_MS, writeTokenToSession } from "./storage";

describe('getTokenFromSession', () => {
  afterAll(() => {
    sessionStorage.setItem(MAPBOX_SESSION_KEY, '');
  });

  test('returns the token from the session when not expired', () => {
    sessionStorage.setItem(
      MAPBOX_SESSION_KEY,
      JSON.stringify({
        // Expires in the future
        expiresAt: Date.now() + 10,
        token: 'test-token'
      })
    );

    expect(getTokenFromSession()).toEqual('test-token');
  });

  test('does not return the token from the session when it is expired', () => {
    sessionStorage.setItem(
      MAPBOX_SESSION_KEY,
      JSON.stringify({
        // Already expired
        expiresAt: Date.now() - 10,
        token: 'test-token'
      })
    );

    expect(getTokenFromSession()).toEqual('');
  });

  test('does not return the token if the session value is incorrect', () => {
    sessionStorage.setItem(MAPBOX_SESSION_KEY, 'not-json');
    expect(getTokenFromSession()).toEqual('');

    sessionStorage.setItem(MAPBOX_SESSION_KEY, '');
    expect(getTokenFromSession()).toEqual('');

    sessionStorage.setItem(MAPBOX_SESSION_KEY, JSON.stringify({
      some: 'other',
      json: 'object'
    }));
    expect(getTokenFromSession()).toEqual('');

    sessionStorage.setItem(MAPBOX_SESSION_KEY, JSON.stringify({
      expiresAt: Date.now() + 10,
      token: undefined
    }));
    expect(getTokenFromSession()).toEqual('');

    sessionStorage.setItem(MAPBOX_SESSION_KEY, JSON.stringify({
      expiresAt: Date.now() + 10,
      token: true
    }));
    expect(getTokenFromSession()).toEqual('');
  });
});

describe('writeTokenToSession', () => {
  afterAll(() => {
    sessionStorage.setItem(MAPBOX_SESSION_KEY, '');
  });

  test('writes the token to session', () => {
    writeTokenToSession('test-token');

    // Is should be accessible through sessionStorage
    const sessionToken = JSON.parse(sessionStorage.getItem(MAPBOX_SESSION_KEY) || '{}');
    expect(sessionToken.token).toEqual('test-token');

    // It should also be accessible through the util function
    expect(getTokenFromSession()).toEqual('test-token');
  });
});
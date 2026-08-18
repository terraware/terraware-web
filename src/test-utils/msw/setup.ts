import { afterAll, afterEach, beforeAll } from '@rstest/core';

import { server } from './server';

/**
 * Let root-relative paths resolve against the jsdom origin.
 *
 * `src/queries/baseQuery.ts` builds requests with `baseUrl: ''`, which is correct in the browser —
 * the URL resolves against the current document. Under the test runner, RTK Query hands that
 * relative path to the global `Request` constructor, which comes from Node rather than jsdom and
 * rejects anything that isn't absolute. RTK reports it as an unhandled endpoint error, so the
 * symptom is a query that quietly never returns data and no request for MSW to match.
 *
 * Normalizing here keeps the workaround in the harness rather than making application code carry a
 * test-only base URL, and it keeps handler paths readable: `mockGet('/api/v1/species', ...)`.
 */
const OriginalRequest = globalThis.Request;

class OriginRelativeRequest extends OriginalRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string' && input.startsWith('/')) {
      super(new URL(input, location.origin).toString(), init);
    } else {
      super(input, init);
    }
  }
}

globalThis.Request = OriginRelativeRequest;

/**
 * Global MSW lifecycle, registered as an rstest setup file so no individual test has to start the
 * server.
 *
 * `onUnhandledRequest: 'error'` is deliberate. Without it, a component that fires a request the
 * test didn't anticipate hangs until the test times out and the failure points at the assertion
 * rather than the missing mock. With it, you get the offending method and URL immediately.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

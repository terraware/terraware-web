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
 * Requests that reached the network with no handler registered for them.
 *
 * `onUnhandledRequest: 'error'` alone is not enough to fail a test. MSW turns an unhandled request
 * into a rejected fetch, and RTK Query catches that and stores it as ordinary error state — so a
 * test that doesn't assert on the affected query stays green while silently exercising nothing.
 * Recording them here and failing in `afterEach` is what actually holds the line: add an endpoint
 * to a component, and every test rendering it fails until the mock exists.
 */
const unhandledRequests: string[] = [];

/**
 * Global MSW lifecycle, registered as an rstest setup file so no individual test has to start the
 * server.
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  server.events.on('request:unhandled', ({ request }) => {
    unhandledRequests.push(`${request.method} ${request.url}`);
  });
});

afterEach(() => {
  server.resetHandlers();

  // Drain before asserting so one failure doesn't cascade into every later test in the file.
  const seen = unhandledRequests.splice(0);

  if (seen.length > 0) {
    throw new Error(
      `The component under test made ${seen.length} request(s) with no MSW handler registered:\n` +
        seen.map((entry) => `  - ${entry}`).join('\n') +
        '\nMock them with mockGet/mockPost/etc, or with server.use(...) for anything the helpers do not cover.'
    );
  }
});

afterAll(() => {
  server.close();
});

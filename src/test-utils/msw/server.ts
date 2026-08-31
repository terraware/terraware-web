import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Endpoints that are always mocked, for every test. Only for requests that nearly every page makes
 * and no test should assert on — never a domain endpoint, since unhandled requests failing the test
 * is the point of this harness. A test can still override any of these with `server.use(...)`.
 */
const defaultHandlers = [http.get('/build-version.txt', () => HttpResponse.text(''))];

/**
 * The shared mock API server. Beyond the default handlers above, it starts empty: every test
 * declares the endpoints it expects, so a test never accidentally depends on a fixture some other
 * file registered.
 *
 * Started, reset, and stopped for you by `src/test-utils/msw/setup.ts`, which is wired into
 * `rstest.config.ts` as a setup file. Tests only need `mockGet` / `mockPost` / `server.use(...)`.
 *
 * `server.resetHandlers()` between tests restores this list rather than clearing it, and handlers
 * added with `server.use(...)` take precedence over it, so a test can still override any default.
 */
export const server = setupServer(...defaultHandlers);

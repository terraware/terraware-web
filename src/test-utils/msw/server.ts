import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';

/**
 * Endpoints that are always mocked, for every test.
 *
 * The bar for adding to this list is deliberately high: **no domain endpoint belongs here.** The
 * value of this harness comes from unhandled requests failing the test — add a fetch to a component
 * and every test rendering it goes red until the mock exists (see `setup.ts`). Defaulting a domain
 * endpoint would silently exempt it from that check, and a test asserting on data nobody mocked is
 * worse than no test.
 *
 * What qualifies instead is infrastructure noise: a request that every page makes, that carries no
 * domain data, and whose response no assertion should ever depend on.
 *
 * - `/build-version.txt` — `PageSnackbar` renders `DetectAppVersion`, which polls the deployed build
 *   version once a minute to offer an "upgrade available" banner. 36 components mount PageSnackbar,
 *   so essentially every scene-level test would otherwise have to mock it. An empty body reads as
 *   "no newer build" (`useAppVersion` treats a falsy version as not stale), so the banner stays out
 *   of the way. A test that wants to exercise the banner overrides this with `server.use(...)`.
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

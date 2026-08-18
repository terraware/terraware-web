import { setupServer } from 'msw/node';

/**
 * The shared mock API server. It starts with no handlers: every test declares the endpoints it
 * expects, so a test never accidentally depends on a fixture some other file registered.
 *
 * Started, reset, and stopped for you by `src/test-utils/msw/setup.ts`, which is wired into
 * `rstest.config.ts` as a setup file. Tests only need `mockGet` / `mockPost` / `server.use(...)`.
 */
export const server = setupServer();

import { HttpResponse, http } from 'msw';

import { server } from './server';

type JsonBody = Record<string, unknown>;

/**
 * Terraware endpoints wrap their payload in a `{ status: 'ok', ... }` envelope. These helpers add
 * it for you so tests read as "this endpoint returns these species" rather than as a pile of
 * response plumbing.
 *
 * ```ts
 * mockGet('/api/v1/species', { species: buildSpeciesList() });
 * ```
 *
 * Pass a full response body yourself with `server.use(http.get(...))` when an endpoint doesn't use
 * the envelope, or when you need to assert on the request.
 */
export const mockGet = (path: string, body: JsonBody = {}, status = 200) => {
  server.use(http.get(path, () => HttpResponse.json({ status: 'ok', ...body }, { status })));
};

export const mockPost = (path: string, body: JsonBody = {}, status = 200) => {
  server.use(http.post(path, () => HttpResponse.json({ status: 'ok', ...body }, { status })));
};

export const mockPut = (path: string, body: JsonBody = {}, status = 200) => {
  server.use(http.put(path, () => HttpResponse.json({ status: 'ok', ...body }, { status })));
};

export const mockDelete = (path: string, body: JsonBody = {}, status = 200) => {
  server.use(http.delete(path, () => HttpResponse.json({ status: 'ok', ...body }, { status })));
};

/** Make an endpoint fail, for testing error and retry states. */
export const mockError = (method: 'get' | 'post' | 'put' | 'delete', path: string, status = 500) => {
  server.use(
    http[method](path, () => HttpResponse.json({ status: 'error', error: { message: 'Test failure' } }, { status }))
  );
};

/**
 * Record the requests made to an endpoint so a test can assert on what the component sent.
 *
 * ```ts
 * const requests = captureRequests('post', '/api/v1/species', { id: 7 });
 * await user.click(screen.getByRole('button', { name: 'Save' }));
 * await waitFor(() => expect(requests).toHaveLength(1));
 * expect(await requests[0].json()).toEqual({ scientificName: 'Acacia koa' });
 * ```
 */
export const captureRequests = (
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  body: JsonBody = {},
  status = 200
): Request[] => {
  const requests: Request[] = [];

  server.use(
    http[method](path, ({ request }) => {
      requests.push(request.clone());
      return HttpResponse.json({ status: 'ok', ...body }, { status });
    })
  );

  return requests;
};

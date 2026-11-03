import { HttpResponse, http } from 'msw/http';

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

/**
 * A 1x1 PNG, as the bytes an image endpoint would answer with. jsdom paints nothing, so the content
 * only matters in that it is a real image the component can turn into a blob.
 */
const PNG_PIXEL = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

/**
 * Serve an image for a photo or thumbnail endpoint, and record the requests made to it.
 *
 * `ThumbnailImage` fetches the image itself rather than leaving it to the browser's `<img>`
 * loading, so a test that renders a photo has to mock its endpoint like any other. Pass a list of
 * statuses to answer differently across calls — the last one repeats — which is how the server
 * being too busy to generate a thumbnail is set up:
 *
 * ```ts
 * mockImage('/api/v1/nursery/batches/42/photos/:photoId');
 *
 * const requests = mockImage(PHOTO_URL, [429, 200]);
 * await waitFor(() => expect(requests).toHaveLength(2)); // retried once, then served
 * ```
 */
export const mockImage = (path: string, status: number | number[] = 200): Request[] => {
  const statuses = Array.isArray(status) ? status : [status];
  const requests: Request[] = [];

  server.use(
    http.get(path, ({ request }) => {
      const responseStatus = statuses[Math.min(requests.length, statuses.length - 1)];
      requests.push(request.clone());

      if (responseStatus !== 200) {
        return new HttpResponse(null, { status: responseStatus });
      }

      const bytes = Uint8Array.from(atob(PNG_PIXEL), (character) => character.charCodeAt(0));
      return HttpResponse.arrayBuffer(bytes.buffer as ArrayBuffer, { headers: { 'Content-Type': 'image/png' } });
    })
  );

  return requests;
};

import {
  FormData as UndiciFormData,
  Headers as UndiciHeaders,
  Request as UndiciRequest,
  Response as UndiciResponse,
  fetch as undiciFetch,
} from 'undici';

// Keep multipart bodies and the fetch primitives that consume them in the same implementation.
// Mixing jsdom's FormData with Node's Request serializes the body as "[object FormData]".
globalThis.FormData = UndiciFormData as unknown as typeof FormData;
globalThis.Headers = UndiciHeaders as unknown as typeof Headers;
globalThis.Request = UndiciRequest as unknown as typeof Request;
globalThis.Response = UndiciResponse as unknown as typeof Response;
globalThis.fetch = undiciFetch as unknown as typeof fetch;

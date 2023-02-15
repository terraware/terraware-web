export async function getPromisesResponse<T>(promises: Promise<T>[]): Promise<(T | null)[]> {
  try {
    const promiseResponses = await Promise.allSettled(promises);
    return promiseResponses.map((response) => {
      if (response.status === 'rejected') {
        // tslint:disable-next-line: no-console
        console.error(response.reason);
        return null;
      } else {
        return response.value as T;
      }
    });
  } catch (e) {
    // swallow error
  }

  return [];
}

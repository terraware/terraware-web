export async function getPromisesResponse<T>(promises: Promise<T>[]): Promise<(T | null)[]> {
  try {
    const promiseResponses = await Promise.allSettled(promises);
    return promiseResponses.map((response) => {
      if (response.status === 'rejected') {
        // eslint-disable-next-line no-console
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

export async function handlePromises<T>(promises: Promise<T>[]): Promise<boolean> {
  try {
    const promiseResponses = await Promise.allSettled(promises);
    return promiseResponses.every((response) => response.status !== 'rejected');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return false;
  }
}

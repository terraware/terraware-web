import { baseApi as api } from '../baseApi';

const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Handle CUD of photos in one mutation
    batchPhotos: build.mutation<undefined, undefined>({}),
  }),
});

export { injectedRtkApi as api };

export const { useBatchPhotosMutation } = injectedRtkApi;

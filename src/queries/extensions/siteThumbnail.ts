import { api } from '../generated/siteThumbnail';

api.enhanceEndpoints({
  endpoints: {
    getPlantingSiteThumbnail: {
      query: (queryArg) => ({
        url: `/api/v1/tracking/sites/${queryArg.id}/thumbnail`,
        params: {
          width: queryArg.width,
          height: queryArg.height,
        },
        responseHandler: 'text',
      }),
    },
  },
});

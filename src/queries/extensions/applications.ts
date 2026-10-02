import { api } from '../generated/applications';
import { QueryTagTypes } from '../tags';

const applicationWriteTags = (applicationId: number) => [
  { type: QueryTagTypes.Applications, id: applicationId },
  { type: QueryTagTypes.ApplicationModules, id: applicationId },
  { type: QueryTagTypes.ApplicationDeliverables, id: applicationId },
];

api.enhanceEndpoints({
  endpoints: {
    listApplications: {
      providesTags: (result) => [
        { type: QueryTagTypes.Applications, id: 'LIST' },
        ...(result?.applications ?? []).map((application) => ({
          type: QueryTagTypes.Applications,
          id: application.id,
        })),
      ],
    },
    getApplication: {
      providesTags: (_result, _error, applicationId) => [{ type: QueryTagTypes.Applications, id: applicationId }],
    },
    getApplicationGeoJson: {
      providesTags: (_result, _error, applicationId) => [{ type: QueryTagTypes.Applications, id: applicationId }],
    },
    getApplicationHistory: {
      providesTags: (_result, _error, applicationId) => [{ type: QueryTagTypes.Applications, id: applicationId }],
    },
    getApplicationModules: {
      providesTags: (_result, _error, applicationId) => [{ type: QueryTagTypes.ApplicationModules, id: applicationId }],
    },
    getApplicationDeliverables: {
      providesTags: (_result, _error, applicationId) => [
        { type: QueryTagTypes.ApplicationDeliverables, id: applicationId },
      ],
    },
    getApplicationModuleDeliverables: {
      providesTags: (_result, _error, arg) => [{ type: QueryTagTypes.ApplicationDeliverables, id: arg.applicationId }],
    },
    createApplication: {
      invalidatesTags: [{ type: QueryTagTypes.Applications, id: 'LIST' }],
    },
    updateApplicationBoundary: {
      invalidatesTags: (_result, _error, arg) => applicationWriteTags(arg.applicationId),
    },
    uploadApplicationBoundary: {
      invalidatesTags: (_result, _error, arg) => applicationWriteTags(arg.applicationId),
    },
    restartApplication: {
      invalidatesTags: (_result, _error, applicationId) => applicationWriteTags(applicationId),
    },
    submitApplication: {
      invalidatesTags: (_result, _error, applicationId) => applicationWriteTags(applicationId),
    },
    reviewApplication: {
      invalidatesTags: (_result, _error, arg) => [
        { type: QueryTagTypes.Applications, id: arg.applicationId },
        { type: QueryTagTypes.Projects, id: 'LIST' },
      ],
    },
  },
});

import { api } from '../generated/activities';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    listActivities: {
      providesTags: (results) => [
        ...(results ? results.activities.map((activity) => ({ type: QueryTagTypes.Activities, id: activity.id })) : []),
        { type: QueryTagTypes.Activities, id: 'LIST' },
      ],
    },
    adminListActivities: {
      providesTags: (results) => [
        ...(results ? results.activities.map((activity) => ({ type: QueryTagTypes.Activities, id: activity.id })) : []),
        { type: QueryTagTypes.Activities, id: 'LIST' },
      ],
    },
    getActivity: {
      providesTags: (result) => (result ? [{ type: QueryTagTypes.Activities, id: result.activity.id }] : []),
    },
    adminGetActivity: {
      providesTags: (result) => (result ? [{ type: QueryTagTypes.Activities, id: result.activity.id }] : []),
    },
    createActivity: {
      invalidatesTags: [{ type: QueryTagTypes.Activities, id: 'LIST' }],
    },
    adminCreateActivity: {
      invalidatesTags: [{ type: QueryTagTypes.Activities, id: 'LIST' }],
    },
    adminPublishActivity: {
      invalidatesTags: (_result, _error, activityId) => [
        { type: QueryTagTypes.Activities, id: activityId },
        { type: QueryTagTypes.Activities, id: 'LIST' },
        { type: QueryTagTypes.FunderActivities, id: activityId },
        { type: QueryTagTypes.FunderActivities, id: 'LIST' },
      ],
    },
    adminUpdateActivity: {
      invalidatesTags: (_result, _error, args) => [
        { type: QueryTagTypes.Activities, id: args.id },
        { type: QueryTagTypes.Activities, id: 'LIST' },
      ],
    },
    updateActivity: {
      invalidatesTags: (_result, _error, args) => [
        { type: QueryTagTypes.Activities, id: args.activityId },
        { type: QueryTagTypes.Activities, id: 'LIST' },
      ],
    },
    deleteActivity: {
      invalidatesTags: (_result, _error, activityId) => [
        { type: QueryTagTypes.Activities, id: activityId },
        { type: QueryTagTypes.Activities, id: 'LIST' },
      ],
    },
    uploadActivityMedia: {
      invalidatesTags: (_result, _error, args) => [{ type: QueryTagTypes.Activities, id: args.activityId }],
    },
    deleteActivityMedia: {
      invalidatesTags: (_result, _error, args) => [{ type: QueryTagTypes.Activities, id: args.activityId }],
    },
    updateActivityMedia: {
      invalidatesTags: (_result, _error, args) => [{ type: QueryTagTypes.Activities, id: args.activityId }],
    },
  },
});

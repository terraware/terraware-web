import { api } from '../generated/emailNotificationSettings';
import { QueryTagTypes } from '../tags';

api.enhanceEndpoints({
  endpoints: {
    getEmailNotificationSettings: {
      providesTags: [QueryTagTypes.EmailNotificationSettings],
    },
    updateEmailNotificationSettings: {
      invalidatesTags: [QueryTagTypes.EmailNotificationSettings],
    },
  },
});

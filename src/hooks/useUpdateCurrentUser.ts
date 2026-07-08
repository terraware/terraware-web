import { useCallback } from 'react';

import { UpdateUserRequestPayload, api, useUpdateMyselfMutation } from 'src/queries/generated/users';
import { QueryTagTypes } from 'src/queries/tags';
import { useAppDispatch } from 'src/redux/store';
import { PreferencesService } from 'src/services';
import { User } from 'src/types/User';

export type UpdateCurrentUserOptions = {
  skipAcknowledgeTimeZone?: boolean;
};

const useUpdateCurrentUser = () => {
  const dispatch = useAppDispatch();
  const [updateMyself] = useUpdateMyselfMutation();

  return useCallback(
    async (user: User, options: UpdateCurrentUserOptions = {}): Promise<boolean> => {
      const payload: UpdateUserRequestPayload = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        timeZone: user.timeZone,
        locale: user.locale,
        countryCode: user.countryCode,
      };
      if (user.emailNotificationsEnabled !== undefined) {
        payload.emailNotificationsEnabled = user.emailNotificationsEnabled;
      }

      const result = await updateMyself(payload);
      const succeeded = !('error' in result);

      if (succeeded) {
        // updateMyself invalidates { Users, id: 'ME' }; also invalidate the concrete user id so any
        // getUser(myId) subscriptions elsewhere refetch after a self-update.
        dispatch(api.util.invalidateTags([{ type: QueryTagTypes.Users, id: user.id }]));
      }

      if (succeeded && typeof user.cookiesConsented === 'boolean') {
        await PreferencesService.updateUserCookieConsentPreferences({ cookiesConsented: user.cookiesConsented });
      }

      if (succeeded && user.timeZone && !options.skipAcknowledgeTimeZone) {
        await PreferencesService.updateUserPreferences({ timeZoneAcknowledgedOnMs: Date.now() });
      }

      return succeeded;
    },
    [dispatch, updateMyself]
  );
};

export default useUpdateCurrentUser;

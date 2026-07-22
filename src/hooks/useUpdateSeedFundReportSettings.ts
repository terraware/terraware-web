import { useCallback } from 'react';

import {
  UpdateReportSettingsRequestPayload,
  useUpdateReportSettingsMutation,
} from 'src/queries/generated/seedFundReports';

/**
 * Updates the SeedFund report settings for an organization. Throws if the request fails.
 */
const useUpdateSeedFundReportSettings = () => {
  const [updateReportSettings] = useUpdateReportSettingsMutation();

  return useCallback(
    async (payload: UpdateReportSettingsRequestPayload): Promise<void> => {
      await updateReportSettings(payload).unwrap();
    },
    [updateReportSettings]
  );
};

export default useUpdateSeedFundReportSettings;

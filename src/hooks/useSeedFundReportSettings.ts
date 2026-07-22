import { useMemo } from 'react';

import { useGetReportSettingsQuery } from 'src/queries/generated/seedFundReports';
import { SeedFundReportsSettings } from 'src/types/SeedFundReport';

/**
 * Loads the SeedFund report settings for an organization.
 */
const useSeedFundReportSettings = (organizationId?: number) => {
  const response = useGetReportSettingsQuery(organizationId as number, { skip: organizationId === undefined });

  const settings: SeedFundReportsSettings | undefined = useMemo(() => {
    if (!response.currentData) {
      return undefined;
    }
    const { isConfigured, organizationEnabled, projects } = response.currentData;
    return { isConfigured, organizationEnabled, projects };
  }, [response.currentData]);

  return { settings, isLoading: response.isFetching, isError: response.isError };
};

export default useSeedFundReportSettings;

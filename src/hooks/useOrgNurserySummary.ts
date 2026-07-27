import { useEffect, useMemo } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useLazyGetOrganizationNurserySummaryQuery } from 'src/queries/generated/nurserySummaries';

export const useOrgNurserySummary = () => {
  const { selectedOrganization } = useOrganization();

  const [getOrganizationNurserySummary, { currentData, isSuccess, isError }] =
    useLazyGetOrganizationNurserySummaryQuery({
      pollingInterval: import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? undefined : API_PULL_INTERVAL,
    });

  useEffect(() => {
    if (selectedOrganization) {
      void getOrganizationNurserySummary(selectedOrganization.id, true);
    }
  }, [getOrganizationNurserySummary, selectedOrganization]);

  return useMemo(() => {
    if (!isSuccess && !isError) {
      return undefined;
    }

    return {
      value: currentData?.summary,
      requestSucceeded: isSuccess,
    };
  }, [currentData, isError, isSuccess]);
};

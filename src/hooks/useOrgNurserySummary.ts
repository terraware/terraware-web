import { useMemo } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useGetOrganizationNurserySummaryQuery } from 'src/queries/generated/nurserySummaries';

export const useOrgNurserySummary = () => {
  const { selectedOrganization } = useOrganization();

  const { currentData, isSuccess, isError } = useGetOrganizationNurserySummaryQuery(selectedOrganization?.id ?? -1, {
    skip: !selectedOrganization,
    pollingInterval: import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? undefined : API_PULL_INTERVAL,
  });

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

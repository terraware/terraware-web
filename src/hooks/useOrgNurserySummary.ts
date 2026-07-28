import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyGetOrganizationNurserySummaryQuery } from 'src/queries/generated/nurserySummaries';

export const useOrgNurserySummary = () => {
  const { selectedOrganization } = useOrganization();

  const [getOrganizationNurserySummary, { currentData, isSuccess, isError }] =
    useLazyGetOrganizationNurserySummaryQuery();

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

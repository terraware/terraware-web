import { useMemo } from 'react';

import { API_PULL_INTERVAL } from 'src/constants';
import { useOrganization } from 'src/providers';
import { useGetSeedBankSummaryQuery } from 'src/queries/generated/seedBankSummary';

export const useSeedBankSummary = () => {
  const { selectedOrganization } = useOrganization();

  const { currentData, isSuccess, isError } = useGetSeedBankSummaryQuery(
    { organizationId: selectedOrganization?.id },
    {
      skip: !selectedOrganization,
      pollingInterval: import.meta.env.PUBLIC_DISABLE_RECURRENT_REQUESTS ? undefined : API_PULL_INTERVAL,
    }
  );

  return useMemo(() => {
    if (!isSuccess && !isError) {
      return undefined;
    }

    return {
      value: currentData,
      requestSucceeded: isSuccess,
    };
  }, [currentData, isError, isSuccess]);
};

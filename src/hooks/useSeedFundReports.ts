import { useMemo } from 'react';

import { useListReportsQuery } from 'src/queries/generated/seedFundReports';
import { SeedFundReportListElement } from 'src/types/SeedFundReport';

/**
 * Lists the SeedFund reports for an organization.
 */
const useSeedFundReports = (organizationId?: number) => {
  const response = useListReportsQuery(organizationId as number, { skip: organizationId === undefined });

  const reports: SeedFundReportListElement[] = useMemo(
    () => response.currentData?.reports ?? [],
    [response.currentData]
  );

  return { reports, isLoading: response.isFetching, isError: response.isError };
};

export default useSeedFundReports;

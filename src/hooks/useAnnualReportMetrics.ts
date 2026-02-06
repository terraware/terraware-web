import { useMemo } from 'react';

import { useListAcceleratorReportsQuery } from 'src/queries/generated/reports';

// This is a temporary workaround until the BE changed to using separate target tables.
const useAnnualReportMetrics = (projectId: number, year: number) => {
  const reportsResult = useListAcceleratorReportsQuery({
    projectId,
    year,
    includeFuture: true,
    includeMetrics: true,
  });

  const annualReport = useMemo(
    () => reportsResult.data?.reports.find((report) => report.frequency === 'Annual'),
    [reportsResult.data?.reports]
  );
  return {
    projectMetrics: annualReport?.projectMetrics ?? [],
    standardMetrics: annualReport?.standardMetrics ?? [],
    systemMetrics: annualReport?.systemMetrics ?? [],
  };
};

export default useAnnualReportMetrics;

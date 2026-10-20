import { useMemo } from 'react';

import { useListAcceleratorReportsQuery } from 'src/queries/generated/acceleratorReports';

const useResolvedReportId = (projectId: number, requestedReportId?: number): number | undefined => {
  const { currentData } = useListAcceleratorReportsQuery({ projectId });

  return useMemo(() => {
    const reports = currentData?.reports;

    return reports?.find((report) => report.id === requestedReportId)?.id ?? reports?.[0]?.id;
  }, [currentData, requestedReportId]);
};

export default useResolvedReportId;

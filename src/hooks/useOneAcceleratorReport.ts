import { useEffect } from 'react';

import { useLazyGetOneAcceleratorReportQuery } from 'src/queries/generated/acceleratorReports';

const useOneAcceleratorReport = (reportId?: number) => {
  const [getReport, getReportResponse] = useLazyGetOneAcceleratorReportQuery();

  useEffect(() => {
    if (reportId !== undefined) {
      void getReport({ reportId, includeIndicators: true }, true);
    }
  }, [getReport, reportId]);

  return {
    isFetching: getReportResponse.isFetching,
    report: getReportResponse.currentData?.report,
  };
};

export default useOneAcceleratorReport;

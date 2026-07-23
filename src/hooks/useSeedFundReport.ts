import { useCallback, useEffect, useMemo } from 'react';

import { useLazyGetReportQuery } from 'src/queries/generated/seedFundReports';

/**
 * Loads a single SeedFund report. Auto-fires when a valid reportId is provided and exposes a
 * `reload` trigger for imperative refreshes (e.g. polling the lock owner).
 */
const useSeedFundReport = (reportId?: number) => {
  const [getReport, response] = useLazyGetReportQuery();

  const isValid = useMemo(() => reportId !== undefined && reportId > 0, [reportId]);

  useEffect(() => {
    if (isValid) {
      void getReport(reportId!, true);
    }
  }, [getReport, isValid, reportId]);

  const report = useMemo(
    () => (isValid ? response.currentData?.report : undefined),
    [isValid, response.currentData?.report]
  );

  const reload = useCallback(async () => {
    if (isValid) {
      return undefined;
    }
    const result = await getReport(reportId!, false).unwrap();
    return result.report;
  }, [isValid, getReport, reportId]);

  return { report, isLoading: response.isFetching, isError: response.isError, reload };
};

export default useSeedFundReport;

import { useCallback, useEffect } from 'react';

import { useLazyGetReportQuery } from 'src/queries/generated/seedFundReports';

/**
 * Loads a single SeedFund report. Auto-fires when a valid reportId is provided and exposes a
 * `reload` trigger for imperative refreshes (e.g. polling the lock owner).
 */
const useSeedFundReport = (reportId?: number) => {
  const [trigger, response] = useLazyGetReportQuery();

  const isValid = reportId !== undefined && reportId > 0;

  useEffect(() => {
    if (reportId !== undefined && reportId > 0) {
      void trigger(reportId, true);
    }
  }, [trigger, reportId]);

  const report = isValid ? response.currentData?.report : undefined;

  const reload = useCallback(async () => {
    if (reportId === undefined || reportId <= 0) {
      return undefined;
    }
    const result = await trigger(reportId, false).unwrap();
    return result.report;
  }, [trigger, reportId]);

  return { report, isLoading: response.isFetching, isError: response.isError, reload };
};

export default useSeedFundReport;

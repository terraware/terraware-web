import { useCallback, useEffect, useState } from 'react';

import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  AcceleratorReport,
  MetricType,
  ReportProjectMetric,
  ReportStandardMetric,
  ReportSystemMetric,
} from 'src/types/AcceleratorReport';

import useFunderPortal from './useFunderPortal';

const useProjectReports = (
  projectId?: number | string,
  includeFuture: boolean = false,
  includeMetrics: boolean = true,
  year?: string
) => {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState(true);
  const [requestId, setRequestId] = useState('');
  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReport[]>([]);
  const listAcceleratorReportsRequest = useAppSelector(selectListAcceleratorReports(requestId));
  const { isFunderRoute } = useFunderPortal();

  const reload = useCallback(() => {
    if (projectId && !isFunderRoute) {
      setBusy(true);
      const request = dispatch(
        requestListAcceleratorReports({
          projectId: projectId.toString(),
          includeFuture,
          includeMetrics,
          year,
        })
      );
      setRequestId(request.requestId);
    } else {
      setBusy(false);
    }
  }, [projectId, isFunderRoute, dispatch, includeFuture, includeMetrics, year]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (listAcceleratorReportsRequest?.status === 'success') {
      setAcceleratorReports(listAcceleratorReportsRequest?.data || []);
      setBusy(false);
    }
  }, [listAcceleratorReportsRequest]);

  const getYearTarget = useCallback(
    (
      metric: ReportProjectMetric | ReportSystemMetric | ReportStandardMetric,
      type: MetricType,
      reportYear: string | undefined
    ): number | undefined => {
      if (!reportYear || !acceleratorReports) {
        return undefined;
      }

      // Find the annual report for this year from AcceleratorReports
      const annualReport = acceleratorReports.find(
        (report) => report.frequency === 'Annual' && report.startDate.split('-')[0] === reportYear
      );

      if (!annualReport) {
        return undefined;
      }

      // Find the matching metric in the annual report
      if (type === 'system' && 'metric' in metric) {
        const foundMetric = annualReport.systemMetrics?.find((m) => m.metric === metric.metric);
        return foundMetric?.target;
      } else if ((type === 'project' || type === 'standard') && 'id' in metric) {
        const metricsArray = type === 'project' ? annualReport.projectMetrics : annualReport.standardMetrics;
        const foundMetric = metricsArray?.find((m) => m.id === metric.id);
        return foundMetric?.target;
      }

      return undefined;
    },
    [acceleratorReports]
  );

  return { busy, reload, acceleratorReports, getYearTarget };
};

export default useProjectReports;

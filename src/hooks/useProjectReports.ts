import { useCallback, useEffect, useMemo, useState } from 'react';

import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

const useProjectReports = (
  projectId?: number | string,
  includeFuture: boolean = false,
  includeMetrics: boolean = true,
  year?: string
) => {
  const dispatch = useAppDispatch();
  const [requestId, setRequestId] = useState('');
  const [acceleratorReports, setAcceleratorReports] = useState<AcceleratorReport[]>([]);
  const listAcceleratorReportsRequest = useAppSelector(selectListAcceleratorReports(requestId));

  const reload = useCallback(() => {
    if (projectId) {
      const request = dispatch(
        requestListAcceleratorReports({
          projectId: projectId.toString(),
          includeFuture,
          includeMetrics,
          year,
        })
      );
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId, includeFuture, includeMetrics, year]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (listAcceleratorReportsRequest?.status === 'success') {
      setAcceleratorReports(listAcceleratorReportsRequest?.data || []);
    }
  }, [listAcceleratorReportsRequest]);

  const busy = useMemo(() => listAcceleratorReportsRequest?.status === 'pending', [listAcceleratorReportsRequest]);

  return { busy, reload, acceleratorReports };
};

export default useProjectReports;

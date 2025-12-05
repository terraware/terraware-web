import { useCallback, useEffect, useState } from 'react';

import { selectListAcceleratorReports } from 'src/redux/features/reports/reportsSelectors';
import { requestListAcceleratorReports } from 'src/redux/features/reports/reportsThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { AcceleratorReport } from 'src/types/AcceleratorReport';

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

  return { busy, reload, acceleratorReports };
};

export default useProjectReports;

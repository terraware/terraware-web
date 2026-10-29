import { useCallback } from 'react';

import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import { ReportsSegment } from './ReportsContent';

const useExitReportsEdit = (projectId: number) => {
  const navigate = useSyncNavigate();

  return useCallback(
    (segment: ReportsSegment, reportId?: number) => {
      const params = new URLSearchParams({ tab: 'reports' });

      if (segment !== 'reports') {
        params.set('reportsSegment', segment);
      }

      if (reportId !== undefined) {
        params.set('reportId', `${reportId}`);
      }

      navigate(`${APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`)}?${params.toString()}`);
    },
    [navigate, projectId]
  );
};

export default useExitReportsEdit;

import { useCallback } from 'react';

import { APP_PATHS } from 'src/constants';
import { useFeatureEnabled } from 'src/features';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';

import { ReportsSegment, SEGMENT_PATHS } from './ReportsContent';

const useExitReportsEdit = (projectId: number) => {
  const cleanUpTabsEnabled = useFeatureEnabled('Clean Up Console Tabs');
  const navigate = useSyncNavigate();

  return useCallback(
    (segment: ReportsSegment, reportId?: number) => {
      if (cleanUpTabsEnabled) {
        const params = new URLSearchParams({ tab: 'reports' });

        if (segment !== 'reports') {
          params.set('reportsSegment', segment);
        }

        if (reportId !== undefined) {
          params.set('reportId', `${reportId}`);
        }

        navigate(`${APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', `${projectId}`)}?${params.toString()}`);
        return;
      }

      const reportsPath = APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', `${projectId}`);

      navigate(`${reportsPath}${SEGMENT_PATHS[segment]}${reportId === undefined ? '' : `/${reportId}`}`);
    },
    [cleanUpTabsEnabled, navigate, projectId]
  );
};

export default useExitReportsEdit;

import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportActions from './ReportActions';
import ReportsContent, { ReportsSegment, SEGMENT_PATHS } from './ReportsContent';

type ReportsSegmentedViewProps = {
  tab?: string;
};

const ReportsSegmentedView = ({ tab }: ReportsSegmentedViewProps) => {
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const navigate = useSyncNavigate();
  const { strings } = useLocalization();
  const pathParams = useParams<{ projectId: string; reportId?: string }>();

  const selectedReportId = Number(pathParams.reportId) || undefined;

  // the routes predate the segment control, so 'settings' is the indicators segment
  const segment: ReportsSegment = tab === 'targets' ? 'targets' : tab === 'settings' ? 'indicators' : 'reports';

  const reportsPath = APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', pathParams.projectId ?? '');

  const onChangeSegment = useCallback(
    (newSegment: ReportsSegment) => navigate(`${reportsPath}${SEGMENT_PATHS[newSegment]}`),
    [navigate, reportsPath]
  );

  const pageCrumbs = useMemo(
    () => [
      ...crumbs,
      {
        name: acceleratorProject?.dealName || project?.name || '',
        to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', acceleratorProject?.projectId.toString() || ''),
      },
    ],
    [acceleratorProject, crumbs, project]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
      crumbs={pageCrumbs}
      rightComponent={
        segment === 'reports' && selectedReportId !== undefined ? (
          <ReportActions projectId={Number(pathParams.projectId)} reportId={selectedReportId} />
        ) : undefined
      }
      rightComponentGridSize={6}
      stickyHeader
      title={strings.REPORTS}
      titleStyle={{ paddingTop: '16px' }}
    >
      <ReportsContent onChangeSegment={onChangeSegment} segment={segment} />
    </Page>
  );
};

export default ReportsSegmentedView;

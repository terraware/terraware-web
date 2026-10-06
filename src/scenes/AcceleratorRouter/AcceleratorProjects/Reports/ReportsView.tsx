import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import useScrollRestoration from 'src/hooks/useScrollRestoration';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportOptionsMenu from './ReportOptionsMenu';
import ReportReviewButtons from './ReportReviewButtons';
import ReportTabV2 from './ReportTabV2';
import ReportsSettings from './ReportsSettings';

type ReportsViewProps = {
  tab?: string;
};

const ReportsView = ({ tab }: ReportsViewProps) => {
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const navigate = useSyncNavigate();
  const { strings } = useLocalization();
  const theme = useTheme();
  const { goToAcceleratorProjectReportEdit, goToNewIndicator } = useNavigateTo();
  const pathParams = useParams<{ projectId: string; reportId?: string }>();
  const { isAllowed } = useUser();

  const activeTab = tab ?? 'reports';

  const tabs = useMemo(() => {
    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: <ReportTabV2 active={activeTab === 'reports'} />,
      },
      {
        id: 'targets',
        label: strings.TARGETS,
        children: <AcceleratorReportTargetsTable />,
      },
      {
        id: 'settings',
        label: strings.INDICATORS,
        children: <ReportsSettings />,
      },
    ];
  }, [activeTab, strings]);

  const selectedReportId = Number(pathParams.reportId) || undefined;

  const { isLoading } = useAcceleratorReportActions(selectedReportId);

  // the tab below runs this same query, so this is a cache read
  const { report } = useOneAcceleratorReport(selectedReportId);

  const { remember } = useScrollRestoration(selectedReportId, report !== undefined);

  const goToEdit = useCallback(() => {
    if (selectedReportId !== undefined) {
      remember();
      goToAcceleratorProjectReportEdit(selectedReportId, Number(pathParams.projectId));
    }
  }, [goToAcceleratorProjectReportEdit, pathParams.projectId, remember, selectedReportId]);

  const reportsPath = APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', pathParams.projectId ?? '');

  const onChangeTab = useCallback(
    (newTab: string) =>
      navigate(newTab === 'reports' ? reportsPath : `${reportsPath}/${newTab === 'settings' ? 'indicators' : newTab}`),
    [navigate, reportsPath]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
      crumbs={[
        ...crumbs,
        {
          name: acceleratorProject?.dealName || project?.name || '',
          to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', acceleratorProject?.projectId.toString() || ''),
        },
      ]}
      rightComponentGridSize={6}
      stickyHeader
      title={strings.REPORTS}
      titleStyle={{ paddingTop: '16px' }}
      rightComponent={
        activeTab === 'settings' && isAllowed('UPDATE_REPORTS_SETTINGS') ? (
          <Button
            label={strings.ADD_INDICATOR}
            icon='plus'
            size='medium'
            onClick={() => goToNewIndicator(pathParams.projectId ?? '')}
          />
        ) : activeTab === 'reports' && selectedReportId !== undefined ? (
          <Box display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
            {isAllowed('EDIT_REPORTS') && (
              <Button
                disabled={isLoading}
                icon='iconEdit'
                label={strings.EDIT}
                onClick={goToEdit}
                priority='secondary'
                size='medium'
              />
            )}

            <ReportReviewButtons reportId={selectedReportId} />

            <ReportOptionsMenu projectId={Number(pathParams.projectId)} reportId={selectedReportId} />
          </Box>
        ) : undefined
      }
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ReportsView;

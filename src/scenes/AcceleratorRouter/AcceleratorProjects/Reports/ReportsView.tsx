import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';

import { Box } from '@mui/material';
import { Button } from '@terraware/web-components';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import AcceleratorReportsTable from 'src/components/AcceleratorReports/AcceleratorReportsTable';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization, useUser } from 'src/providers';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportTabV2 from './ReportTabV2';
import ReportsSettings from './ReportsSettings';

export type ReportsViewProps = {
  tab?: string;
};

const ReportsView = ({ tab }: ReportsViewProps) => {
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const navigate = useSyncNavigate();
  const { strings } = useLocalization();
  const { goToAcceleratorProjectReportEdit, goToNewIndicator } = useNavigateTo();
  const pathParams = useParams<{ projectId: string; reportId?: string }>();
  const { isAllowed } = useUser();

  const newReportTabEnabled = isEnabled('Report Updates July 2026');
  const pathActiveTab = tab ?? 'reports';

  const tabs = useMemo(() => {
    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: newReportTabEnabled ? (
          <ReportTabV2 active={pathActiveTab === 'reports'} />
        ) : (
          <AcceleratorReportsTable />
        ),
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
  }, [newReportTabEnabled, pathActiveTab, strings]);

  const { activeTab: stickyActiveTab, onChangeTab: onChangeStickyTab } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'project-reports',
  });

  const selectedReportId = Number(pathParams.reportId) || undefined;

  const reportsPath = APP_PATHS.ACCELERATOR_PROJECT_REPORTS.replace(':projectId', pathParams.projectId ?? '');

  const onChangePathTab = useCallback(
    (newTab: string) =>
      navigate(newTab === 'reports' ? reportsPath : `${reportsPath}/${newTab === 'settings' ? 'indicators' : newTab}`),
    [navigate, reportsPath]
  );

  const activeTab = newReportTabEnabled ? pathActiveTab : stickyActiveTab;
  const onChangeTab = newReportTabEnabled ? onChangePathTab : onChangeStickyTab;

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
        ) : newReportTabEnabled &&
          activeTab === 'reports' &&
          selectedReportId !== undefined &&
          isAllowed('EDIT_REPORTS') ? (
          <Button
            icon='iconEdit'
            label={strings.EDIT}
            onClick={() => goToAcceleratorProjectReportEdit(selectedReportId, Number(pathParams.projectId))}
            priority='secondary'
            size='medium'
          />
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

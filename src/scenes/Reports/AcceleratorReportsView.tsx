import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import AcceleratorReportsTable from 'src/components/AcceleratorReports/AcceleratorReportsTable';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useStickyTabs from 'src/utils/useStickyTabs';

import AcceleratorReportTabV2 from './AcceleratorReportTabV2';
import ReportSubmitButton from './ReportSubmitButton';

type AcceleratorReportsViewProps = {
  tab?: string;
};

const AcceleratorReportsView = ({ tab }: AcceleratorReportsViewProps) => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const navigate = useSyncNavigate();
  const pathParams = useParams<{ reportId?: string }>();
  const { goToAcceleratorReportEdit } = useNavigateTo();
  const { currentAcceleratorProject, allAcceleratorProjects, setCurrentAcceleratorProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  const newReportTabEnabled = isEnabled('Report Updates July 2026');
  const pathActiveTab = tab ?? 'reports';

  const tabs = useMemo(() => {
    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: newReportTabEnabled ? (
          <AcceleratorReportTabV2 active={pathActiveTab === 'reports'} />
        ) : (
          <AcceleratorReportsTable />
        ),
      },
      {
        id: 'targets',
        label: strings.TARGETS,
        children: <AcceleratorReportTargetsTable />,
      },
    ];
  }, [newReportTabEnabled, pathActiveTab, strings]);

  const { activeTab: stickyActiveTab, onChangeTab: onChangeStickyTab } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'accelerator-reports',
  });

  const onChangePathTab = useCallback(
    (newTab: string) => navigate(newTab === 'reports' ? APP_PATHS.REPORTS : `${APP_PATHS.REPORTS}/${newTab}`),
    [navigate]
  );

  const activeTab = newReportTabEnabled ? tab ?? 'reports' : stickyActiveTab;
  const onChangeTab = newReportTabEnabled ? onChangePathTab : onChangeStickyTab;

  const selectedReportId = Number(pathParams.reportId) || undefined;

  const { report } = useOneAcceleratorReport(selectedReportId);

  const { isLoading } = useAcceleratorReportActions(selectedReportId);

  // a report can only be edited before it has been accepted
  const reportStatus = report?.status;
  const canEdit = reportStatus === 'Not Submitted' || reportStatus === 'Needs Update';

  const rightComponent = useMemo(
    () =>
      newReportTabEnabled && activeTab === 'reports' && selectedReportId !== undefined ? (
        <Box display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
          <Button
            disabled={!canEdit || isLoading}
            icon='iconEdit'
            label={strings.EDIT}
            onClick={() => goToAcceleratorReportEdit(selectedReportId)}
            priority='secondary'
            size='medium'
          />

          <ReportSubmitButton reportId={selectedReportId} />
        </Box>
      ) : undefined,
    [activeTab, canEdit, goToAcceleratorReportEdit, isLoading, newReportTabEnabled, selectedReportId, strings, theme]
  );

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        currentAcceleratorProject={currentAcceleratorProject}
        projectFilter={projectFilter}
        projects={allAcceleratorProjects}
        setCurrentAcceleratorProject={setCurrentAcceleratorProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [allAcceleratorProjects, currentAcceleratorProject, projectFilter, setCurrentAcceleratorProject, setProjectFilter]
  );

  return (
    <Page
      hierarchicalCrumbs={false}
      leftComponent={PageHeaderLeftComponent}
      rightComponent={rightComponent}
      title={strings.REPORTS}
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default AcceleratorReportsView;

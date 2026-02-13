import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import AcceleratorReportsTable from 'src/components/AcceleratorReports/AcceleratorReportsTable';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportsSettings from './ReportsSettings';

const ReportsView = () => {
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const { activeLocale } = useLocalization();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: <AcceleratorReportsTable />,
      },
      {
        id: 'targets',
        label: strings.TARGETS,
        children: <AcceleratorReportTargetsTable />,
      },
      {
        id: 'settings',
        label: strings.SETTINGS,
        children: <ReportsSettings />,
      },
    ];
  }, [activeLocale]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'project-reports',
  });

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
    >
      <Box display='flex' flexDirection='column' flexGrow={1} width={'100%'}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ReportsView;

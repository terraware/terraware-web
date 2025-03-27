import React, { useMemo } from 'react';

import { Box } from '@mui/material';
import Tabs from '@terraware/web-components/components/Tabs';

import ReportsTargets from 'src/components/AcceleratorReports/ReportsTargets';
import Page from 'src/components/Page';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useParticipantProjectData } from '../ParticipantProjectContext';
import ReportsList from './ReportsList';
import ReportsSettings from './ReportsSettings';

const ReportsView = () => {
  const { crumbs, participantProject } = useParticipantProjectData();
  const { activeLocale } = useLocalization();

  const tabs = useMemo(() => {
    if (!activeLocale) {
      return [];
    }

    return [
      {
        id: 'reports',
        label: strings.REPORTS,
        children: <ReportsList />,
      },
      {
        id: 'targets',
        label: strings.TARGETS,
        children: <ReportsTargets />,
      },
      {
        id: 'settings',
        label: strings.SETTINGS,
        children: <ReportsSettings />,
      },
    ];
  }, [activeLocale]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'project-reports',
    keepQuery: false,
  });

  return (
    <Page
      hierarchicalCrumbs={false}
      crumbs={[
        ...crumbs,
        {
          name: participantProject?.dealName || '',
          to: APP_PATHS.ACCELERATOR_PROJECT_VIEW.replace(':projectId', participantProject?.projectId.toString() || ''),
        },
      ]}
      title={strings.REPORTS}
      titleStyle={{ paddingTop: '16px' }}
    >
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default ReportsView;

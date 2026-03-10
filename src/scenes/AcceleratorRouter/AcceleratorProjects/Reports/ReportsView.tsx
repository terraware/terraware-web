import React, { useMemo } from 'react';
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
import { useLocalization } from 'src/providers';
import useStickyTabs from 'src/utils/useStickyTabs';

import { useAcceleratorProjectData } from '../AcceleratorProjectContext';
import ReportsSettings from './ReportsSettings';

const ReportsView = () => {
  const { crumbs, acceleratorProject, project } = useAcceleratorProjectData();
  const { strings } = useLocalization();
  const improvedReportsEnabled = isEnabled('Improved Reports');
  const { goToNewIndicator } = useNavigateTo();
  const pathParams = useParams<{ projectId: string }>();

  const tabs = useMemo(() => {
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
        label: improvedReportsEnabled ? strings.INDICATORS : strings.SETTINGS,
        children: <ReportsSettings />,
      },
    ];
  }, [strings, improvedReportsEnabled]);

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
      rightComponent={
        improvedReportsEnabled && activeTab === 'settings' ? (
          <Button
            label={strings.ADD_INDICATOR}
            icon='plus'
            size='medium'
            onClick={() => goToNewIndicator(pathParams.projectId ?? '')}
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

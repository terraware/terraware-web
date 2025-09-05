import React, { useMemo, useState } from 'react';

import { Box } from '@mui/material';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import AcceleratorReportsTable from 'src/components/AcceleratorReports/AcceleratorReportsTable';
import Page from 'src/components/Page';
import PageHeaderProjectFilter from 'src/components/PageHeader/PageHeaderProjectFilter';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import useStickyTabs from 'src/utils/useStickyTabs';

const AcceleratorReportsView = () => {
  const { strings } = useLocalization();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

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
    ];
  }, [strings]);

  const { activeTab, onChangeTab } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'accelerator-reports',
  });

  const PageHeaderLeftComponent = useMemo(
    () => (
      <PageHeaderProjectFilter
        allParticipantProjects={allParticipantProjects}
        currentParticipantProject={currentParticipantProject}
        projectFilter={projectFilter}
        setCurrentParticipantProject={setCurrentParticipantProject}
        setProjectFilter={setProjectFilter}
      />
    ),
    [allParticipantProjects, currentParticipantProject, projectFilter, setCurrentParticipantProject, setProjectFilter]
  );

  return (
    <Page hierarchicalCrumbs={false} leftComponent={PageHeaderLeftComponent} title={strings.REPORTS}>
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <Tabs activeTab={activeTab} onChangeTab={onChangeTab} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default AcceleratorReportsView;

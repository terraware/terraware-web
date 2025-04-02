import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';
import Tabs from '@terraware/web-components/components/Tabs';

import AcceleratorReportTargetsTable from 'src/components/AcceleratorReports/AcceleratorReportTargetsTable';
import AcceleratorReportsTable from 'src/components/AcceleratorReports/AcceleratorReportsTable';
import Page from 'src/components/Page';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import strings from 'src/strings';
import theme from 'src/theme';
import useStickyTabs from 'src/utils/useStickyTabs';

const AcceleratorReportsView = () => {
  const { activeLocale } = useLocalization();
  const {
    currentParticipantProject,
    projectsWithModules: moduleProjects,
    setCurrentParticipantProject,
  } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  useEffect(() => {
    if (!projectFilter.projectId && currentParticipantProject?.id) {
      setProjectFilter({ projectId: currentParticipantProject?.id });
    }
  }, [currentParticipantProject?.id, projectFilter?.projectId]);

  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
    }
  }, [projectFilter?.projectId]);

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
    ];
  }, [activeLocale, projectFilter?.projectId]);

  const { activeTab, onTabChange } = useStickyTabs({
    defaultTab: 'reports',
    tabs,
    viewIdentifier: 'accelerator-reports',
    keepQuery: false,
  });

  const PageHeaderLeftComponent = useMemo(
    () =>
      activeLocale ? (
        <>
          <Grid container sx={{ alignItems: 'center', flexWrap: 'nowrap', marginTop: theme.spacing(0.5) }}>
            <Grid item>
              <Separator height={'40px'} />
            </Grid>
            {moduleProjects?.length > 0 && (
              <Grid item>
                {moduleProjects?.length > 1 ? (
                  <Box display='flex'>
                    <Typography sx={{ lineHeight: '40px', marginRight: theme.spacing(1.5) }} component={'span'}>
                      {strings.PROJECT}
                    </Typography>
                    <ProjectsDropdown
                      availableProjects={moduleProjects}
                      label=''
                      record={projectFilter}
                      setRecord={setProjectFilter}
                    />
                  </Box>
                ) : (
                  <Typography>{moduleProjects[0].name}</Typography>
                )}
              </Grid>
            )}
          </Grid>
        </>
      ) : undefined,
    [activeLocale, moduleProjects, projectFilter?.projectId]
  );

  return (
    <Page hierarchicalCrumbs={false} leftComponent={PageHeaderLeftComponent} title={strings.REPORTS}>
      <Box display='flex' flexDirection='column' flexGrow={1}>
        <Tabs activeTab={activeTab} onTabChange={onTabChange} tabs={tabs} />
      </Box>
    </Page>
  );
};

export default AcceleratorReportsView;

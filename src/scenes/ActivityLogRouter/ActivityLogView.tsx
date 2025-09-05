import React, { useEffect, useMemo, useState } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import Page from 'src/components/Page';
import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useLocalization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import theme from 'src/theme';

export default function ActivityLogView(): JSX.Element {
  const { strings } = useLocalization();
  const { currentParticipantProject, allParticipantProjects, setCurrentParticipantProject } = useParticipantData();

  const [projectFilter, setProjectFilter] = useState<{ projectId?: number | string }>({});

  useEffect(() => {
    if (!projectFilter.projectId && currentParticipantProject?.id) {
      setProjectFilter({ projectId: currentParticipantProject?.id });
    }
  }, [currentParticipantProject?.id, projectFilter?.projectId]);

  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
    } else if (allParticipantProjects.length === 1) {
      setCurrentParticipantProject(allParticipantProjects[0].id);
    }
  }, [allParticipantProjects, projectFilter.projectId, setCurrentParticipantProject]);

  const PageHeaderLeftComponent = useMemo(
    () => (
      <Grid container sx={{ alignItems: 'center', flexWrap: 'nowrap', marginTop: theme.spacing(0.5) }}>
        <Grid item>
          <Separator height='40px' />
        </Grid>
        {allParticipantProjects?.length > 0 && (
          <Grid item>
            {allParticipantProjects?.length > 1 ? (
              <Box display='flex'>
                <Typography sx={{ lineHeight: '40px', marginRight: theme.spacing(1.5) }} component='span'>
                  {strings.PROJECT}
                </Typography>
                <ProjectsDropdown
                  availableProjects={allParticipantProjects}
                  label=''
                  record={projectFilter}
                  setRecord={setProjectFilter}
                />
              </Box>
            ) : (
              <Typography>{allParticipantProjects[0].name}</Typography>
            )}
          </Grid>
        )}
      </Grid>
    ),
    [allParticipantProjects, projectFilter, strings]
  );

  return (
    <Page leftComponent={PageHeaderLeftComponent} hierarchicalCrumbs={false} title={strings.ACTIVITY_LOG}>
      <p>Content here</p>
    </Page>
  );
}

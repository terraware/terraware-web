import React, { useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import { useLocalization } from 'src/providers';
import theme from 'src/theme';
import { Project } from 'src/types/Project';

type PageHeaderProjectFilterProps = {
  allParticipantProjects: Project[];
  currentParticipantProject?: Project;
  projectFilter: { projectId?: number | string };
  setCurrentParticipantProject: (projectId: string | number) => void;
  setProjectFilter: React.Dispatch<React.SetStateAction<{ projectId?: number | string }>>;
};

const PageHeaderProjectFilter = ({
  allParticipantProjects,
  currentParticipantProject,
  projectFilter,
  setCurrentParticipantProject,
  setProjectFilter,
}: PageHeaderProjectFilterProps) => {
  const { strings } = useLocalization();

  useEffect(() => {
    if (!projectFilter.projectId && currentParticipantProject?.id) {
      setProjectFilter({ projectId: currentParticipantProject?.id });
    }
  }, [currentParticipantProject?.id, projectFilter.projectId, setProjectFilter]);

  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
    } else if (allParticipantProjects.length === 1) {
      setCurrentParticipantProject(allParticipantProjects[0].id);
    }
  }, [allParticipantProjects, projectFilter.projectId, setCurrentParticipantProject]);

  return (
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
  );
};

export default PageHeaderProjectFilter;

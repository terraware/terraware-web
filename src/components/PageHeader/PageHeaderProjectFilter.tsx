import React, { useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import theme from 'src/theme';
import { Project } from 'src/types/Project';

type PageHeaderProjectFilterProps = {
  currentParticipantProject?: Project;
  projectFilter: { projectId?: number | string };
  projects: Project[];
  setCurrentParticipantProject: (projectId: string | number) => void;
  setProjectFilter: React.Dispatch<React.SetStateAction<{ projectId?: number | string }>>;
};

const PageHeaderProjectFilter = ({
  currentParticipantProject,
  projectFilter,
  projects,
  setCurrentParticipantProject,
  setProjectFilter,
}: PageHeaderProjectFilterProps) => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();

  // set project filter to current participant project or first project, if not set
  useEffect(() => {
    if (projectFilter.projectId) {
      return;
    }

    if (currentParticipantProject?.id) {
      setProjectFilter({ projectId: currentParticipantProject.id });
    } else if (projects.length) {
      setProjectFilter({ projectId: projects[0].id });
    }
  }, [currentParticipantProject?.id, projectFilter.projectId, projects, setProjectFilter]);

  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
    } else if (projects.length === 1) {
      setCurrentParticipantProject(projects[0].id);
    }
  }, [projects, projectFilter.projectId, setCurrentParticipantProject]);

  return (
    <Grid container sx={{ alignItems: 'center', flexWrap: 'nowrap', marginTop: theme.spacing(0.5) }}>
      <Grid item>
        <Separator height='40px' />
      </Grid>
      {projects?.length > 0 && (
        <Grid item>
          {projects?.length > 1 ? (
            <Box display='flex'>
              <Typography component='span' lineHeight='40px' marginRight='12px' whiteSpace='nowrap'>
                {isAcceleratorRoute ? strings.DEAL_NAME : strings.PROJECT}
              </Typography>
              <ProjectsDropdown
                availableProjects={projects}
                label=''
                record={projectFilter}
                setRecord={setProjectFilter}
                useDealName={isAcceleratorRoute}
              />
            </Box>
          ) : (
            <Typography>{projects[0].name}</Typography>
          )}
        </Grid>
      )}
    </Grid>
  );
};

export default PageHeaderProjectFilter;

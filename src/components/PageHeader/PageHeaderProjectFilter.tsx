import React, { useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import theme from 'src/theme';
import { Project } from 'src/types/Project';

const SELECTED_PROJECT_SESSION_KEY = 'selected-project-id';

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

  // initialize project filter with session storage value or defaults
  useEffect(() => {
    if (projectFilter.projectId) {
      return;
    }

    // check session storage for previously selected project
    const storedProjectId = sessionStorage.getItem(SELECTED_PROJECT_SESSION_KEY);
    const storedProjectIdNumber = storedProjectId ? Number(storedProjectId) : null;

    // check if the stored project ID exists in the current projects list
    const isStoredProjectValid =
      storedProjectIdNumber && projects.some((project) => project.id === storedProjectIdNumber);

    if (isStoredProjectValid) {
      setProjectFilter({ projectId: storedProjectIdNumber });
      setCurrentParticipantProject(storedProjectIdNumber);
    } else if (currentParticipantProject?.id) {
      setProjectFilter({ projectId: currentParticipantProject.id });
    } else if (projects.length) {
      setProjectFilter({ projectId: projects[0].id });
    }
  }, [
    currentParticipantProject?.id,
    projectFilter.projectId,
    projects,
    setProjectFilter,
    setCurrentParticipantProject,
  ]);

  // update current participant project and save to session storage when project filter changes
  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentParticipantProject(projectFilter.projectId);
      // save the selected project ID to session storage
      sessionStorage.setItem(SELECTED_PROJECT_SESSION_KEY, String(projectFilter.projectId));
    } else if (projects.length === 1) {
      setCurrentParticipantProject(projects[0].id);
      // save the selected project ID to session storage
      sessionStorage.setItem(SELECTED_PROJECT_SESSION_KEY, String(projects[0].id));
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

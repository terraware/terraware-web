import React, { useEffect } from 'react';

import { Box, Grid, Typography } from '@mui/material';
import { Separator } from '@terraware/web-components';
import { useDeviceInfo } from '@terraware/web-components/utils';

import ProjectsDropdown from 'src/components/ProjectsDropdown';
import useAcceleratorConsole from 'src/hooks/useAcceleratorConsole';
import { useLocalization } from 'src/providers';
import theme from 'src/theme';
import { Project } from 'src/types/Project';

const SELECTED_PROJECT_SESSION_KEY = 'selected-project-id';

type PageHeaderProjectFilterProps = {
  currentAcceleratorProject?: Project;
  projectFilter: { projectId?: number | string };
  projects: Project[];
  setCurrentAcceleratorProject: (projectId: string | number) => void;
  setProjectFilter: React.Dispatch<React.SetStateAction<{ projectId?: number | string }>>;
};

const PageHeaderProjectFilter = ({
  currentAcceleratorProject,
  projectFilter,
  projects,
  setCurrentAcceleratorProject,
  setProjectFilter,
}: PageHeaderProjectFilterProps) => {
  const { strings } = useLocalization();
  const { isAcceleratorRoute } = useAcceleratorConsole();
  const { isDesktop } = useDeviceInfo();

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
      setCurrentAcceleratorProject(storedProjectIdNumber);
    } else if (currentAcceleratorProject?.id) {
      setProjectFilter({ projectId: currentAcceleratorProject.id });
    } else if (projects.length) {
      setProjectFilter({ projectId: projects[0].id });
    }
  }, [
    currentAcceleratorProject?.id,
    projectFilter.projectId,
    projects,
    setProjectFilter,
    setCurrentAcceleratorProject,
  ]);

  // update current accelerator project and save to session storage when project filter changes
  useEffect(() => {
    if (projectFilter.projectId) {
      setCurrentAcceleratorProject(projectFilter.projectId);
      // save the selected project ID to session storage
      sessionStorage.setItem(SELECTED_PROJECT_SESSION_KEY, String(projectFilter.projectId));
    } else if (projects.length === 1) {
      setCurrentAcceleratorProject(projects[0].id);
      // save the selected project ID to session storage
      sessionStorage.setItem(SELECTED_PROJECT_SESSION_KEY, String(projects[0].id));
    }
  }, [projects, projectFilter.projectId, setCurrentAcceleratorProject]);

  return (
    <Grid
      container
      sx={{
        alignItems: 'center',
        flexWrap: 'nowrap',
        marginY: isDesktop ? 0 : theme.spacing(1),
      }}
    >
      {isDesktop && (
        <Grid item>
          <Separator height='40px' />
        </Grid>
      )}
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

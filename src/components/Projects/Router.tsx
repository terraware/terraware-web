import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProjectEditView from 'src/components/ProjectEditView';
import ProjectNewView from 'src/components/ProjectNewView';
import ProjectView from 'src/components/ProjectView';
import Projects from 'src/components/Projects';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';
import { APP_PATHS } from 'src/constants';

export type ProjectsRouterProps = {
  isPlaceholderOrg: () => boolean;
  selectedOrgHasProjects: () => boolean;
  reloadProjects: () => void;
};

export default function ProjectsRouter({
  isPlaceholderOrg,
  selectedOrgHasProjects,
  reloadProjects,
}: ProjectsRouterProps): JSX.Element {
  const getProjectsView = (): JSX.Element => {
    if (!isPlaceholderOrg() && selectedOrgHasProjects()) {
      return <Projects />;
    }
    return <EmptyStatePage pageName={'Projects'} />;
  };

  return (
    <Routes>
      <Route path={APP_PATHS.PROJECTS} element={getProjectsView()} />
      <Route path={APP_PATHS.PROJECTS_NEW} element={<ProjectNewView reloadData={reloadProjects} />} />
      <Route path={APP_PATHS.PROJECT_VIEW} element={<ProjectView />} />
      <Route path={APP_PATHS.PROJECT_EDIT} element={<ProjectEditView />} />
    </Routes>
  );
}

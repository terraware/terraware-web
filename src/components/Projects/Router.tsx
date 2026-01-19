import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import ProjectEditView from 'src/components/ProjectEditView';
import ProjectNewView from 'src/components/ProjectNewView';
import ProjectView from 'src/components/ProjectView';
import Projects from 'src/components/Projects';
import EmptyStatePage from 'src/components/emptyStatePages/EmptyStatePage';

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
      <Route path={'/*'} element={getProjectsView()} />
      <Route path={'/new'} element={<ProjectNewView reloadData={reloadProjects} />} />
      <Route path={'/:projectId'} element={<ProjectView />} />
      <Route path={'/:projectId/edit'} element={<ProjectEditView />} />
    </Routes>
  );
}

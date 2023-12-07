import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import ProjectNewView from 'src/components/ProjectNewView';
import ProjectView from 'src/components/ProjectView';
import ProjectEditView from 'src/components/ProjectEditView';
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
    <Switch>
      <Route exact path={APP_PATHS.PROJECTS}>
        {getProjectsView()}
      </Route>
      <Route exact path={APP_PATHS.PROJECTS_NEW}>
        <ProjectNewView reloadData={reloadProjects} />
      </Route>
      <Route exact path={APP_PATHS.PROJECT_VIEW}>
        <ProjectView />
      </Route>
      <Route exact path={APP_PATHS.PROJECT_EDIT}>
        <ProjectEditView />
      </Route>
    </Switch>
  );
}

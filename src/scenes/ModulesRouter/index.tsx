import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';
import ModuleEventView from './ModuleEventView';
import ModuleView from './ModuleView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Switch>
        <Route exact path={APP_PATHS.MODULES_FOR_PROJECT}>
          <ListView />
        </Route>

        <Route exact path={APP_PATHS.MODULES_FOR_PROJECT_CONTENT}>
          <ModuleView />
        </Route>

        <Route exact path={APP_PATHS.MODULES_FOR_PROJECT_EVENT}>
          <ModuleEventView />
        </Route>
      </Switch>
    </ProjectProvider>
  );
};

export default ModulesRouter;

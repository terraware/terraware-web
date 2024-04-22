import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';
import ModuleAdditionalResourcesView from './ModuleAdditionalResources';
import ModuleEventSessionView from './ModuleEventView';
import ModulePreparationMaterialsView from './ModulePreparationMaterials';
import ModuleView from './ModuleView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Switch>
        <Route exact path={APP_PATHS.PROJECT_MODULES}>
          <ListView />
        </Route>

        <Route exact path={APP_PATHS.PROJECT_MODULE}>
          <ModuleView />
        </Route>

        <Route exact path={APP_PATHS.PROJECT_MODULE_ADDITIONAL_RESOURCES}>
          <ModuleAdditionalResourcesView />
        </Route>

        <Route exact path={APP_PATHS.PROJECT_MODULE_PREPARATION_MATERIALS}>
          <ModulePreparationMaterialsView />
        </Route>

        <Route exact path={APP_PATHS.PROJECT_MODULE_EVENT}>
          <ModuleEventSessionView />
        </Route>
      </Switch>
    </ProjectProvider>
  );
};

export default ModulesRouter;

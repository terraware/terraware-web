import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Switch>
        <Route exact path={APP_PATHS.MODULES_FOR_PROJECT}>
          <ListView />
        </Route>
      </Switch>
    </ProjectProvider>
  );
};

export default ModulesRouter;

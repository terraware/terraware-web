import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';
import ModuleEventSessionView from './ModuleEventSessionView';
import ModuleView from './ModuleView';
import ModuleProvider from './Provider';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Routes>
        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE */}
        <Route
          path={'/:moduleId'}
          element={
            <ModuleProvider>
              <Routes>
                {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE */}
                <Route path={'/*'} element={<ModuleView />} />
                {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE_SESSION */}
                <Route path={'/session/:sessionId'} element={<ModuleEventSessionView />} />
              </Routes>
            </ModuleProvider>
          }
        />
        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULES */}
        <Route path={'/*'} element={<ListView />} />
      </Routes>
    </ProjectProvider>
  );
};

export default ModulesRouter;

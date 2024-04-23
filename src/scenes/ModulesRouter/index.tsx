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
        <Route path={'/*'} element={<ListView />} />
        <Route
          path={'/:moduleId'}
          element={
            <ModuleProvider>
              <Routes>
                <Route path={'/*'} element={<ModuleView />} />
                <Route path={'/session/:sessionId'} element={<ModuleEventSessionView />} />
              </Routes>
            </ModuleProvider>
          }
        />
      </Routes>
    </ProjectProvider>
  );
};

export default ModulesRouter;

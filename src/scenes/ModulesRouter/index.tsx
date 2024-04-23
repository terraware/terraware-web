import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';
import ModuleEventView from './ModuleEventView';
import ModuleView from './ModuleView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Routes>
        <Route path={'/*'} element={<ListView />} />
        <Route path={'/:moduleId'} element={<ModuleView />} />
        <Route path={'/:moduleId/event/:eventId'} element={<ModuleEventView />} />
      </Routes>
    </ProjectProvider>
  );
};

export default ModulesRouter;

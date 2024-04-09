import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Routes>
        <Route path={APP_PATHS.MODULES_FOR_PROJECT} element={<ListView />} />
      </Routes>
    </ProjectProvider>
  );
};

export default ModulesRouter;

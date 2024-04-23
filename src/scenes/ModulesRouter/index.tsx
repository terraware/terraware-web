import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ProjectProvider from 'src/providers/Project/ProjectProvider';

import ListView from './ListView';
import ModuleAdditionalResourcesView from './ModuleAdditionalResources';
import ModuleEventSessionView from './ModuleEventSessionView';
import ModulePreparationMaterialsView from './ModulePreparationMaterials';
import ModuleView from './ModuleView';

const ModulesRouter = () => {
  return (
    <ProjectProvider>
      <Routes>
        <Route path={'/*'} element={<ListView />} />
        <Route path={'/:moduleId'} element={<ModuleView />} />
        <Route path={'/:moduleId/additionalResources'} element={<ModuleAdditionalResourcesView />} />
        <Route path={'/:moduleId/event/:eventId'} element={<ModuleEventSessionView />} />
        <Route path={'/:moduleId/preparationMaterials'} element={<ModulePreparationMaterialsView />} />
      </Routes>
    </ProjectProvider>
  );
};

export default ModulesRouter;

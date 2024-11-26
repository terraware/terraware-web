import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ListView from './ListView';
import ModuleContentView from './ModuleContentView';
import ModuleEventSessionView from './ModuleEventSessionView';
import ModuleView from './ModuleView';

const ModulesRouter = () => {
  return (
    <Routes>
      {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE */}
      <Route path={'/:moduleId'}>
        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE_ADDITIONAL_RESOURCES */}
        <Route path={'additionalResources'} element={<ModuleContentView contentType={'additionalResources'} />} />
        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE_PREPARATION_MATERIALS */}
        <Route path={'preparationMaterials'} element={<ModuleContentView contentType={'preparationMaterials'} />} />
        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE_SESSION */}
        <Route path={'sessions/:sessionId'} element={<ModuleEventSessionView />} />

        {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULE */}
        <Route path={''} element={<ModuleView />} />
      </Route>

      {/* @see /src/constants.ts:APP_PATHS.PROJECT_MODULES */}
      <Route path={''} element={<ListView />} />
    </Routes>
  );
};

export default ModulesRouter;

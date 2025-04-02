import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AcceleratorReportView from './AcceleratorReportView';
import AcceleratorReportsView from './AcceleratorReportsView';

const AcceleratorReportsRouter = () => {
  return (
    <Routes>
      <Route path='/*' element={<AcceleratorReportsView />} />
      <Route path={'/:projectId/:reportId'} element={<AcceleratorReportView />} />
    </Routes>
  );
};

export default AcceleratorReportsRouter;

import React from 'react';
import { Route, Routes } from 'react-router-dom';

import AcceleratorReportsView from './AcceleratorReportsView';

const AcceleratorReportsRouter = () => {
  return (
    <Routes>
      <Route path='/*' element={<AcceleratorReportsView />} />
    </Routes>
  );
};

export default AcceleratorReportsRouter;

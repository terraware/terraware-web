import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { useOrganization, useUser } from 'src/providers';

import AcceleratorReportEditV2 from './AcceleratorReportEditV2';
import AcceleratorReportsView from './AcceleratorReportsView';

const AcceleratorReportsRouter = () => {
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const isAllowedReadReports = isAllowed('READ_REPORTS', { organization: selectedOrganization });

  if (!isAllowedReadReports) {
    return (
      <Routes>
        <Route path='*' element={<Navigate to={APP_PATHS.HOME} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path={'/targets'} element={<AcceleratorReportsView tab='targets' />} />
      <Route path={'/:reportId/edit'} element={<AcceleratorReportEditV2 />} />
      <Route path={'/:reportId'} element={<AcceleratorReportsView tab='reports' />} />
      <Route path='/*' element={<AcceleratorReportsView tab='reports' />} />
    </Routes>
  );
};

export default AcceleratorReportsRouter;

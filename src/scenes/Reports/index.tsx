import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';
import { useOrganization, useUser } from 'src/providers';

import AcceleratorReportEdit from './AcceleratorReportEdit';
import AcceleratorReportView from './AcceleratorReportView';
import AcceleratorReportsView from './AcceleratorReportsView';

const AcceleratorReportsRouter = () => {
  const { isAllowed } = useUser();
  const { selectedOrganization } = useOrganization();
  const isReportsEnabled = isEnabled('Assigning and Collecting Reports');
  const isAllowedReadReports = isAllowed('READ_REPORTS', { organization: selectedOrganization });

  if (!(isReportsEnabled && isAllowedReadReports)) {
    return (
      <Routes>
        <Route path='*' element={<Navigate to={APP_PATHS.HOME} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path='/*' element={<AcceleratorReportsView />} />
      <Route path={'/:projectId/:reportId'} element={<AcceleratorReportView />} />
      <Route path={'/:projectId/:reportId/edit'} element={<AcceleratorReportEdit />} />
    </Routes>
  );
};

export default AcceleratorReportsRouter;

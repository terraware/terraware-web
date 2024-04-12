import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ReportSettingsEdit from 'src/components/Reports/ReportSettingsEdit';
import ReportsView from 'src/components/Reports/ReportsView';
import { ReportEdit, ReportView } from 'src/components/Reports/index';
import { useOrganization } from 'src/providers';

const ReportsRouter = (): JSX.Element | null => {
  const { selectedOrganization } = useOrganization();

  if (!selectedOrganization.canSubmitReports) {
    return null;
  }

  return (
    <Routes>
      <Route path={'/*'} element={<ReportsView tab={'reports'} />} />
      <Route path={'/settings'} element={<ReportsView tab={'settings'} />} />
      <Route path={'/settings/edit'} element={<ReportSettingsEdit />} />
      <Route path={':reportId/edit'} element={<ReportEdit />} />
      <Route path={'/:reportId'} element={<ReportView />} />
    </Routes>
  );
};

export default ReportsRouter;

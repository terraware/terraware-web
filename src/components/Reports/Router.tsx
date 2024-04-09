import React from 'react';
import { Route, Routes } from 'react-router-dom';

import ReportSettingsEdit from 'src/components/Reports/ReportSettingsEdit';
import ReportsView from 'src/components/Reports/ReportsView';
import { ReportEdit, ReportView } from 'src/components/Reports/index';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';

const ReportsRouter = (): JSX.Element | null => {
  const { selectedOrganization } = useOrganization();

  if (!selectedOrganization.canSubmitReports) {
    return null;
  }

  return (
    <Routes>
      <Route path={APP_PATHS.REPORTS} element={<ReportsView tab={'reports'} />} />
      <Route path={APP_PATHS.REPORTS_SETTINGS} element={<ReportsView tab={'settings'} />} />
      <Route path={APP_PATHS.REPORTS_SETTINGS_EDIT} element={<ReportSettingsEdit />} />
      <Route path={APP_PATHS.REPORTS_EDIT} element={<ReportEdit />} />
      <Route path={APP_PATHS.REPORTS_VIEW} element={<ReportView />} />
    </Routes>
  );
};

export default ReportsRouter;

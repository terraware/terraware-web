import React, { type JSX } from 'react';
import { Route, Routes } from 'react-router';

import ReportSettingsEdit from 'src/components/SeedFundReports/ReportSettingsEdit';
import ReportsView from 'src/components/SeedFundReports/ReportsView';
import { ReportEdit, ReportView } from 'src/components/SeedFundReports/index';
import { useOrganization } from 'src/providers';

const SeedFundReportsRouter = (): JSX.Element | null => {
  const { selectedOrganization } = useOrganization();

  if (!selectedOrganization?.canSubmitReports) {
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

export default SeedFundReportsRouter;

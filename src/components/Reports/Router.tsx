import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import ReportsView from 'src/components/Reports/ReportsView';
import { ReportEdit, ReportList, ReportView } from 'src/components/Reports/index';
import ReportSettingsEdit from 'src/components/Reports/ReportSettingsEdit';
import isEnabled from 'src/features';
import { useOrganization } from 'src/providers';

const ReportsRouter = (): JSX.Element | null => {
  const { selectedOrganization } = useOrganization();
  const featureFlagProjects = isEnabled('Projects');

  if (!selectedOrganization.canSubmitReports) {
    return null;
  }

  return (
    <Switch>
      <Route exact path={APP_PATHS.REPORTS}>
        {featureFlagProjects ? <ReportsView tab={'reports'} /> : <ReportList />}
      </Route>

      <Route exact path={APP_PATHS.REPORTS_SETTINGS}>
        <ReportsView tab={'settings'} />
      </Route>

      <Route exact path={APP_PATHS.REPORTS_SETTINGS_EDIT}>
        <ReportSettingsEdit />
      </Route>

      <Route path={APP_PATHS.REPORTS_EDIT}>
        <ReportEdit />
      </Route>

      <Route path={APP_PATHS.REPORTS_VIEW}>
        <ReportView />
      </Route>
    </Switch>
  );
};

export default ReportsRouter;

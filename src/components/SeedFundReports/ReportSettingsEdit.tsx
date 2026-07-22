import React from 'react';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import useSeedFundReportSettings from 'src/hooks/useSeedFundReportSettings';
import { useOrganization } from 'src/providers';
import strings from 'src/strings';

import ReportSettingsEditForm from './ReportSettingsEditForm';

const ReportSettingsEdit = () => {
  const { selectedOrganization } = useOrganization();

  const { settings: reportsSettings } = useSeedFundReportSettings(selectedOrganization?.id);

  return (
    <TfMain>
      <PageHeader title={strings.REPORTS} />

      {reportsSettings && <ReportSettingsEditForm reportsSettings={reportsSettings} isEditing />}
    </TfMain>
  );
};

export default ReportSettingsEdit;

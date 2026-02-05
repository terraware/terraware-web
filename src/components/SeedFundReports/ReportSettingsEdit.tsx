import React, { useEffect } from 'react';

import { requestReportsSettings } from 'Settings/reportsSettingsThunks';

import PageHeader from 'src/components/PageHeader';
import TfMain from 'src/components/common/TfMain';
import { useOrganization } from 'src/providers';
import { selectReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

import ReportSettingsEditForm from './ReportSettingsEditForm';

const ReportSettingsEdit = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const reportsSettings = useAppSelector(selectReportsSettings);

  useEffect(() => {
    if (!reportsSettings && selectedOrganization) {
      void dispatch(requestReportsSettings(selectedOrganization.id));
    }
  }, [dispatch, reportsSettings, selectedOrganization]);

  return (
    <TfMain>
      <PageHeader title={strings.REPORTS} />

      {reportsSettings && <ReportSettingsEditForm reportsSettings={reportsSettings} isEditing />}
    </TfMain>
  );
};

export default ReportSettingsEdit;

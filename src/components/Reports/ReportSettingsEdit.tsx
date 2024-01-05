import React, { useEffect } from 'react';
import strings from 'src/strings';
import { useOrganization } from 'src/providers';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { selectReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsSelectors';
import { requestReportsSettings } from 'src/redux/features/reportsSettings/reportsSettingsThunks';
import PageHeader from 'src/components/seeds/PageHeader';
import TfMain from 'src/components/common/TfMain';
import ReportSettingsEditForm from './ReportSettingsEditForm';

const ReportSettingsEdit = () => {
  const dispatch = useAppDispatch();
  const { selectedOrganization } = useOrganization();

  const reportsSettings = useAppSelector(selectReportsSettings);

  useEffect(() => {
    if (!reportsSettings) {
      void dispatch(requestReportsSettings(selectedOrganization.id));
    }
  }, [dispatch, reportsSettings, selectedOrganization.id]);

  return (
    <TfMain>
      <PageHeader title={strings.REPORTS} />

      {reportsSettings && <ReportSettingsEditForm reportsSettings={reportsSettings} isEditing />}
    </TfMain>
  );
};

export default ReportSettingsEdit;

import React, { type JSX, useCallback } from 'react';

import { Box, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';

import useAcceleratorReportActions from 'src/hooks/useAcceleratorReportActions';
import useNavigateTo from 'src/hooks/useNavigateTo';
import useOneAcceleratorReport from 'src/hooks/useOneAcceleratorReport';
import useScrollRestoration from 'src/hooks/useScrollRestoration';
import { useLocalization, useUser } from 'src/providers';

import ReportOptionsMenu from './ReportOptionsMenu';
import ReportReviewButtons from './ReportReviewButtons';

type ReportActionsProps = {
  projectId: number;
  reportId: number;
};

const ReportActions = ({ projectId, reportId }: ReportActionsProps): JSX.Element => {
  const { strings } = useLocalization();
  const theme = useTheme();
  const { isAllowed } = useUser();
  const { goToAcceleratorProjectReportEdit } = useNavigateTo();

  const { isLoading } = useAcceleratorReportActions(reportId);

  // the report body runs this same query, so this is a cache read
  const { report } = useOneAcceleratorReport(reportId);

  const { remember } = useScrollRestoration(reportId, report !== undefined);

  const goToEdit = useCallback(() => {
    remember();
    goToAcceleratorProjectReportEdit(reportId, projectId);
  }, [goToAcceleratorProjectReportEdit, projectId, remember, reportId]);

  return (
    <Box display='flex' gap={theme.spacing(1)} justifyContent='flex-end'>
      {isAllowed('EDIT_REPORTS') && (
        <Button
          disabled={isLoading}
          icon='iconEdit'
          label={strings.EDIT}
          onClick={goToEdit}
          priority='secondary'
          size='medium'
        />
      )}

      <ReportReviewButtons reportId={reportId} />

      <ReportOptionsMenu projectId={projectId} reportId={reportId} />
    </Box>
  );
};

export default ReportActions;

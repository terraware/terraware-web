import React, { useEffect, useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import ReportForm from './ReportForm';
import { APP_PATHS } from 'src/constants';
import { Box, Typography, useTheme } from '@mui/material';
import { Report } from 'src/types/Report';
import ReportService from 'src/services/ReportService';
import { useHistory, useParams } from 'react-router-dom';
import { Button } from '@terraware/web-components';
import BackToLink from 'src/components/common/BackToLink';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';
import useSnackbar from 'src/utils/useSnackbar';
import ConcurrentEditorWarningDialog from 'src/components/Reports/ConcurrentEditorWarningDialog';

export default function ReportView(): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();

  const reportIdInt = parseInt(reportId, 10);

  const theme = useTheme();

  const history = useHistory();

  const snackbar = useSnackbar();

  const [report, setReport] = useState<Report>();

  useEffect(() => {
    const getReport = async () => {
      const result = await ReportService.getReport(reportIdInt);
      if (result.requestSucceeded) {
        setReport(result.report);
      } else {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
      }
    };

    if (reportIdInt) {
      getReport();
    }
  }, [reportIdInt, snackbar]);

  const [showAnnual, setShowAnnual] = useState(false);

  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);

  const startEdit = () => {
    if (report?.lockedByUserId) {
      setConfirmEditDialogOpen(true);
    } else {
      confirmEdit();
    }
  };

  const confirmEdit = async () => {
    // lock the report
    const lockResult = await ReportService.forceLockReport(reportIdInt);

    if (lockResult.requestSucceeded) {
      // then navigate to editing
      history.replace({ pathname: APP_PATHS.REPORTS_EDIT.replace(':reportId', reportId) });
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_EDIT);
    }
  };

  return (
    <TfMain>
      <ConcurrentEditorWarningDialog
        open={confirmEditDialogOpen}
        lockedBy={report?.lockedByName ?? ''}
        onClose={() => setConfirmEditDialogOpen(false)}
        onCancel={() => setConfirmEditDialogOpen(false)}
        onConfirm={confirmEdit}
      />
      <Box display='flex' flexDirection='column'>
        <Box paddingLeft={theme.spacing(3)}>
          <BackToLink id='backToReports' name={strings.REPORTS} to={APP_PATHS.REPORTS} />
        </Box>
        <Box display='flex' justifyContent='space-between' padding={theme.spacing(4, 3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {report ? `Report (${report?.year}-Q${report?.quarter})` : ''}
          </Typography>
          {report?.status !== 'Submitted' && <Button label={strings.REPORT_EDIT} icon='iconEdit' onClick={startEdit} />}
        </Box>
      </Box>
      {report &&
        (showAnnual ? (
          <ReportFormAnnual report={report} />
        ) : (
          <ReportForm
            editable={false}
            draftReport={report}
            allSeedbanks={report.seedBanks}
            allNurseries={report.nurseries}
            allPlantingSites={report.plantingSites}
          />
        ))}
      <Box display='flex' justifyContent='flex-end'>
        {report?.isAnnual &&
          (showAnnual ? (
            <Button label={strings.BACK} type='passive' onClick={() => setShowAnnual(false)} />
          ) : (
            <Button label={strings.NEXT} type='passive' onClick={() => setShowAnnual(true)} />
          ))}
      </Box>
    </TfMain>
  );
}

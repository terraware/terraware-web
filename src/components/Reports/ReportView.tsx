import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Box, Typography, useTheme } from '@mui/material';
import { Button } from '@terraware/web-components';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import { APP_PATHS } from 'src/constants';
import { Report } from 'src/types/Report';
import ReportService from 'src/services/ReportService';
import BackToLink from 'src/components/common/BackToLink';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';
import useSnackbar from 'src/utils/useSnackbar';
import ConcurrentEditorWarningDialog from 'src/components/Reports/ConcurrentEditorWarningDialog';
import useReportFiles from 'src/components/Reports/useReportFiles';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import ReportForm from './ReportForm';

export default function ReportView(): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();
  const history = useHistory();
  const snackbar = useSnackbar();

  const [report, setReport] = useState<Report>();
  const [showAnnual, setShowAnnual] = useState(false);
  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);

  const initialReportFiles = useReportFiles(report);

  const reportIdInt = parseInt(reportId, 10);
  const reportName = `Report (${report?.year}-Q${report?.quarter}) ` + (report?.projectName ?? '');

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
      void getReport();
    }
  }, [reportIdInt, snackbar]);

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

  const startEdit = () => {
    if (report?.lockedByUserId) {
      setConfirmEditDialogOpen(true);
    } else {
      void confirmEdit();
    }
  };

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const switchPages = (page: 'quarterly' | 'annual') => {
    setShowAnnual(page === 'annual');
    goToTop();
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
        <Box
          display='flex'
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent='space-between'
          padding={theme.spacing(4, 3)}
        >
          <Typography fontSize='24px' fontWeight={600}>
            {reportName}
          </Typography>
          <Box
            display='flex'
            gap={isMobile ? 0 : theme.spacing(1)}
            flexDirection={isMobile ? 'column' : 'row'}
            marginTop={isMobile ? theme.spacing(1) : theme.spacing(0)}
          >
            {report?.isAnnual &&
              (showAnnual ? (
                <Button
                  label={strings.REPORT_VIEW_QUARTERLY}
                  type='productive'
                  priority='secondary'
                  onClick={() => switchPages('quarterly')}
                />
              ) : (
                <Button
                  label={strings.REPORT_VIEW_ANNUAL}
                  type='productive'
                  priority='secondary'
                  onClick={() => switchPages('annual')}
                />
              ))}
            {report?.status !== 'Submitted' && (
              <Button label={strings.REPORT_EDIT} icon='iconEdit' onClick={startEdit} />
            )}
          </Box>
        </Box>
      </Box>
      {report &&
        (showAnnual ? (
          <ReportFormAnnual editable={false} report={report} initialReportFiles={initialReportFiles ?? []} />
        ) : (
          <ReportForm
            editable={false}
            draftReport={report}
            allSeedbanks={report.seedBanks}
            allNurseries={report.nurseries}
            allPlantingSites={report.plantingSites}
          />
        ))}
      <Box
        display='flex'
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent='flex-end'
        padding={theme.spacing(3)}
      >
        {report?.isAnnual &&
          (showAnnual ? (
            <Button
              label={strings.REPORT_VIEW_QUARTERLY}
              type='productive'
              priority='secondary'
              onClick={() => switchPages('quarterly')}
            />
          ) : (
            <Button
              label={strings.REPORT_VIEW_ANNUAL}
              type='productive'
              priority='secondary'
              onClick={() => switchPages('annual')}
            />
          ))}
      </Box>
    </TfMain>
  );
}

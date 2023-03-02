import React, { useEffect, useRef, useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import PageForm from 'src/components/common/PageForm';
import strings from 'src/strings';
import ReportForm from 'src/components/Reports/ReportForm';
import { Box, Typography, useTheme } from '@mui/material';
import ReportService from 'src/services/ReportService';
import { Report } from 'src/types/Report';
import { useHistory, useParams } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';
import { FormButton } from 'src/components/common/FormBottomBar';
import useSnackbar from 'src/utils/useSnackbar';
import SubmitConfirmationDialog from 'src/components/Reports/SubmitConfirmationDialog';
import { useUser } from 'src/providers';

export default function ReportEdit(): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();
  const reportIdInt = parseInt(reportId, 10);
  const { user } = useUser();

  const theme = useTheme();

  const history = useHistory();

  const snackbar = useSnackbar();

  const [report, setReport] = useState<Report>();

  const intervalref = useRef<number | null>(null);

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
    } else {
      snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_OPEN);
    }

    if (intervalref.current !== null) return;
    intervalref.current = window.setInterval(getReport, 600);

    return () => {
      if (intervalref.current) {
        window.clearInterval(intervalref.current);
        intervalref.current = null;
      }
    };
  }, [reportIdInt, snackbar]);

  useEffect(() => {
    if (report && user && report?.lockedByUserId !== user?.id) {
      if (intervalref.current) {
        window.clearInterval(intervalref.current);
        intervalref.current = null;
      }
      history.push(APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId).concat('?invalidEditor=true'));
    }
  }, [report, user, history, reportId]);

  const [showAnnual, setShowAnnual] = useState(false);

  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);

  const gotoReportView = async (saveChanges: boolean) => {
    let saveResult;
    if (saveChanges && report) {
      saveResult = await ReportService.updateReport(report);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }

    if (!saveResult || saveResult.requestSucceeded) {
      // unlock the report
      await ReportService.unlockReport(reportIdInt);

      // then navigate to view
      history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
    }
  };

  const handleSubmitButton = () => {
    setConfirmSubmitDialogOpen(true);
  };

  const handleSaveAndNext = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      setShowAnnual(true);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }
  };

  const handleBack = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      setShowAnnual(false);
      if (!saveResult.requestSucceeded) {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }
  };

  const submitReport = async () => {
    if (report) {
      const saveResult = await ReportService.updateReport(report);
      if (saveResult.requestSucceeded) {
        const submitResult = await ReportService.submitReport(reportIdInt);
        if (submitResult.requestSucceeded) {
          await ReportService.unlockReport(reportIdInt);
          history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
        } else {
          snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SUBMIT);
        }
      } else {
        snackbar.toastError(strings.GENERIC_ERROR, strings.REPORT_COULD_NOT_SAVE);
      }
    }
  };

  const rightButtons: FormButton[] = [];
  if (report?.isAnnual && showAnnual) {
    rightButtons.push({
      id: 'backToQuarterly',
      text: strings.BACK,
      onClick: handleBack,
      disabled: false,
      buttonType: 'passive',
    });
  }
  rightButtons.push({
    id: 'saveAndCloseReport',
    text: strings.REPORT_SAVE_AND_CLOSE,
    onClick: () => gotoReportView(true),
    disabled: false,
    buttonType: 'passive',
  });

  return (
    <TfMain>
      <SubmitConfirmationDialog
        open={confirmSubmitDialogOpen}
        onClose={() => setConfirmSubmitDialogOpen(false)}
        onCancel={() => setConfirmSubmitDialogOpen(false)}
        onSubmit={submitReport}
      />
      <Box padding={theme.spacing(3)}>
        <Typography fontSize='24px' fontWeight={600}>
          {report ? `Report (${report?.year}-Q${report?.quarter})` : ''}
        </Typography>
      </Box>
      {report && (
        <PageForm
          cancelID='cancelEdits'
          saveID='submitReport'
          onCancel={() => gotoReportView(false)}
          onSave={report.isAnnual ? (showAnnual ? handleSubmitButton : handleSaveAndNext) : handleSubmitButton}
          saveButtonText={
            report.isAnnual ? (showAnnual ? strings.REPORT_SUBMIT : strings.SAVE_AND_NEXT) : strings.REPORT_SUBMIT
          }
          cancelButtonText={strings.CANCEL}
          additionalRightButtons={rightButtons}
        >
          {report &&
            (showAnnual ? (
              <ReportFormAnnual editable={true} report={report} />
            ) : (
              <ReportForm editable={true} report={report} />
            ))}
        </PageForm>
      )}
    </TfMain>
  );
}

import React, { useEffect, useState } from 'react';
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
import { Button, DialogBox } from '@terraware/web-components';
import { FormButton } from 'src/components/common/FormBottomBar';

export default function ReportEdit(): JSX.Element {
  const { reportId } = useParams<{ reportId: string }>();
  const reportIdInt = parseInt(reportId, 10);

  const theme = useTheme();

  const history = useHistory();

  const [report, setReport] = useState<Report>();
  useEffect(() => {
    const getReport = async () => {
      const result = await ReportService.getReport(reportIdInt);
      if (result.requestSucceeded) {
        setReport(result.report);
      }
    };

    getReport();
  }, [reportIdInt]);

  const [showAnnual, setShowAnnual] = useState(false);

  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState(false);

  const gotoReportView = async (saveChanges: boolean) => {
    if (saveChanges && report) {
      await ReportService.updateReport(report);
    }

    // unlock the report
    await ReportService.unlockReport(reportIdInt);

    // then navigate to view
    history.replace({ pathname: APP_PATHS.REPORTS_VIEW.replace(':reportId', reportId) });
  };

  const handleSubmitButton = () => {
    setConfirmSubmitDialogOpen(true);
  };

  const handleSaveAndNext = async () => {
    if (report) {
      await ReportService.updateReport(report);
      setShowAnnual(true);
    }
  };

  const handleBack = async () => {
    if (report) {
      await ReportService.updateReport(report);
      setShowAnnual(false);
    }
  };

  const submitReport = async () => {
    if (report) {
      await ReportService.updateReport(report);
      await ReportService.submitReport(reportIdInt);
      await ReportService.unlockReport(reportIdInt);
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
      <DialogBox
        open={confirmSubmitDialogOpen}
        title={strings.REPORT_SUBMIT}
        size='medium'
        onClose={() => setConfirmSubmitDialogOpen(false)}
        middleButtons={[
          <Button
            id='cancelSubmitReport'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={() => setConfirmSubmitDialogOpen(false)}
            key='button-1'
          />,
          <Button id='confirmEdit' label={strings.REPORT_SUBMIT} onClick={submitReport} key='button-2' />,
        ]}
      >
        <Typography fontSize='16px' fontWeight={400}>
          {strings.REPORT_CONFIRM_SUBMIT}
        </Typography>
      </DialogBox>
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

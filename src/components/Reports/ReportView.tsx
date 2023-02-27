import React, { useEffect, useState } from 'react';
import TfMain from 'src/components/common/TfMain';
import strings from 'src/strings';
import ReportForm from './ReportForm';
import { APP_PATHS } from 'src/constants';
import { Box, Typography, useTheme } from '@mui/material';
import { Report } from 'src/types/Report';
import ReportService from 'src/services/ReportService';
import { useHistory, useParams } from 'react-router-dom';
import { Button, DialogBox } from '@terraware/web-components';
import BackToLink from 'src/components/common/BackToLink';
import ReportFormAnnual from 'src/components/Reports/ReportFormAnnual';

export default function ReportView(): JSX.Element {
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

  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);

  const startEdit = () => {
    if (report?.lockedByName) {
      setConfirmEditDialogOpen(true);
    } else {
      confirmEdit();
    }
  };

  const confirmEdit = async () => {
    // lock the report
    await ReportService.forceLockReport(reportIdInt);

    // then navigate to editing
    history.replace({ pathname: APP_PATHS.REPORTS_EDIT.replace(':reportId', reportId) });
  };

  return (
    <TfMain>
      <DialogBox
        open={confirmEditDialogOpen}
        title={strings.REPORT_CONCURRENT_EDITOR}
        size='medium'
        onClose={() => setConfirmEditDialogOpen(false)}
        middleButtons={[
          <Button
            id='cancelEditReport'
            label={strings.CANCEL}
            priority='secondary'
            type='passive'
            onClick={() => setConfirmEditDialogOpen(false)}
            key='button-1'
          />,
          <Button id='confirmEdit' label={strings.REPORT_EDIT} onClick={confirmEdit} key='button-2' />,
        ]}
      >
        <Typography fontSize='16px' fontWeight={400}>
          {strings.formatString(strings.REPORT_CONCURRENT_EDITOR_WARNING_1, report?.lockedByName ?? '')}
        </Typography>
        <Typography fontSize='16px' fontWeight={400}>
          {strings.REPORT_CONCURRENT_EDITOR_WARNING_2}
        </Typography>
      </DialogBox>
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
      {report && (showAnnual ? <ReportFormAnnual report={report} /> : <ReportForm report={report} />)}
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

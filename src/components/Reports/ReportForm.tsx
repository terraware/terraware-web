import React, { useState } from 'react';
import { Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';
import { Report } from 'src/types/Report';
import strings from 'src/strings';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';

const DEBOUNCE_TIME_MS = 500;

export type ReportFormProps = {
  editable?: boolean;
  report: Report;
  onChange?: (report: Report) => void;
  onUpdateReport?: (field: string, value: any) => void;
};

export default function ReportForm(props: ReportFormProps): JSX.Element {
  const { editable, report, onUpdateReport } = props;
  const theme = useTheme();
  const { isMobile } = useDeviceInfo();

  const [summaryOfProgress, setSummaryOfProgress] = useState(report.summaryOfProgress ?? '');
  useDebounce(summaryOfProgress, DEBOUNCE_TIME_MS, (value) => {
    if (onUpdateReport) {
      onUpdateReport('summaryOfProgress', value);
    }
  });

  const [projectNotes, setProjectNotes] = useState(report.notes ?? '');
  useDebounce(projectNotes, DEBOUNCE_TIME_MS, (value) => {
    if (onUpdateReport) {
      onUpdateReport('notes', value);
    }
  });

  return (
    <Grid
      container
      spacing={theme.spacing(3)}
      borderRadius={theme.spacing(3)}
      padding={theme.spacing(0, 3, 3, 0)}
      marginLeft={0}
      sx={{
        backgroundColor: theme.palette.TwClrBg,
      }}
    >
      <Grid item xs={12}>
        <Typography fontSize='20px' fontWeight={600}>
          {strings.PROJECT_INFORMATION}
        </Typography>
      </Grid>
      <Grid item xs={12} marginLeft={theme.spacing(-3)} marginTop={theme.spacing(-3)}>
        <OverviewItemCard isEditable={false} title={strings.ORGANIZATION} contents={report.organizationName ?? ''} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4} marginLeft={theme.spacing(-3)} marginTop={theme.spacing(-3)}>
        <OverviewItemCard isEditable={false} title={strings.SEED_BANKS} contents={`${report.totalSeedBanks}` ?? '0'} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4} marginLeft={theme.spacing(-3)} marginTop={theme.spacing(-3)}>
        <OverviewItemCard isEditable={false} title={strings.NURSERIES} contents={`${report.totalNurseries}` ?? '0'} />
      </Grid>
      <Grid item xs={isMobile ? 12 : 4} marginLeft={theme.spacing(-3)} marginTop={theme.spacing(-3)}>
        <OverviewItemCard
          isEditable={false}
          title={strings.PLANTING_SITES}
          contents={`${report.totalPlantingSites}` ?? '0'}
        />
      </Grid>
      <Grid item xs={12}>
        <Textfield
          label={strings.SUMMARY_OF_PROGRESS}
          placeholder={strings.SUMMARY_OF_PROGRESS_DESCRIPTION}
          id='summary'
          type='textarea'
          disabled={!editable}
          value={summaryOfProgress}
          onChange={(value) => setSummaryOfProgress(value as string)}
        />
      </Grid>
      <Grid item xs={12}>
        <Textfield
          label={strings.PROJECT_NOTES}
          id='notes'
          type='textarea'
          disabled={!editable}
          value={projectNotes}
          onChange={(value) => setProjectNotes(value as string)}
        />
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
          {strings.PROJECT_NOTES_DESCRIPTION}
        </Typography>
      </Grid>
    </Grid>
  );
}

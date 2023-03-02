import React, { useState } from 'react';
import { GetSeedBankV1 } from 'src/services/ReportService';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { DatePicker, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';
import { makeStyles } from '@mui/styles';

const DEBOUNCE_TIME_MS = 500;

const useStyles = makeStyles((theme: Theme) => ({
  infoCardStyle: {
    padding: 0,
  },
}));

export type SeedbankSectionProps = {
  editable: boolean;
  seedbank: GetSeedBankV1;
  onUpdateSeedbank: (seedbankField: string, value: any) => void;
  onUpdateSeedbankWorkers: (workersField: string, value: any) => void;
};

export default function SeedbankSection(props: SeedbankSectionProps): JSX.Element {
  const { editable, seedbank, onUpdateSeedbank, onUpdateSeedbankWorkers } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const [workersPaidEngaged, setWorkersPaidEngaged] = useState<number>(seedbank.workers?.paidWorkers ?? 0);
  const [workersPaidFemale, setWorkersPaidFemale] = useState<number>(seedbank.workers?.femalePaidWorkers ?? 0);
  const [workersVolunteer, setWorkersVolunteer] = useState<number>(seedbank.workers?.volunteers ?? 0);
  useDebounce(workersPaidEngaged, DEBOUNCE_TIME_MS, (value) => {
    onUpdateSeedbankWorkers('paidWorkers', value);
  });
  useDebounce(workersPaidFemale, DEBOUNCE_TIME_MS, (value) => {
    onUpdateSeedbankWorkers('femalePaidWorkers', value);
  });
  useDebounce(workersVolunteer, DEBOUNCE_TIME_MS, (value) => {
    onUpdateSeedbankWorkers('volunteers', value);
  });

  const [seedbankNotes, setSeedbankNotes] = useState(seedbank.notes ?? '');
  useDebounce(seedbankNotes, DEBOUNCE_TIME_MS, (value) => {
    onUpdateSeedbank('notes', value);
  });

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile ? 12 : 8);

  return (
    <>
      <Grid item xs={smallItemGridWidth()}>
        {editable && seedbank.buildStartedDateEditable ? (
          <DatePicker
            id={`${seedbank.id}-seedbank-buildStartDate`}
            label={strings.REPORT_SEEDBANK_BUILD_START_DATE}
            value={seedbank.buildStartedDate ?? ''}
            onChange={(value) => onUpdateSeedbank('buildStartedDate', value)}
            aria-label={`Build Start Date for Seedbank ${seedbank.name}`}
          />
        ) : (
          <OverviewItemCard
            isEditable={false}
            title={strings.REPORT_SEEDBANK_BUILD_START_DATE}
            contents={seedbank.buildStartedDate ?? ''}
            className={classes.infoCardStyle}
          />
        )}
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        {editable && seedbank.buildCompletedDateEditable ? (
          <DatePicker
            id={`${seedbank.id}-seedbank-buildCompletedDate`}
            label={strings.REPORT_SEEDBANK_BUILD_COMPLETION_DATE}
            value={seedbank.buildCompletedDate ?? ''}
            onChange={(value) => onUpdateSeedbank('buildCompletedDate', value)}
            aria-label={`Build Completed Date for Seedbank ${seedbank.name}`}
          />
        ) : (
          <OverviewItemCard
            isEditable={false}
            title={strings.REPORT_SEEDBANK_BUILD_COMPLETION_DATE}
            contents={seedbank.buildCompletedDate ?? ''}
            className={classes.infoCardStyle}
          />
        )}
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        {editable && seedbank.operationStartedDateEditable ? (
          <DatePicker
            id={`${seedbank.id}-seedbank-operationStartDate`}
            label={strings.REPORT_SEEDBANK_OPERATION_START_DATE}
            value={seedbank.operationStartedDate ?? ''}
            onChange={(value) => onUpdateSeedbank('operationStartedDate', value)}
            aria-label={`Operation Start Date for Seedbank ${seedbank.name}`}
          />
        ) : (
          <OverviewItemCard
            isEditable={false}
            title={strings.REPORT_SEEDBANK_OPERATION_START_DATE}
            contents={seedbank.operationStartedDate ?? ''}
            className={classes.infoCardStyle}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <OverviewItemCard
          isEditable={false}
          title={strings.TOTAL_SEEDS_STORED}
          contents={seedbank.totalSeedsStored.toString() ?? '0'}
          className={classes.infoCardStyle}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <Textfield
          label={strings.WORKERS_PAID_ENGAGED}
          id={`${seedbank.id}-workers-paid-engaged`}
          type='number'
          value={workersPaidEngaged}
          readonly={!editable}
          onChange={(value) => setWorkersPaidEngaged(value as number)}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <Textfield
          label={strings.WORKERS_PAID_FEMALE}
          id={`${seedbank.id}-workers-paid-female`}
          type='number'
          value={workersPaidFemale}
          readonly={!editable}
          onChange={(value) => setWorkersPaidFemale(value as number)}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <Textfield
          label={strings.WORKERS_VOLUNTEERS}
          id={`${seedbank.id}-workers-volunteer`}
          type='number'
          value={workersVolunteer}
          readonly={!editable}
          onChange={(value) => setWorkersVolunteer(value as number)}
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={strings.SEED_BANK_NOTES}
          id={`${seedbank.id}-notes`}
          type='textarea'
          disabled={!editable}
          value={seedbankNotes}
          onChange={(value) => setSeedbankNotes(value as string)}
        />
        <Typography color={theme.palette.TwClrTxtSecondary} fontSize='14px' fontWeight={400}>
          {strings.NOTE_ANY_ISSUES}
        </Typography>
      </Grid>
    </>
  );
}

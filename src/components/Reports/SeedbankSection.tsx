import React, { useState } from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { DatePicker, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';
import { makeStyles } from '@mui/styles';
import { ReportSeedBank } from 'src/types/Report';

const DEBOUNCE_TIME_MS = 500;

export type SeedbankSectionProps = {
  editable: boolean;
  seedbank: ReportSeedBank;
  onUpdateSeedbank: (seedbankField: string, value: any) => void;
  onUpdateSeedbankWorkers: (workersField: string, value: any) => void;
};

export default function SeedbankSection(props: SeedbankSectionProps): JSX.Element {
  const { editable, seedbank, onUpdateSeedbank, onUpdateSeedbankWorkers } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

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
        <InfoField
          id={`${seedbank.id}-seedbank-buildStartDate`}
          label={strings.REPORT_SEEDBANK_BUILD_START_DATE}
          editable={editable && seedbank.buildStartedDateEditable}
          value={seedbank.buildStartedDate ?? ''}
          onChange={(value) => onUpdateSeedbank('buildStartedDate', value)}
          type='date'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${seedbank.id}-seedbank-buildCompletedDate`}
          label={strings.REPORT_SEEDBANK_BUILD_COMPLETION_DATE}
          editable={editable && seedbank.buildCompletedDateEditable}
          value={seedbank.buildCompletedDate ?? ''}
          onChange={(value) => onUpdateSeedbank('buildCompletedDate', value)}
          type='date'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${seedbank.id}-seedbank-operationStartDate`}
          label={strings.REPORT_SEEDBANK_OPERATION_START_DATE}
          editable={editable && seedbank.buildCompletedDateEditable}
          value={seedbank.operationStartedDate ?? ''}
          onChange={(value) => onUpdateSeedbank('operationStartedDate', value)}
          type='date'
        />
      </Grid>
      <Grid item xs={12}>
        <OverviewItemCard
          isEditable={false}
          title={strings.TOTAL_SEEDS_STORED}
          contents={seedbank.totalSeedsStored.toString() ?? '0'}
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${seedbank.id}-workers-paid-engaged`}
          label={strings.WORKERS_PAID_ENGAGED}
          editable={editable}
          value={editable ? workersPaidEngaged : seedbank.workers.paidWorkers?.toString() ?? '0'}
          onChange={(value) => setWorkersPaidEngaged(value as number)}
          type='text'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${seedbank.id}-workers-paid-female`}
          label={strings.WORKERS_PAID_FEMALE}
          editable={editable}
          value={editable ? workersPaidFemale : seedbank.workers.femalePaidWorkers?.toString() ?? '0'}
          onChange={(value) => setWorkersPaidFemale(value as number)}
          type='text'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${seedbank.id}-workers-volunteer`}
          label={strings.WORKERS_VOLUNTEERS}
          editable={editable}
          value={editable ? workersVolunteer : seedbank.workers.volunteers?.toString() ?? '0'}
          onChange={(value) => setWorkersVolunteer(value as number)}
          type='text'
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
        <Typography
          color={theme.palette.TwClrTxtSecondary}
          fontSize='14px'
          fontWeight={400}
          marginTop={theme.spacing(0.5)}
        >
          {strings.NOTE_ANY_ISSUES}
        </Typography>
      </Grid>
    </>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  infoCardStyle: {
    padding: 0,
  },
}));

type InfoFieldProps = {
  id: string;
  label: string;
  editable: boolean;
  value: string | number;
  onChange: (value: any) => void;
  type: 'text' | 'date';
};

function InfoField(props: InfoFieldProps): JSX.Element {
  const { id, label, editable, value, onChange, type } = props;
  const classes = useStyles();
  return editable ? (
    type === 'text' ? (
      <Textfield label={label} id={id} type='number' value={value} readonly={!editable} onChange={onChange} />
    ) : type === 'date' ? (
      <DatePicker id={id} label={label} value={value as string} onChange={onChange} aria-label='date-picker' />
    ) : (
      <></>
    )
  ) : (
    <OverviewItemCard
      isEditable={false}
      title={label}
      contents={value.toString() ?? '0'}
      className={classes.infoCardStyle}
    />
  );
}

import React, { useState } from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { DatePicker, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';
import { makeStyles } from '@mui/styles';
import { ReportNursery, ReportSeedBank } from 'src/types/Report';

const DEBOUNCE_TIME_MS = 500;

export type LocationSectionProps = {
  editable: boolean;
  location: ReportSeedBank | ReportNursery;
  onUpdateLocation: (field: string, value: any) => void;
  onUpdateWorkers: (workersField: string, value: any) => void;
  locationType: 'seedBank' | 'nursery';
};

export default function LocationSection(props: LocationSectionProps): JSX.Element {
  const { editable, location, onUpdateLocation, onUpdateWorkers, locationType } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const [workersPaidEngaged, setWorkersPaidEngaged] = useState<number>(location.workers?.paidWorkers ?? 0);
  const [workersPaidFemale, setWorkersPaidFemale] = useState<number>(location.workers?.femalePaidWorkers ?? 0);
  const [workersVolunteer, setWorkersVolunteer] = useState<number>(location.workers?.volunteers ?? 0);
  useDebounce(workersPaidEngaged, DEBOUNCE_TIME_MS, (value) => {
    onUpdateWorkers('paidWorkers', value);
  });
  useDebounce(workersPaidFemale, DEBOUNCE_TIME_MS, (value) => {
    onUpdateWorkers('femalePaidWorkers', value);
  });
  useDebounce(workersVolunteer, DEBOUNCE_TIME_MS, (value) => {
    onUpdateWorkers('volunteers', value);
  });

  const [locationNotes, setLocationNotes] = useState(location.notes ?? '');
  useDebounce(locationNotes, DEBOUNCE_TIME_MS, (value) => {
    onUpdateLocation('notes', value);
  });

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile ? 12 : 8);

  return (
    <>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-buildStartDate`}
          label={
            locationType === 'seedBank'
              ? strings.REPORT_SEEDBANK_BUILD_START_DATE
              : strings.REPORT_NURSERY_BUILD_START_DATE
          }
          editable={editable && location.buildStartedDateEditable}
          value={location.buildStartedDate ?? ''}
          onChange={(value) => onUpdateLocation('buildStartedDate', value)}
          type='date'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-buildCompletedDate`}
          label={
            locationType === 'seedBank'
              ? strings.REPORT_SEEDBANK_BUILD_COMPLETION_DATE
              : strings.REPORT_NURSERY_BUILD_COMPLETION_DATE
          }
          editable={editable && location.buildCompletedDateEditable}
          value={location.buildCompletedDate ?? ''}
          onChange={(value) => onUpdateLocation('buildCompletedDate', value)}
          type='date'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-operationStartDate`}
          label={
            locationType === 'seedBank'
              ? strings.REPORT_SEEDBANK_OPERATION_START_DATE
              : strings.REPORT_NURSERY_OPERATION_START_DATE
          }
          editable={editable && location.operationStartedDateEditable}
          value={location.operationStartedDate ?? ''}
          onChange={(value) => onUpdateLocation('operationStartedDate', value)}
          type='date'
        />
      </Grid>
      {locationType === 'seedBank' ? (
        <Grid item xs={12}>
          <OverviewItemCard
            isEditable={false}
            title={strings.TOTAL_SEEDS_STORED}
            contents={(location as ReportSeedBank).totalSeedsStored.toString() ?? '0'}
            className={classes.infoCardStyle}
          />
        </Grid>
      ) : (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-nursery-capacity`}
              label={strings.REPORT_NURSERY_CAPACITY}
              value={(location as ReportNursery).capacity ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('capacity', value)}
              type='text'
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.TOTAL_NUMBER_OF_PLANTS_PROPAGATED}
              contents={(location as ReportNursery).totalPlantsPropagated.toString() ?? '0'}
              className={classes.infoCardStyle}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <OverviewItemCard
              isEditable={false}
              title={strings.NURSERY_MORTALITY_RATE}
              contents={(location as ReportNursery).mortalityRate.toString() ?? '0'}
              className={classes.infoCardStyle}
            />
          </Grid>
        </>
      )}
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-workers-paid-engaged`}
          label={strings.WORKERS_PAID_ENGAGED}
          editable={editable}
          value={editable ? workersPaidEngaged : location.workers.paidWorkers?.toString() ?? '0'}
          onChange={(value) => setWorkersPaidEngaged(value as number)}
          type='text'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-paid-female`}
          label={strings.WORKERS_PAID_FEMALE}
          editable={editable}
          value={editable ? workersPaidFemale : location.workers.femalePaidWorkers?.toString() ?? '0'}
          onChange={(value) => setWorkersPaidFemale(value as number)}
          type='text'
        />
      </Grid>
      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-volunteer`}
          label={strings.WORKERS_VOLUNTEERS}
          editable={editable}
          value={editable ? workersVolunteer : location.workers.volunteers?.toString() ?? '0'}
          onChange={(value) => setWorkersVolunteer(value as number)}
          type='text'
        />
      </Grid>
      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={locationType === 'seedBank' ? strings.SEED_BANK_NOTES : strings.ADDITIONAL_NURSERY_NOTES}
          id={`${location.id}-notes`}
          type='textarea'
          disabled={!editable}
          value={locationNotes}
          onChange={(value) => setLocationNotes(value as string)}
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

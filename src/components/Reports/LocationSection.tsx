import React, { useState } from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { DatePicker, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import useDebounce from 'src/utils/useDebounce';
import { makeStyles } from '@mui/styles';
import { ReportNursery, ReportPlantingSite, ReportSeedBank } from 'src/types/Report';

const DEBOUNCE_TIME_MS = 500;

export type LocationSectionProps = {
  editable: boolean;
  location: ReportSeedBank | ReportNursery | ReportPlantingSite;
  onUpdateLocation: (field: string, value: any) => void;
  onUpdateWorkers: (workersField: string, value: any) => void;
  locationType: 'seedBank' | 'nursery' | 'plantingSite';
};

export default function LocationSection(props: LocationSectionProps): JSX.Element {
  const { editable, location, onUpdateLocation, onUpdateWorkers, locationType } = props;
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();

  const isSeedBank = locationType === 'seedBank';
  const isNursery = locationType === 'nursery';
  const isPlantingSite = locationType === 'plantingSite';

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

  const getNotesLabel = () => {
    if (isSeedBank) {
      return strings.SEED_BANK_NOTES;
    }
    if (isNursery) {
      return strings.ADDITIONAL_NURSERY_NOTES;
    }
    return strings.ADDITIONAL_PLANTING_SITES_NOTES;
  };

  return (
    <>
      {(isSeedBank || isNursery) && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-${locationType}-buildStartDate`}
              label={
                locationType === 'seedBank'
                  ? strings.REPORT_SEEDBANK_BUILD_START_DATE
                  : strings.REPORT_NURSERY_BUILD_START_DATE
              }
              editable={editable && (location as ReportSeedBank | ReportNursery).buildStartedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).buildStartedDate ?? ''}
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
              editable={editable && (location as ReportSeedBank | ReportNursery).buildCompletedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).buildCompletedDate ?? ''}
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
              editable={editable && (location as ReportSeedBank | ReportNursery).operationStartedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).operationStartedDate ?? ''}
              onChange={(value) => onUpdateLocation('operationStartedDate', value)}
              type='date'
            />
          </Grid>
        </>
      )}
      {isSeedBank && (
        <Grid item xs={12}>
          <OverviewItemCard
            isEditable={false}
            title={strings.TOTAL_SEEDS_STORED}
            contents={(location as ReportSeedBank).totalSeedsStored.toString() ?? '0'}
            className={classes.infoCardStyle}
          />
        </Grid>
      )}
      {isNursery && (
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
      {isPlantingSite && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-planting-site-area`}
              label={strings.TOTAL_PLANTING_SITE_AREA_HA}
              value={(location as ReportPlantingSite).totalPlantingSiteArea ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantingSiteArea', value)}
              type='text'
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-planted-area`}
              label={strings.TOTAL_PLANTED_AREA_HA}
              value={(location as ReportPlantingSite).totalPlantedArea ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantedArea', value)}
              type='text'
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}></Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-trees-planted`}
              label={strings.TOTAL_TREES_PLANTED}
              value={(location as ReportPlantingSite).totalTreesPlanted ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalTreesPlanted', value)}
              type='text'
              helper={strings.TOTAL_TREES_PLANTED_HELPER_TEXT}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-plants-planted`}
              label={strings.TOTAL_PLANTS_PLANTED}
              value={(location as ReportPlantingSite).totalPlantsPlanted ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantsPlanted', value)}
              type='text'
              helper={strings.TOTAL_PLANTS_PLANTED_HELPER_TEXT}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-mortality-rate`}
              label={strings.MORTALITY_RATE}
              value={(location as ReportPlantingSite).mortalityRate ?? ''}
              editable={editable}
              onChange={(value) => onUpdateLocation('mortalityRate', value)}
              type='text'
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
          label={getNotesLabel()}
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
  helper?: string;
};

function InfoField(props: InfoFieldProps): JSX.Element {
  const { id, label, editable, value, onChange, type, helper } = props;
  const classes = useStyles();
  return editable ? (
    type === 'text' ? (
      <Textfield
        label={label}
        id={id}
        type='number'
        value={value}
        readonly={!editable}
        onChange={onChange}
        helperText={helper}
      />
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

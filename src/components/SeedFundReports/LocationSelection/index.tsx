import React, { type JSX, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Textfield } from '@terraware/web-components';

import { InfoField } from 'src/components/SeedFundReports/LocationSelection/InfoField';
import LocationSectionNursery from 'src/components/SeedFundReports/LocationSelection/Nursery';
import LocationSectionPlantingSite from 'src/components/SeedFundReports/LocationSelection/PlantingSite';
import LocationSectionSeedBank from 'src/components/SeedFundReports/LocationSelection/SeedBank';
import {
  buildCompletedDateValid,
  buildStartedDateValid,
  operationStartedDateValid,
  transformNumericValue,
} from 'src/components/SeedFundReports/LocationSelection/util';
import strings from 'src/strings';
import { ReportNursery, ReportPlantingSite, ReportSeedBank } from 'src/types/Report';
import useDeviceInfo from 'src/utils/useDeviceInfo';

export type LocationSectionProps = {
  editable: boolean;
  location: ReportSeedBank | ReportNursery | ReportPlantingSite;
  onUpdateLocation: (field: string, value: any) => void;
  onUpdateWorkers: (workersField: string, value: any) => void;
  locationType: 'seedBank' | 'nursery' | 'plantingSite';
  validate?: boolean;
  projectName?: string;
};

export default function LocationSection(props: LocationSectionProps): JSX.Element {
  const { editable, location, onUpdateLocation, onUpdateWorkers, locationType, validate } = props;

  const { isMobile, isTablet } = useDeviceInfo();
  const theme = useTheme();

  const [paidWorkers, setPaidWorkers] = useState<number | null>(location.workers?.paidWorkers ?? null);
  const [femalePaidWorkers, setFemalePaidWorkers] = useState<number | null>(
    location.workers?.femalePaidWorkers ?? null
  );
  const [volunteers, setVolunteers] = useState<number | null>(location.workers?.volunteers ?? null);
  const [locationNotes, setLocationNotes] = useState(location.notes ?? '');

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile || isTablet ? 12 : 8);

  const getNotesLabel = () => {
    switch (locationType) {
      case 'seedBank': {
        return strings.SEED_BANK_NOTES;
      }
      case 'nursery': {
        return strings.ADDITIONAL_NURSERY_NOTES;
      }
      case 'plantingSite': {
        return strings.ADDITIONAL_PLANTING_SITES_NOTES;
      }
    }
  };

  return (
    <>
      {['seedBank', 'nursery'].includes(locationType) && (
        <>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-${locationType}-buildStartDate`}
              label={
                locationType === 'seedBank'
                  ? strings.REPORT_SEEDBANK_BUILD_START_DATE
                  : strings.FACILITY_BUILD_START_DATE_REQUIRED
              }
              editable={editable && (location as ReportSeedBank | ReportNursery).buildStartedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).buildStartedDate ?? ''}
              onChange={(value) => onUpdateLocation('buildStartedDate', value)}
              type='date'
              maxDate={(location as ReportSeedBank | ReportNursery).buildCompletedDate}
              errorText={
                validate && !(location as ReportSeedBank | ReportNursery).buildStartedDate
                  ? strings.REQUIRED_FIELD
                  : validate && !buildStartedDateValid(location as ReportSeedBank | ReportNursery)
                    ? strings.FACILITY_BUILD_START_DATE_INVALID
                    : ''
              }
            />
          </Grid>

          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-${locationType}-buildCompletedDate`}
              label={
                locationType === 'seedBank'
                  ? strings.REPORT_SEEDBANK_BUILD_COMPLETION_DATE
                  : strings.FACILITY_BUILD_COMPLETION_DATE_REQUIRED
              }
              editable={editable && (location as ReportSeedBank | ReportNursery).buildCompletedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).buildCompletedDate ?? ''}
              onChange={(value) => onUpdateLocation('buildCompletedDate', value)}
              type='date'
              minDate={(location as ReportSeedBank | ReportNursery).buildStartedDate}
              maxDate={(location as ReportSeedBank | ReportNursery).operationStartedDate}
              errorText={
                validate && !(location as ReportSeedBank | ReportNursery).buildCompletedDate
                  ? strings.REQUIRED_FIELD
                  : validate && !buildCompletedDateValid(location as ReportSeedBank | ReportNursery)
                    ? strings.FACILITY_BUILD_COMPLETION_DATE_INVALID
                    : ''
              }
            />
          </Grid>

          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-${locationType}-operationStartDate`}
              label={
                locationType === 'seedBank'
                  ? strings.REPORT_SEEDBANK_OPERATION_START_DATE
                  : strings.FACILITY_OPERATION_START_DATE_REQUIRED
              }
              editable={editable && (location as ReportSeedBank | ReportNursery).operationStartedDateEditable}
              value={(location as ReportSeedBank | ReportNursery).operationStartedDate ?? ''}
              onChange={(value) => onUpdateLocation('operationStartedDate', value)}
              type='date'
              minDate={(location as ReportSeedBank | ReportNursery).buildCompletedDate}
              errorText={
                validate && !(location as ReportSeedBank | ReportNursery).operationStartedDate
                  ? strings.REQUIRED_FIELD
                  : validate && !operationStartedDateValid(location as ReportSeedBank | ReportNursery)
                    ? strings.FACILITY_OPERATION_START_DATE_INVALID
                    : ''
              }
            />
          </Grid>
        </>
      )}

      {locationType === 'nursery' && <LocationSectionNursery {...props} />}
      {locationType === 'seedBank' && <LocationSectionSeedBank {...props} />}
      {locationType === 'plantingSite' && <LocationSectionPlantingSite {...props} />}

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-workers-paid-engaged`}
          label={strings.WORKERS_PAID_ENGAGED}
          editable={editable}
          value={editable ? paidWorkers ?? '' : location.workers.paidWorkers?.toString() ?? ''}
          minNum={0}
          onChange={(value) => {
            const newValue = transformNumericValue(value, { min: 0 });
            setPaidWorkers(newValue);
            onUpdateWorkers('paidWorkers', newValue);
          }}
          type='text'
          tooltipTitle={strings.REPORT_TOTAL_PAID_WORKERS_INFO}
          /* eslint-disable-next-line eqeqeq */
          errorText={validate && location.workers.paidWorkers == null ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-paid-female`}
          label={strings.WORKERS_PAID_FEMALE}
          editable={editable}
          value={editable ? femalePaidWorkers ?? '' : location.workers.femalePaidWorkers?.toString() ?? ''}
          minNum={0}
          onChange={(value) => {
            const newValue = transformNumericValue(value, { min: 0 });
            setFemalePaidWorkers(newValue);
            onUpdateWorkers('femalePaidWorkers', newValue);
          }}
          type='text'
          tooltipTitle={strings.REPORT_TOTAL_WOMEN_PAID_WORKERS_INFO}
          /* eslint-disable-next-line eqeqeq */
          errorText={validate && location.workers.femalePaidWorkers == null ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>

      <Grid item xs={smallItemGridWidth()}>
        <InfoField
          id={`${location.id}-${locationType}-volunteer`}
          label={strings.WORKERS_VOLUNTEERS}
          editable={editable}
          value={editable ? volunteers ?? '' : location.workers.volunteers?.toString() ?? ''}
          minNum={0}
          onChange={(value) => {
            const newValue = transformNumericValue(value, { min: 0 });
            setVolunteers(newValue);
            onUpdateWorkers('volunteers', newValue);
          }}
          type='text'
          tooltipTitle={strings.REPORT_TOTAL_VOLUNTEERS_INFO}
          /* eslint-disable-next-line eqeqeq */
          errorText={validate && location.workers.volunteers == null ? strings.REQUIRED_FIELD : ''}
        />
      </Grid>

      <Grid item xs={mediumItemGridWidth()}>
        <Textfield
          label={getNotesLabel()}
          id={`${location.id}-notes`}
          type='textarea'
          display={!editable}
          preserveNewlines={true}
          value={locationNotes}
          onChange={(value) => {
            setLocationNotes(value as string);
            onUpdateLocation('notes', value);
          }}
        />

        {editable && (
          <Typography
            color={theme.palette.TwClrTxtSecondary}
            fontSize='14px'
            fontWeight={400}
            marginTop={theme.spacing(0.5)}
          >
            {strings.NOTE_ANY_ISSUES}
          </Typography>
        )}
      </Grid>
    </>
  );
}

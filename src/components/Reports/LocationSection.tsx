import React, { useEffect, useMemo, useState } from 'react';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import { DatePicker, TableColumnType, Textfield } from '@terraware/web-components';
import strings from 'src/strings';
import OverviewItemCard from 'src/components/common/OverviewItemCard';
import { makeStyles } from '@mui/styles';
import { ReportNursery, ReportPlantingSite, ReportSeedBank } from 'src/types/Report';
import PlantingSiteSpeciesCellRenderer from './PlantingSitesSpeciesCellRenderer';
import Table from '../common/table';
import { useLocalization, useOrganization } from 'src/providers';
import { SpeciesService } from 'src/services';
import { Species } from 'src/types/Species';

type PlantingSiteSpecies = {
  id: number;
  name: string;
  growthForm?: string;
  mortalityRateInField?: number | undefined;
  mortalityRateInNursery?: number | undefined;
  totalPlanted?: number | undefined;
};

export type LocationSectionProps = {
  editable: boolean;
  location: ReportSeedBank | ReportNursery | ReportPlantingSite;
  onUpdateLocation: (field: string, value: any) => void;
  onUpdateWorkers: (workersField: string, value: any) => void;
  locationType: 'seedBank' | 'nursery' | 'plantingSite';
  validate?: boolean;
};

export default function LocationSection(props: LocationSectionProps): JSX.Element {
  const { editable, location, onUpdateLocation, onUpdateWorkers, locationType, validate } = props;
  const { isMobile, isTablet } = useDeviceInfo();
  const theme = useTheme();
  const classes = useStyles();
  const { selectedOrganization } = useOrganization();
  const { activeLocale } = useLocalization();

  const isSeedBank = locationType === 'seedBank';
  const isNursery = locationType === 'nursery';
  const isPlantingSite = locationType === 'plantingSite';

  const [paidWorkers, setPaidWorkers] = useState<number | null>(location.workers?.paidWorkers ?? null);
  const [femalePaidWorkers, setFemalePaidWorkers] = useState<number | null>(
    location.workers?.femalePaidWorkers ?? null
  );
  const [volunteers, setVolunteers] = useState<number | null>(location.workers?.volunteers ?? null);
  const [locationNotes, setLocationNotes] = useState(location.notes ?? '');

  const smallItemGridWidth = () => (isMobile ? 12 : 4);
  const mediumItemGridWidth = () => (isMobile || isTablet ? 12 : 8);

  const getNotesLabel = () => {
    if (isSeedBank) {
      return strings.SEED_BANK_NOTES;
    }
    if (isNursery) {
      return strings.ADDITIONAL_NURSERY_NOTES;
    }
    return strings.ADDITIONAL_PLANTING_SITES_NOTES;
  };

  const [allSpecies, setAllSpecies] = useState<Species[]>();
  const [plantingSiteSpecies, setPlantingSiteSpecies] = useState<PlantingSiteSpecies[]>([]);

  useEffect(() => {
    const populateSpecies = async () => {
      const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
      if (response.requestSucceeded) {
        setAllSpecies(response.species);
      }
    };
    if (isPlantingSite) {
      populateSpecies();
    }
  }, [isPlantingSite, selectedOrganization.id, location]);

  useEffect(() => {
    if (allSpecies && isPlantingSite) {
      const psSpecies: PlantingSiteSpecies[] = [];
      (location as ReportPlantingSite).species.forEach((iSpecies) => {
        const foundSpecies = allSpecies.find((serverSpecies) => serverSpecies.id === iSpecies.id);
        if (foundSpecies) {
          psSpecies.push({
            id: iSpecies.id,
            name: foundSpecies.scientificName,
            growthForm: foundSpecies.growthForm,
            mortalityRateInField: iSpecies.mortalityRateInField,
            totalPlanted: iSpecies.totalPlanted,
          });
        }
      });
      setPlantingSiteSpecies(psSpecies);
    }
  }, [allSpecies, isPlantingSite, location]);

  const columns: TableColumnType[] = useMemo(
    () =>
      activeLocale
        ? [
            {
              key: 'name',
              name: strings.SPECIES,
              type: 'string',
            },
            {
              key: 'growthForm',
              name: strings.GROWTH_FORM,
              type: 'string',
            },
            {
              key: 'totalPlanted',
              name: strings.TOTAL_PLANTED_REQUIRED,
              type: 'string',
            },
            { key: 'mortalityRateInField', name: strings.MORTALITY_RATE_IN_FIELD_REQUIRED, type: 'string' },
          ]
        : [],
    [activeLocale]
  );

  const onEditPlantingSiteReport = (species: PlantingSiteSpecies, fromColumn?: string, value?: any) => {
    if (fromColumn) {
      const speciesToEditIndex = (location as ReportPlantingSite).species.findIndex(
        (iSpecies) => iSpecies.id === species.id
      );
      const speciesToEdit = (location as ReportPlantingSite).species[speciesToEditIndex];

      const newSpecies = [...(location as ReportPlantingSite).species];
      const speciesModified = {
        ...speciesToEdit,
        [fromColumn as 'mortalityRateInField' | 'totalPlanted']: value,
      };

      newSpecies[speciesToEditIndex] = speciesModified;

      onUpdateLocation('species', newSpecies);
    }
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
              label={strings.NURSERY_CAPACITY_REQUIRED}
              value={(location as ReportNursery).capacity ?? ''}
              minNum={0}
              editable={editable}
              onChange={(value) => onUpdateLocation('capacity', transformNumericValue(value, { min: 0 }))}
              type='text'
              errorText={validate && (location as ReportNursery).capacity === null ? strings.REQUIRED_FIELD : ''}
              tooltipTitle={strings.REPORT_NURSERY_CAPACITY_INFO}
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
              contents={`${(location as ReportNursery).mortalityRate.toString() ?? '0'}%`}
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
              minNum={0}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantingSiteArea', transformNumericValue(value, { min: 0 }))}
              type='text'
              errorText={
                validate && (location as ReportPlantingSite).totalPlantingSiteArea === null
                  ? strings.REQUIRED_FIELD
                  : ''
              }
              tooltipTitle={strings.REPORT_TOTAL_PLANTING_SITE_AREA_INFO}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-planted-area`}
              label={strings.TOTAL_PLANTED_AREA_HA}
              value={(location as ReportPlantingSite).totalPlantedArea ?? ''}
              minNum={0}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantedArea', transformNumericValue(value, { min: 0 }))}
              type='text'
              errorText={
                validate && (location as ReportPlantingSite).totalPlantedArea === null ? strings.REQUIRED_FIELD : ''
              }
              tooltipTitle={strings.REPORT_TOTAL_PLANTED_AREA_INFO}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()} />
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-trees-planted`}
              label={strings.TOTAL_TREES_PLANTED}
              value={(location as ReportPlantingSite).totalTreesPlanted ?? ''}
              minNum={0}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalTreesPlanted', transformNumericValue(value, { min: 0 }))}
              type='text'
              helper={strings.TOTAL_TREES_PLANTED_HELPER_TEXT}
              errorText={
                validate && (location as ReportPlantingSite).totalTreesPlanted === null ? strings.REQUIRED_FIELD : ''
              }
              tooltipTitle={strings.REPORT_TOTAL_TREES_PLANTED_INFO}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-total-plants-planted`}
              label={strings.TOTAL_PLANTS_PLANTED}
              value={(location as ReportPlantingSite).totalPlantsPlanted ?? ''}
              minNum={0}
              editable={editable}
              onChange={(value) => onUpdateLocation('totalPlantsPlanted', transformNumericValue(value, { min: 0 }))}
              type='text'
              helper={strings.TOTAL_PLANTS_PLANTED_HELPER_TEXT}
              errorText={
                validate && (location as ReportPlantingSite).totalPlantsPlanted === null ? strings.REQUIRED_FIELD : ''
              }
              tooltipTitle={strings.REPORT_TOTAL_NON_TREES_PLANTED_INFO}
            />
          </Grid>
          <Grid item xs={smallItemGridWidth()}>
            <InfoField
              id={`${location.id}-mortality-rate`}
              label={strings.MORTALITY_RATE_PERCENT_REQUIRED}
              value={
                editable
                  ? (location as ReportPlantingSite).mortalityRate ?? ''
                  : (location as ReportPlantingSite).mortalityRate
                  ? `${(location as ReportPlantingSite).mortalityRate}%`
                  : ''
              }
              minNum={0}
              maxNum={100}
              editable={editable}
              onChange={(value) =>
                onUpdateLocation('mortalityRate', transformNumericValue(value, { min: 0, max: 100 }))
              }
              type='text'
              errorText={
                validate && (location as ReportPlantingSite).mortalityRate === null ? strings.REQUIRED_FIELD : ''
              }
              tooltipTitle={strings.REPORT_MORTALITY_RATE_INFO}
            />
          </Grid>
          {plantingSiteSpecies && (
            <Grid item xs={12} marginBottom={3}>
              <Table
                id='reports-species-table'
                columns={columns}
                rows={plantingSiteSpecies}
                Renderer={PlantingSiteSpeciesCellRenderer({ editMode: editable, validate })}
                showPagination={false}
                onSelect={onEditPlantingSiteReport}
                controlledOnSelect={true}
                orderBy={'species'}
                isClickable={() => false}
              />
            </Grid>
          )}
        </>
      )}
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
          errorText={validate && location.workers.paidWorkers === null ? strings.REQUIRED_FIELD : ''}
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
          errorText={validate && location.workers.femalePaidWorkers === null ? strings.REQUIRED_FIELD : ''}
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
          errorText={validate && location.workers.volunteers === null ? strings.REQUIRED_FIELD : ''}
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
  errorText?: string;
  minNum?: number;
  maxNum?: number;
  maxDate?: any;
  minDate?: any;
  tooltipTitle?: string;
};

function InfoField(props: InfoFieldProps): JSX.Element {
  const {
    id,
    label,
    editable,
    value,
    onChange,
    type,
    helper,
    errorText,
    minNum,
    maxNum,
    maxDate,
    minDate,
    tooltipTitle,
  } = props;
  const classes = useStyles();
  return editable ? (
    type === 'text' ? (
      <Textfield
        label={label}
        id={id}
        type='number'
        value={value}
        min={minNum}
        max={maxNum}
        display={!editable}
        onChange={onChange}
        helperText={helper}
        errorText={errorText}
        tooltipTitle={tooltipTitle}
      />
    ) : type === 'date' ? (
      <DatePicker
        id={id}
        label={label}
        value={value as string}
        onChange={onChange}
        aria-label='date-picker'
        errorText={errorText}
        maxDate={maxDate}
        minDate={minDate}
        helperText={tooltipTitle}
      />
    ) : (
      <></>
    )
  ) : (
    <OverviewItemCard
      isEditable={false}
      title={label}
      contents={value.toString() ?? '0'}
      className={classes.infoCardStyle}
      titleInfoTooltip={tooltipTitle}
    />
  );
}

export const buildStartedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let beforeBuildCompletedConditionMet = false;
  let beforeOpStartedConditionMet = false;
  if (loc.buildStartedDate && loc.buildCompletedDate) {
    beforeBuildCompletedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.buildCompletedDate);
  }
  if (loc.buildStartedDate && loc.operationStartedDate) {
    beforeOpStartedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.operationStartedDate);
  }
  return beforeBuildCompletedConditionMet && beforeOpStartedConditionMet;
};

export const buildCompletedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let afterStartConditionMet = false;
  let beforeOpStartedConditionMet = false;
  if (loc.buildStartedDate && loc.buildCompletedDate) {
    afterStartConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.buildCompletedDate);
  }
  if (loc.buildCompletedDate && loc.operationStartedDate) {
    beforeOpStartedConditionMet = Date.parse(loc.buildCompletedDate) <= Date.parse(loc.operationStartedDate);
  }
  return afterStartConditionMet && beforeOpStartedConditionMet;
};

export const operationStartedDateValid = (loc: ReportSeedBank | ReportNursery) => {
  let afterBuildStartedConditionMet = false;
  let afterBuildCompletedConditionMet = false;
  if (loc.buildStartedDate && loc.operationStartedDate) {
    afterBuildStartedConditionMet = Date.parse(loc.buildStartedDate) <= Date.parse(loc.operationStartedDate);
  }
  if (loc.buildCompletedDate && loc.operationStartedDate) {
    afterBuildCompletedConditionMet = Date.parse(loc.buildCompletedDate) <= Date.parse(loc.operationStartedDate);
  }
  return afterBuildStartedConditionMet && afterBuildCompletedConditionMet;
};

const transformNumericValue = (value: any, { min = -Infinity, max = Infinity }): number | null => {
  return value === '' ? null : Math.min(max, Math.max(min, Math.floor(value as number)));
};

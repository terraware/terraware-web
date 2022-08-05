import { Grid, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import { Accession } from 'src/api/types/accessions';
import MainPaper from 'src/components/MainPaper';
import PanelTitle from 'src/components/PanelTitle';
import strings from 'src/strings';
import useForm from 'src/utils/useForm';
import DatePicker from '../../common/DatePicker';
import Divisor from '../../common/Divisor';
import Dropdown from '../../common/Dropdown';
import Note from '../../common/Note';
import TextArea from '../../common/TextArea';
import TextField from '../../common/TextField';
import FooterButtons from '../accession/FooterButtons';
import { FieldError } from '../newAccession';
import { Unit } from '../nursery/NewTest';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ServerOrganization } from 'src/types/Organization';
import useDeviceInfo from 'src/utils/useDeviceInfo';

const useStyles = makeStyles((theme: Theme) => ({
  right: {
    marginLeft: 'auto',
  },
  alignMiddle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    paddingLeft: theme.spacing(1),
  },
  bold: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

interface Props {
  accession: Accession;
  onSubmit: (record: Accession) => void;
  organization?: ServerOrganization;
}

export default function ProcessingAndDrying({ accession, onSubmit, organization }: Props): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldError[]>([]);
  const { isMobile } = useDeviceInfo();

  React.useEffect(() => {
    setRecord(accession);
    if (isSaving) {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
    }
  }, [accession, isSaving, setRecord]);

  React.useEffect(() => {
    if (accession !== record) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [accession, record]);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onSubmitHandler = () => {
    if (record.processingMethod === 'Weight' && !record.initialQuantity?.quantity) {
      onTotalWeightGramsChange('quantity', '0');
    } else {
      setIsEditing(false);
      setIsSaving(true);
      setTimeout(() => onSubmit(record), 1000);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
  };
  const [estimatedSeedCount, setEstimatedSeedCount] = React.useState(calculteEstimatedSeedCount(record));

  const OnProcessingMethodChange = (id: string, value: unknown) => {
    if (value === 'Count') {
      setErrors([]);
      setRecord((previousRecord: Accession): Accession => {
        return {
          ...previousRecord,
          [id]: value,
          subsetWeight: undefined,
          subsetCount: undefined,
          initialQuantity: undefined,
        };
      });
    }
    if (value === 'Weight') {
      setRecord((previousRecord: Accession): Accession => {
        return { ...previousRecord, [id]: value, initialQuantity: undefined };
      });
    }
  };

  const onTotalWeightGramsChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (!value || value === '0') {
      if (errorIndex < 0) {
        newErrors.push({
          id,
          msg: strings.REQUIRED_FIELD,
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setErrors(newErrors);
    onInitialQuantityChange(id, value);
  };

  const onChangeWeightFields = (id: string, value: unknown) => {
    setRecord((previousRecord: Accession): Accession => {
      let newRecord = {
        ...previousRecord,
        [id]: value,
      };

      if (id === 'subsetWeight') {
        const newSubsetWeight = {
          units: previousRecord.subsetWeight?.units || previousRecord.initialQuantity?.units || weightValues[0].value,
          quantity: value as number,
        };
        newRecord = {
          ...previousRecord,
          subsetWeight: newSubsetWeight,
        };
      }

      setEstimatedSeedCount(calculteEstimatedSeedCount(newRecord));
      return newRecord;
    });
  };

  const getErrorText = (id: string) => {
    const error = errors.find((_error) => _error.id === id);

    return error ? error.msg : '';
  };

  const onInitialQuantityChange = (id: string, value: unknown) => {
    setRecord((previousRecord: Accession): Accession => {
      let newInitialQuantity = {
        units: previousRecord.initialQuantity?.units || 'Seeds',
        quantity: previousRecord.initialQuantity?.quantity || 0,
        [id]: value,
      };

      if (previousRecord.processingMethod === 'Weight') {
        newInitialQuantity = {
          units: previousRecord.initialQuantity?.units || weightValues[0].value,
          quantity: previousRecord.initialQuantity?.quantity || 0,
          [id]: value,
        };
      }

      const newRecord = {
        ...previousRecord,
        processingMethod: previousRecord.processingMethod || 'Count',
        initialQuantity: newInitialQuantity,
      };

      setEstimatedSeedCount(calculteEstimatedSeedCount(newRecord));
      return newRecord;
    });
  };

  const weightValues: Unit[] = [
    { label: strings.GRAMS, value: 'Grams' },
    { label: strings.MILLIGRAMS, value: 'Milligrams' },
    { label: strings.KILOGRAMS, value: 'Kilograms' },
    { label: strings.OUNCES, value: 'Ounces' },
    { label: strings.POUNDS, value: 'Pounds' },
  ];

  const isContributor = organization?.role === 'Contributor';

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MainPaper>
        <PanelTitle title={strings.PROCESSING_AND_DRYING} />
        <Typography component='p'>{strings.PROCESSING_AND_DRYING_DESCRIPTION}</Typography>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={gridSize()}>
            <Dropdown
              id='processingMethod'
              label={strings.QUANTIFY}
              selected={record.processingMethod || 'Count'}
              values={[
                { label: strings.SEED_COUNT, value: 'Count' },
                { label: strings.SEED_WEIGHT, value: 'Weight' },
              ]}
              onChange={OnProcessingMethodChange}
              disabled={(record.withdrawals && record.withdrawals.length > 0) || isContributor}
            />
          </Grid>
          {record.processingMethod === 'Weight' && (
            <Grid item xs={gridSize()}>
              <Dropdown
                id='units'
                label={strings.UNITS}
                selected={record.initialQuantity?.units || weightValues[0].value}
                values={weightValues}
                onChange={onTotalWeightGramsChange}
                disabled={isContributor}
              />
            </Grid>
          )}
          {(record.processingMethod === 'Count' || !record.processingMethod) && (
            <Grid item xs={gridSize()} className={classes.alignMiddle}>
              <TextField
                id='quantity'
                value={record.initialQuantity?.quantity}
                onChange={onInitialQuantityChange}
                label={strings.SEED_COUNT}
                type='Number'
                disabled={isContributor}
              />
            </Grid>
          )}
          {record.processingMethod === 'Weight' && (
            <>
              {isMobile ? null : <Grid item xs={4} />}
              <Grid item xs={gridSize()} wrap='nowrap' direction='column'>
                <Grid item>
                  <TextField
                    id='quantity'
                    value={record.initialQuantity?.quantity}
                    onChange={onTotalWeightGramsChange}
                    label={strings.TOTAL_WEIGHT_OF_SEEDS}
                    type='number'
                    required={true}
                    helperText={getErrorText('quantity') || strings.REQUIRED_FIELD}
                    error={getErrorText('quantity') ? true : false}
                    disabled={isContributor}
                  />
                </Grid>
              </Grid>
              <Grid item xs={gridSize()}>
                <TextField
                  id='subsetWeight'
                  value={record.subsetWeight?.quantity}
                  onChange={onChangeWeightFields}
                  label={strings.SUBSET_WEIGHT}
                  type='number'
                  disabled={isContributor}
                />
              </Grid>
              <Grid item xs={gridSize()}>
                <TextField
                  id='subsetCount'
                  value={record.subsetCount}
                  onChange={onChangeWeightFields}
                  label={strings.NUMBER_OF_SEEDS_IN_SUBSET}
                  type='number'
                  disabled={isContributor}
                />
              </Grid>
              <Grid item xs={gridSize()} className={classes.alignMiddle}>
                <TextField
                  id='estimatedSeedCount'
                  value={estimatedSeedCount}
                  disabled={true}
                  onChange={onChange}
                  label={strings.TOTAL_SEEDS_COUNT_ESTIMATION}
                  type='number'
                />
              </Grid>
            </>
          )}
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={gridSize()}>
            <Dropdown
              id='targetStorageCondition'
              label={strings.TARGET_RH}
              selected={record.targetStorageCondition || 'Refrigerator'}
              values={[
                { label: '30% refrigerated', value: 'Refrigerator' },
                { label: '40% frozen', value: 'Freezer' },
              ]}
              onChange={onChange}
              disabled={isContributor}
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={gridSize()}>
            <DatePicker
              id='dryingStartDate'
              value={record.dryingStartDate}
              onChange={onChange}
              label={strings.DRYING_START_DATE}
              aria-label='Drying start date'
              disabled={isContributor}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <DatePicker
              id='dryingEndDate'
              value={record.dryingEndDate}
              onChange={onChange}
              label={strings.ESTIMATED_DRYING_END_DATE}
              aria-label='Estimated drying end date'
              disabled={isContributor}
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={gridSize()}>
            <DatePicker
              id='dryingMoveDate'
              value={record.dryingMoveDate}
              onChange={onChange}
              label={strings.SCHEDULE_DATE_TO_MOVE}
              aria-label='Drying move date'
              disabled={isContributor}
            />
            <Typography component='p' variant='caption' className={classes.caption}>
              {strings.IF_APPLIES}
            </Typography>
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextArea
              id='processingNotes'
              value={record.processingNotes || ''}
              onChange={onChange}
              label={strings.NOTES}
              disabled={isContributor}
            />
          </Grid>
          <Grid item xs={gridSize()}>
            <TextField
              id='processingStaffResponsible'
              value={record.processingStaffResponsible}
              onChange={onChange}
              label={strings.PROCESSED_AND_DRIED_BY}
              disabled={isContributor}
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Note>{strings.PROCESSING_AND_DRYING_INFO}</Note>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item className={classes.right}>
            <FooterButtons
              errors={errors.length > 0}
              updating={true}
              isEditing={isEditing}
              isSaving={isSaving}
              isSaved={isSaved}
              nextStepTo='storage'
              nextStep={strings.NEXT_STORING}
              onSubmitHandler={onSubmitHandler}
              handleCancel={handleCancel}
            />
          </Grid>
        </Grid>
      </MainPaper>
    </LocalizationProvider>
  );
}

const calculteEstimatedSeedCount = (latestRecord: Accession): number | undefined => {
  const subsetCount = latestRecord.subsetCount;
  const totalWeightGrams = latestRecord.initialQuantity?.quantity;
  const subsetWeightGrams = latestRecord.subsetWeight?.quantity;
  if (subsetCount && totalWeightGrams && subsetWeightGrams) {
    return (subsetCount * totalWeightGrams) / subsetWeightGrams;
  }

  return undefined;
};

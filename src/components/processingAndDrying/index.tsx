import DayJSUtils from '@date-io/dayjs';
import { Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession } from '../../api/types/accessions';
import useForm from '../../utils/useForm';
import FooterButtons from '../accession/FooterButtons';
import Checkbox from '../common/Checkbox';
import DatePicker from '../common/DatePicker';
import Divisor from '../common/Divisor';
import Dropdown from '../common/Dropdown';
import Note from '../common/Note';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
    },
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
  })
);

interface Props {
  accession: Accession;
  onSubmit: (record: Accession) => void;
}

export default function ProcessingAndDrying({
  accession,
  onSubmit,
}: Props): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  React.useEffect(() => {
    setRecord(accession);
    if (isSaving) {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 1000);
    }
  }, [accession]);

  React.useEffect(() => {
    if (accession !== record) {
      setIsEditing(true);
    }
  }, [record]);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onSubmitHandler = () => {
    setIsEditing(false);
    setIsSaving(true);
    setTimeout(() => onSubmit(record), 1000);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
  };
  const [estimatedSeedCount, setEstimatedSeedCount] = React.useState(
    calculteEstimatedSeedCount(record)
  );

  const OnProcessingMethodChange = (id: string, value: unknown) => {
    if (value === 'Count') {
      setRecord({
        ...record,
        [id]: value,
        subsetWeightGrams: undefined,
        subsetCount: undefined,
        totalWeightGrams: undefined,
      });
    }
    if (value === 'Weight') {
      setRecord({ ...record, [id]: value, seedsCounted: undefined });
    }
  };

  const onChangeWeightFields = (id: string, value: unknown) => {
    const newRecord = {
      ...record,
      [id]: value,
    };

    setEstimatedSeedCount(calculteEstimatedSeedCount(newRecord));
    setRecord(newRecord);
  };

  type GerminationTestType = 'Lab' | 'Nursery';

  const onChangeGerminationTestType = (id: string, value: unknown) => {
    let germinationTestTypes = record.germinationTestTypes
      ? [...record.germinationTestTypes]
      : undefined;
    if (germinationTestTypes) {
      const index = germinationTestTypes.indexOf(id as GerminationTestType, 0);
      if (index !== -1 && value === false) {
        germinationTestTypes.splice(index, 1);
      }

      if (index == -1 && value === true) {
        germinationTestTypes.push(id as GerminationTestType);
      }
    } else {
      if (value === true) {
        germinationTestTypes = [id as GerminationTestType];
      }
    }
    setRecord({ ...record, germinationTestTypes: germinationTestTypes });
  };

  const isChecked = (id: GerminationTestType) => {
    const germinationTestTypes = record.germinationTestTypes;
    return germinationTestTypes?.includes(id);
  };

  return (
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <Paper className={classes.paper}>
        <Typography component='p' variant='h6' className={classes.bold}>
          Processing & Drying
        </Typography>
        <Typography component='p'>
          All the details about processing and drying the seeds.
        </Typography>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Dropdown
              id='processingMethod'
              label='Quantify'
              selected={record.processingMethod || 'Count'}
              values={[
                { label: 'Seeds count', value: 'Count' },
                { label: 'Seed weight', value: 'Weight' },
              ]}
              onChange={OnProcessingMethodChange}
            />
          </Grid>
          {(record.processingMethod === 'Count' ||
            !record.processingMethod) && (
            <Grid item xs={4} className={classes.alignMiddle}>
              <TextField
                id='seedsCounted'
                value={record.seedsCounted}
                onChange={onChange}
                label='Seed Count'
                type='Number'
              />
            </Grid>
          )}
          {record.processingMethod === 'Weight' && (
            <>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='subsetWeightGrams'
                  value={record.subsetWeightGrams}
                  onChange={onChangeWeightFields}
                  label='Subset’s weight'
                  type='number'
                />
              </Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='subsetCount'
                  value={record.subsetCount}
                  onChange={onChangeWeightFields}
                  label='# of seeds in subset'
                  type='number'
                />
              </Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='totalWeightGrams'
                  value={record.totalWeightGrams}
                  onChange={onChangeWeightFields}
                  label='Total weight of seeds'
                  type='number'
                />
              </Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='estimatedSeedCount'
                  value={estimatedSeedCount}
                  disabled={true}
                  onChange={onChange}
                  label='Total seeds count estimation'
                  type='number'
                />
              </Grid>
            </>
          )}
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component='p' variant='body1'>
              Viability test types
            </Typography>
            <Typography component='p' variant='body2'>
              Selecting either one will unlock a new option on the sidebar after
              you save the changes.
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Checkbox
            id='Nursery'
            name='nurseryGermination'
            label='Nursery Germination'
            value={isChecked('Nursery' as GerminationTestType)}
            onChange={onChangeGerminationTestType}
          />
          <Checkbox
            id='Lab'
            name='labGermination'
            label='Lab Germination'
            value={isChecked('Lab' as GerminationTestType)}
            onChange={onChangeGerminationTestType}
          />
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Dropdown
              id='targetStorageCondition'
              label='Target RH'
              selected={record.targetStorageCondition || 'Refrigerator'}
              values={[
                { label: '30% refrigerated', value: 'Refrigerator' },
                { label: '40% frozen', value: 'Freezer' },
              ]}
              onChange={onChange}
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <DatePicker
              id='dryingStartDate'
              value={record.dryingStartDate}
              onChange={onChange}
              label='Drying start date'
              aria-label='Drying start date'
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              id='dryingEndDate'
              value={record.dryingEndDate}
              onChange={onChange}
              label='Estimated drying end date'
              aria-label='Estimated drying end date'
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={8}>
            <DatePicker
              id='dryingMoveDate'
              value={record.dryingMoveDate}
              onChange={onChange}
              label='Schedule date to move from racks to dry cabinets'
              aria-label='Drying move date'
            />
            <Typography
              component='p'
              variant='caption'
              className={classes.caption}
            >
              (Only if it applies)
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
              label='Notes'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='processingStaffResponsible'
              value={record.processingStaffResponsible}
              onChange={onChange}
              label='Staff responsible'
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Note>
              By adding information about the processing/drying and saving the
              changes you will be automatically changing this accession’s state
              from Pending to, either, Processing, Processed, Drying or Dried,
              depeending on the information you fill in.
            </Note>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item className={classes.right}>
            <FooterButtons
              updating={true}
              isEditing={isEditing}
              isSaving={isSaving}
              isSaved={isSaved}
              nextStepTo='storage'
              nextStep='Next: Storing'
              onSubmitHandler={onSubmitHandler}
              handleCancel={handleCancel}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

const calculteEstimatedSeedCount = (
  latestRecord: Accession
): number | undefined => {
  const subsetCount = latestRecord.subsetCount;
  const totalWeightGrams = latestRecord.totalWeightGrams;
  const subsetWeightGrams = latestRecord.subsetWeightGrams;
  if (subsetCount && totalWeightGrams && subsetWeightGrams) {
    return (subsetCount * totalWeightGrams) / subsetWeightGrams;
  }
  return undefined;
};

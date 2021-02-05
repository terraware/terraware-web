import MomentUtils from '@date-io/moment';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { Accession } from '../../api/types/accessions';
import useForm from '../../utils/useForm';
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
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
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

  const OnProcessingMethodChange = (id: string, value: unknown) => {
    if (value === 'Count') {
      setRecord({
        ...record,
        [id]: value,
        subsetWeightGrams: undefined,
        subsetCount: undefined,
        totalWeightGrams: undefined,
        estimatedSeedCount: undefined,
      });
    }
    if (value === 'Weight') {
      setRecord({ ...record, [id]: value, seedsCounted: undefined });
    }
  };

  const calculteEstimatedSeedCount = (): number | undefined => {
    if (
      record.subsetCount &&
      record.totalWeightGrams &&
      record.subsetWeightGrams
    ) {
      return (
        (record.subsetCount * record.totalWeightGrams) /
        record.subsetWeightGrams
      );
    }
    return undefined;
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Paper className={classes.paper}>
        <Typography variant='h6' className={classes.bold}>
          Processing & Drying
        </Typography>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <DatePicker
              id='processingStartDate'
              value={record.processingStartDate}
              onChange={onChange}
              label='Processing start date'
              aria-label='Processing start date'
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <Dropdown
              id='processingMethod'
              label='Quantify'
              selected={record.processingMethod || 'Count'}
              values={[
                { label: 'Seeds count', value: 'Count' },
                { label: 'Seeds weight', value: 'Weight' },
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
                label='Seeds Count'
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
                  onChange={onChange}
                  label='Subset’s weight'
                />
              </Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='subsetCount'
                  value={record.subsetCount}
                  onChange={onChange}
                  label='Seeds on subset weighted'
                />
              </Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='totalWeightGrams'
                  value={record.totalWeightGrams}
                  onChange={onChange}
                  label='Total weight of seeds'
                />
              </Grid>
              <Grid item xs={4} className={classes.alignMiddle}>
                <TextField
                  id='estimatedSeedCount'
                  value={calculteEstimatedSeedCount()}
                  disabled={true}
                  onChange={onChange}
                  label='Total seeds count estimation'
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
          </Grid>
          <Grid item xs={12}>
            <Typography component='p' variant='body2'>
              Selecting either one will unlock a new option on the sidebar after
              you save the changes.
            </Typography>
          </Grid>
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
              label='Drying end date'
              aria-label='Drying end date'
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
              aria-label='Drying end date'
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
            <Chip
              id='submit'
              className={classes.submit}
              label='Save changes'
              clickable
              color='primary'
              onClick={() => onSubmit(record)}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

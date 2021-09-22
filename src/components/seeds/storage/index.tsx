import MomentUtils from '@date-io/moment';
import { CircularProgress, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React, { Suspense } from 'react';
import { Accession } from '../../../api/types/accessions';
import strings from '../../../strings';
import useForm from '../../../utils/useForm';
import Divisor from '../../common/Divisor';
import Note from '../../common/Note';
import TextArea from '../../common/TextArea';
import TextField from '../../common/TextField';
import FooterButtons from '../accession/FooterButtons';
import { FieldError } from '../newAccession';
import LocationDropdown from './LocationDropdown';
import { StorageStartDate } from './StorageStartDate';

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

export default function Storage({ accession, onSubmit }: Props): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [errors, setErrors] = React.useState<FieldError[]>([]);

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
    }
  }, [accession, record]);

  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
  };

  const onSubmitHandler = () => {
    setIsEditing(false);
    setIsSaving(true);
    setTimeout(() => onSubmit(record), 1000);
  };

  const refreshErrors = (newErrors: FieldError[]) => {
    const previousErrors = [...errors];
    previousErrors.forEach((error, index) => {
      if (error.id === 'storageStartDate') {
        if (newErrors.findIndex((error2) => error2.id === error.id) < 0) {
          previousErrors.splice(index, 1);
        }
      }
    });

    const combinedErrors = [...previousErrors, ...newErrors].filter(
      (error, index, self) =>
        index ===
        self.findIndex(
          (otherError) =>
            otherError.id === error.id && otherError.msg === error.msg
        )
    );
    setErrors(combinedErrors);
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Paper className={classes.paper}>
        <Typography variant='h6' className={classes.bold}>
          {strings.STORAGE}
        </Typography>
        <Typography component='p'>{strings.STORAGE_DESCRIPTION}</Typography>
        <Divisor />
        <Grid container spacing={4}>
          <StorageStartDate
            onChange={onChange}
            refreshErrors={refreshErrors}
            storageDate={record.storageStartDate}
          />
          <Grid item xs={4} />
          <Grid item xs={4} />
          <Grid item xs={4}>
            <TextField
              id='storagePackets'
              value={record.storagePackets}
              onChange={onChange}
              label={strings.NUMBER_OF_PACKETS}
              type='Number'
            />
          </Grid>
          <Grid item xs={4} />
          <Grid item xs={4} />
          <Suspense
            fallback={
              <Grid item xs={12}>
                <CircularProgress />
              </Grid>
            }
          >
            <LocationDropdown
              storageLocation={record.storageLocation}
              storageCondition={record.storageCondition}
              onChange={onChange}
            />
          </Suspense>
          <Grid item xs={12}>
            <TextArea
              id='storageNotes'
              value={record.storageNotes || ''}
              onChange={onChange}
              label={strings.NOTES}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='storageStaffResponsible'
              value={record.storageStaffResponsible}
              onChange={onChange}
              label={strings.STORED_BY}
            />
          </Grid>
          <Divisor />
          <Grid item xs={12}>
            <Note>{strings.STORAGE_INFO}</Note>
          </Grid>
          <Grid item className={classes.right}>
            <FooterButtons
              updating={true}
              isEditing={isEditing}
              isSaving={isSaving}
              isSaved={isSaved}
              nextStepTo='withdrawal'
              nextStep={strings.NEXT_WITHDRAWAL}
              onSubmitHandler={onSubmitHandler}
              handleCancel={handleCancel}
              errors={errors.length > 0}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

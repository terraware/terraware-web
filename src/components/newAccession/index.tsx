import DayJSUtils from '@date-io/dayjs';
import {
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Typography,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import dayjs from 'dayjs';
import React, { Suspense } from 'react';
import { Redirect, useHistory } from 'react-router-dom';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { getPhotoEndpoint, postAccession } from '../../api/accession';
import { Accession, NewAccession } from '../../api/types/accessions';
import snackbarAtom from '../../state/atoms/snackbar';
import searchSelector from '../../state/selectors/search';
import useForm from '../../utils/useForm';
import useStateLocation, { getLocation } from '../../utils/useStateLocation';
import FooterButtons from '../accession/FooterButtons';
import Checkbox from '../common/Checkbox';
import Divisor from '../common/Divisor';
import Note from '../common/Note';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';
import PageHeader from '../PageHeader';
import { AccessionDates } from './AccessionDates';
import SecondaryCollectors from './SecondaryCollectors';

const useStyles = makeStyles((theme) =>
  createStyles({
    mainContainer: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
    },
    closeIcon: {
      backgroundColor: theme.palette.common.white,
    },
    right: {
      marginLeft: 'auto',
    },
    listItem: {
      marginBottom: theme.spacing(1),
    },
    photoLink: {
      marginBottom: theme.spacing(1),
      color: theme.palette.neutral[800],
      textDecoration: 'underline',
    },
    bold: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

export default function NewAccessionWrapper(): JSX.Element {
  const [accessionNumber, setAccessionNumber] = React.useState<string>();
  const setSnackbar = useSetRecoilState(snackbarAtom);
  const resetSearch = useResetRecoilState(searchSelector);
  const classes = useStyles();
  const history = useHistory();
  const location = useStateLocation();

  const onSubmit = async (record: NewAccession) => {
    try {
      const accession = await postAccession(record);
      resetSearch();
      const { accessionNumber } = accession;
      setAccessionNumber(accessionNumber);
      setSnackbar({ type: 'success', msg: 'Accession saved' });
    } catch (ex) {
      setSnackbar({
        type: 'error',
        msg: 'An error occurred when saving the accession.',
      });
    }
  };

  if (accessionNumber) {
    return (
      <Redirect
        to={getLocation(
          `/accessions/${accessionNumber}/seed-collection`,
          location
        )}
      />
    );
  }

  return (
    <main>
      <PageHeader
        title='New Accession'
        subtitle='An accession number will be generated once you create the accession.'
        rightComponent={
          <Fab
            id='closenewAccession'
            size='small'
            aria-label='close'
            className={classes.closeIcon}
            onClick={() => {
              history.goBack();
            }}
          >
            <CloseIcon />
          </Fab>
        }
      />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <AccessionForm
              accession={{
                receivedDate: dayjs().format('YYYY-MM-DD'),
              }}
              onSubmit={onSubmit}
            />
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </Container>
    </main>
  );
}

interface Props<T extends NewAccession> {
  updating?: boolean;
  photoFilenames?: string[];
  accession: T;
  onSubmit: (record: T) => void;
}

type FieldError = {
  id: string;
  msg: string;
};
export function AccessionForm<T extends NewAccession>({
  updating,
  photoFilenames,
  accession,
  onSubmit,
}: Props<T>): JSX.Element {
  const classes = useStyles();

  const [record, setRecord, onChange] = useForm(accession);
  const [errors, setErrors] = React.useState<FieldError[]>([]);
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

  const handleCancel = () => {
    setIsEditing(false);
    setRecord(accession);
  };

  const onSubmitHandler = () => {
    setIsEditing(false);
    setIsSaving(true);
    setTimeout(() => onSubmit(record), 1000);
  };

  const OnNumberOfTreesChange = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (Number(value) < 0) {
      if (errorIndex < 0) {
        newErrors.push({
          id: id,
          msg: 'No negative numbers allowed',
        });
      }
    } else {
      if (errorIndex >= 0) {
        newErrors.splice(errorIndex, 1);
      }
    }
    setErrors(newErrors);
    onChange(id, value);
  };

  const getErrorText = (id: string) => {
    const error = errors.find((error) => error.id === id);
    return error ? error.msg : '';
  };

  const refreshErrors = (newErrors: FieldError[]) => {
    const previousErrors = [...errors];
    previousErrors.map((error, index) => {
      if (error.id === 'collectedDate' || error.id === 'receivedDate') {
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
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <Paper className={classes.paper}>
        <Typography variant='h6' className={classes.bold}>
          Seed Collection
        </Typography>
        <Typography component='p'>
          All the details about the species, date collected, collectors and the
          site location.
        </Typography>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              id='species'
              value={record.species}
              onChange={onChange}
              label='Species'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='family'
              value={record.family}
              onChange={onChange}
              label='Family'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <TextField
              id='numberOfTrees'
              value={record.numberOfTrees}
              onChange={OnNumberOfTreesChange}
              type='number'
              label='Number of trees'
              min={0}
              helperText={getErrorText('numberOfTrees')}
              error={getErrorText('numberOfTrees') ? true : false}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='founderId'
              value={record.founderId}
              onChange={onChange}
              label='Founder ID'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={12}>
            <Checkbox
              id='endangered'
              name='endangered'
              label='Endangered'
              value={record.endangered}
              onChange={onChange}
            />
            <Checkbox
              id='rare'
              name='rare'
              label='Rare'
              value={record.rare}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              id='fieldNotes'
              value={record.fieldNotes}
              onChange={onChange}
              label='Field notes'
            />
          </Grid>
        </Grid>
        <Divisor />
        <Suspense
          fallback={
            <Grid item xs={12}>
              <CircularProgress />
            </Grid>
          }
        >
          <AccessionDates
            collectedDate={record.collectedDate}
            receivedDate={record.receivedDate}
            refreshErrors={refreshErrors}
            onChange={onChange}
            disabled={accession.deviceInfo !== undefined}
          ></AccessionDates>
        </Suspense>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              id='primaryCollector'
              value={record.primaryCollector}
              onChange={onChange}
              label='Primary collector'
            />
          </Grid>
          <Grid item xs={4}>
            <SecondaryCollectors
              id='secondaryCollectors'
              secondaryCollectors={record.secondaryCollectors}
              onChange={onChange}
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              id='siteLocation'
              value={record.siteLocation}
              onChange={onChange}
              label='Site'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='landowner'
              value={record.landowner}
              onChange={onChange}
              label='Landowner'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={12}>
            <TextArea
              id='environmentalNotes'
              value={record.environmentalNotes}
              onChange={onChange}
              label='Environmental notes'
            />
          </Grid>
        </Grid>
        <Divisor />
        {!updating && (
          <Note>
            Information like Seed Bags, Photos and Geolocations can only be
            added via the Seed Collector Android app. All the other information
            about processing, drying, storage and withdrawals can be added after
            first creating the accession.
          </Note>
        )}
        {updating && (
          <Grid container spacing={4}>
            <Grid item xs={3}>
              <Typography
                component='p'
                variant='body2'
                className={classes.listItem}
              >
                Seed bags
              </Typography>
              {record.bagNumbers?.map((bag, index) => (
                <Typography
                  id={`bag${index}`}
                  key={index}
                  component='p'
                  variant='body1'
                  className={classes.listItem}
                >
                  {bag}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={5}>
              <Typography
                component='p'
                variant='body2'
                className={classes.listItem}
              >
                Photos
              </Typography>
              {photoFilenames?.map((photo, index) => (
                <Link
                  id={`photo-${index}`}
                  key={index}
                  target='_blank'
                  href={getPhotoEndpoint(
                    ((record as unknown) as Accession).accessionNumber,
                    photo
                  )}
                >
                  <Typography
                    component='p'
                    variant='body1'
                    className={classes.photoLink}
                  >
                    {photo}
                  </Typography>
                </Link>
              ))}
            </Grid>
            <Grid item xs={4}>
              <Typography
                component='p'
                variant='body2'
                className={classes.listItem}
              >
                Geolocations
              </Typography>
              {record.geolocations?.map((geolocation, index) => (
                <Typography
                  id={`location${index}`}
                  key={index}
                  component='p'
                  variant='body1'
                  className={classes.listItem}
                >
                  {`${geolocation.latitude}, ${geolocation.longitude}`}
                </Typography>
              ))}
            </Grid>
          </Grid>
        )}
        <Grid container spacing={4}>
          <Grid item className={classes.right}>
            <FooterButtons
              updating={updating}
              isEditing={isEditing}
              isSaving={isSaving}
              isSaved={isSaved}
              nextStepTo='processing-drying'
              nextStep='Next: Processing & Drying'
              onSubmitHandler={onSubmitHandler}
              handleCancel={handleCancel}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

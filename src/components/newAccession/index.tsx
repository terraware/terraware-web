import DayJSUtils from '@date-io/dayjs';
import {
  Chip,
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
import React from 'react';
import { Link as RouterLink, Redirect, useHistory } from 'react-router-dom';
import { useResetRecoilState, useSetRecoilState } from 'recoil';
import { getPhotoEndpoint, postAccession } from '../../api/accession';
import { Accession, NewAccession } from '../../api/types/accessions';
import snackbarAtom from '../../state/atoms/snackbar';
import searchSelector from '../../state/selectors/search';
import useForm from '../../utils/useForm';
import Checkbox from '../common/Checkbox';
import DatePicker from '../common/DatePicker';
import Divisor from '../common/Divisor';
import Note from '../common/Note';
import TextArea from '../common/TextArea';
import TextField from '../common/TextField';
import PageHeader from '../PageHeader';
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
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    cancel: {
      backgroundColor: theme.palette.grey[200],
    },
    listItem: {
      marginBottom: theme.spacing(1),
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
    return <Redirect to={`/accessions/${accessionNumber}/seed-collection`} />;
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

  React.useEffect(() => {
    setRecord(accession);
  }, [accession]);

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
      newErrors.splice(errorIndex, 1);
    }
    setErrors(newErrors);
    onChange(id, value);
  };

  const onChangeDate = (id: string, value: unknown) => {
    const newErrors = [...errors];
    const errorIndex = newErrors.findIndex((error) => error.id === id);
    if (dayjs(value as string).isAfter(dayjs())) {
      if (errorIndex < 0) {
        newErrors.push({
          id: id,
          msg: 'No future dates allowed',
        });
      }
    } else {
      newErrors.splice(errorIndex, 1);
    }
    setErrors(newErrors);
    onChange(id, value);
  };

  const getErrorText = (id: string) => {
    const error = errors.find((error) => error.id === id);
    return error ? error.msg : '';
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
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <DatePicker
              id='collectedDate'
              value={record.collectedDate}
              onChange={onChangeDate}
              label='Collected on'
              aria-label='collected on'
              maxDate={dayjs().format('YYYY-MM-DD')}
              helperText={getErrorText('collectedDate')}
              error={getErrorText('collectedDate') ? true : false}
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              id='receivedDate'
              value={record.receivedDate}
              onChange={onChangeDate}
              label='Received on'
              aria-label='received on'
              maxDate={dayjs().format('YYYY-MM-DD')}
              helperText={getErrorText('receivedDate')}
              error={getErrorText('receivedDate') ? true : false}
            />
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
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
                variant='body1'
                className={classes.listItem}
              >
                Seed bags
              </Typography>
              {record.bagNumbers?.map((bag, index) => (
                <Typography
                  id={`bag${index}`}
                  key={index}
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {bag}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={5}>
              <Typography
                component='p'
                variant='body1'
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
                    variant='body2'
                    className={classes.listItem}
                  >
                    {photo}
                  </Typography>
                </Link>
              ))}
            </Grid>
            <Grid item xs={4}>
              <Typography
                component='p'
                variant='body1'
                className={classes.listItem}
              >
                Geolocations
              </Typography>
              {record.geolocations?.map((geolocation, index) => (
                <Typography
                  id={`location${index}`}
                  key={index}
                  component='p'
                  variant='body2'
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
            {!updating && (
              <Link component={RouterLink} to='/'>
                <Chip
                  id='cancelButton'
                  className={classes.cancel}
                  label='Cancel'
                  clickable
                />
              </Link>
            )}

            <Chip
              id='saveAccession'
              className={classes.submit}
              label={updating ? 'Save changes' : 'Create accession'}
              clickable
              color='primary'
              onClick={() => onSubmit(record)}
              disabled={errors.length > 0}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

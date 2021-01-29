import MomentUtils from '@date-io/moment';
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
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { emptyAccession } from '../../api/fixture/accession';
import { Accession } from '../../api/types/accessions';
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
  })
);

const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();
export default function NewAccessionWrapper(): JSX.Element {
  const classes = useStyles();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = (record: Accession): void => {
    //
  };

  return (
    <main>
      <PageHeader
        title='New Accession'
        subtitle='An accession number will be generated once you create the accession.'
        rightComponent={
          <Fab
            size='small'
            aria-label='close'
            className={classes.closeIcon}
            onClick={() => (window.location.href = '/')}
          >
            <CloseIcon />
          </Fab>
        }
      />
      <Container maxWidth='lg' className={classes.mainContainer}>
        <Grid container spacing={3}>
          <Grid item xs={1}></Grid>
          <Grid item xs={10}>
            <NewAccessionForm accession={emptyAccession} onSubmit={onSubmit} />
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </Container>
    </main>
  );
}

interface Props {
  accession: Accession;
  onSubmit: (record: Accession) => void;
}

export function NewAccessionForm({ accession }: Props): JSX.Element {
  const classes = useStyles();
  const [record, setRecord] = useState(accession);

  const onChange = (id: string, value: unknown) => {
    setRecord({ ...record, [id]: value });
  };

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <Paper className={classes.paper}>
        <Typography component='p' variant='h6'>
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
              value={record.species || ''}
              onChange={onChange}
              label='Species'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='family'
              value={record.family || ''}
              onChange={onChange}
              label='Family'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <TextField
              id='trees'
              value={record.trees || ''}
              onChange={onChange}
              type='number'
              label='Number of trees'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='founder'
              value={record.founder || ''}
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
              value={record.endangered || false}
              onChange={onChange}
            />
            <Checkbox
              id='rare'
              name='rare'
              label='Rare'
              value={record.rare || false}
              onChange={onChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              id='fieldNotes'
              value={record.fieldNotes || ''}
              onChange={onChange}
              label='Field notes'
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <DatePicker
              id='collectedOn'
              value={record.collectedOn}
              onChange={onChange}
              label='Collected on'
              aria-label='collected on'
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              id='receivedOn'
              value={record.receivedOn}
              onChange={onChange}
              label='Received on'
              aria-label='received on'
            />
          </Grid>
          <Grid item xs={4}></Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              id='primaryCollector'
              value={record.primaryCollector || ''}
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
              id='site'
              value={record.site || ''}
              onChange={onChange}
              label='Site'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='landowner'
              value={record.landowner || ''}
              onChange={onChange}
              label='Landowner'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={12}>
            <TextArea
              id='notes'
              value={record.notes || ''}
              onChange={onChange}
              label='Environmental notes'
            />
          </Grid>
        </Grid>
        <Divisor />
        {!record.id && (
          <Note>
            Information like Seed Bags, Photos and Geolocations can only be
            added via the Seed Collector Android app. All the other information
            about processing, drying, storage and withdrawals can be added after
            first creating the accession.
          </Note>
        )}
        {record.id && (
          <Grid container spacing={4}>
            <Grid item xs={4}>
              <Typography
                component='p'
                variant='body1'
                className={classes.listItem}
              >
                Seed bags
              </Typography>
              {record.bags?.map((bag, index) => (
                <Typography
                  key={index}
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {bag}
                </Typography>
              ))}
            </Grid>
            <Grid item xs={4}>
              <Typography
                component='p'
                variant='body1'
                className={classes.listItem}
              >
                Photos
              </Typography>
              {record.photos?.map((photo, index) => (
                <Link
                  key={index}
                  href='#'
                  onClick={(event: React.SyntheticEvent) => {
                    preventDefault(event);
                  }}
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
                  key={index}
                  component='p'
                  variant='body2'
                  className={classes.listItem}
                >
                  {geolocation}
                </Typography>
              ))}
            </Grid>
          </Grid>
        )}
        <Grid container spacing={4}>
          <Grid item className={classes.right}>
            {!record.id && (
              <Link component={RouterLink} to='/'>
                <Chip
                  className={classes.cancel}
                  label='Cancel'
                  clickable
                  onClick={() => (window.location.href = '/')}
                />
              </Link>
            )}

            <Chip
              className={classes.submit}
              label={record.id ? 'Save changes' : 'Create accession'}
              clickable
              color='primary'
              onClick={() => {
                /* */
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </MuiPickersUtilsProvider>
  );
}

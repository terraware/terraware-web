import MomentUtils from '@date-io/moment';
import {
  Box,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import React, { useState } from 'react';
import { emptyAccession } from '../../api/fixture/accession';
import Checkbox from '../common/Checkbox';
import DatePicker from '../common/DatePicker';
import Divisor from '../common/Divisor';
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
    note: {
      borderRadius: 8,
      backgroundColor: theme.palette.grey[300],
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
    },
  })
);

export default function NewAccessionWrapper(): JSX.Element {
  const classes = useStyles();

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
            <AccessionProfile />
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>
      </Container>
    </main>
  );
}

export function AccessionProfile(): JSX.Element {
  const classes = useStyles();
  const [record, setRecord] = useState(emptyAccession);

  const onTextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRecord({ ...record, [event.target.id]: event.target.value });
  };

  const onBooleanChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setRecord({
      ...record,
      [event.target.id]: checked,
    });
  };

  const onDateChange = (id: string, date: MaterialUiPickersDate) => {
    setRecord({
      ...record,
      [id]: date?.toISOString(),
    });
  };

  const onSecondaryCollectorsChange = (value: string[]) => {
    setRecord({
      ...record,
      secondaryCollectors: value,
    });
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
              onChange={onTextChange}
              label='Species'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='family'
              value={record.family || ''}
              onChange={onTextChange}
              label='Family'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <TextField
              id='trees'
              value={record.trees || ''}
              onChange={onTextChange}
              type='number'
              label='Number of trees'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='founder'
              value={record.founder || ''}
              onChange={onTextChange}
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
              onChange={onBooleanChange}
            />
            <Checkbox
              id='rare'
              name='rare'
              label='Rare'
              value={record.rare || false}
              onChange={onBooleanChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              id='fieldNotes'
              value={record.fieldNotes || ''}
              onChange={onTextChange}
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
              onChange={(date) => onDateChange('collectedOn', date)}
              label='Collected on'
              KeyboardButtonProps={{
                'aria-label': 'collected on',
              }}
            />
          </Grid>
          <Grid item xs={4}>
            <DatePicker
              id='receivedOn'
              value={record.receivedOn}
              onChange={(date) => onDateChange('receivedOn', date)}
              label='Received on'
              KeyboardButtonProps={{
                'aria-label': 'received on',
              }}
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
              onChange={onTextChange}
              label='Primary collector'
            />
          </Grid>
          <Grid item xs={4}>
            <SecondaryCollectors
              secondaryCollectors={record.secondaryCollectors}
              onChange={onSecondaryCollectorsChange}
            />
          </Grid>
        </Grid>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <TextField
              id='site'
              value={record.site || ''}
              onChange={onTextChange}
              label='Site'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='landowner'
              value={record.landowner || ''}
              onChange={onTextChange}
              label='Landowner'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={12}>
            <TextArea
              id='notes'
              value={record.notes || ''}
              onChange={onTextChange}
              label='Environmental notes'
            />
          </Grid>
        </Grid>
        <Divisor />
        <Box className={classes.note}>
          <Typography component='p'>
            Information like Seed Bags, Photos and Geolocations can only be
            added via the Seed Collector Android app. All the other information
            about processing, drying, storage and withdrawals can be added after
            first creating the accession.
          </Typography>
        </Box>
        <Grid container spacing={4}>
          <Grid item className={classes.right}>
            <Chip
              className={classes.cancel}
              label='Cancel'
              clickable
              onClick={() => (window.location.href = '/')}
            />
            <Chip
              className={classes.submit}
              label='Create accession'
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

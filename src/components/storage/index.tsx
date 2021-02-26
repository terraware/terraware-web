import DayJSUtils from '@date-io/dayjs';
import { Chip, Grid, Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Accession } from '../../api/types/accessions';
import { ConditionType, Location } from '../../api/types/locations';
import locationsSelector from '../../state/selectors/locations';
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
  requestId: number;
}

export default function Storage({
  accession,
  onSubmit,
  requestId,
}: Props): JSX.Element {
  const classes = useStyles();
  const contents = useRecoilValue(locationsSelector(requestId));

  const [record, setRecord, onChange] = useForm(accession);
  React.useEffect(() => {
    setRecord(accession);
  }, [accession]);

  const generateLocationsValues = contents?.map((location: Location) => {
    return {
      label: location.storageLocation,
      value: location.storageLocation,
    };
  });

  const getConditionValue = (
    locationSelected: string
  ): ConditionType | undefined => {
    const location = contents?.find((location: Location) => {
      return location.storageLocation === locationSelected;
    });
    return location?.storageCondition;
  };

  const onStorageLocationChange = (id: string, value: string) => {
    setRecord({
      ...record,
      [id]: value,
      storageCondition: getConditionValue(value),
    });
  };

  return (
    <MuiPickersUtilsProvider utils={DayJSUtils}>
      <Paper className={classes.paper}>
        <Typography variant='h6' className={classes.bold}>
          Storage
        </Typography>
        <Typography component='p'>
          All the details about storing the seeds.
        </Typography>
        <Divisor />
        <Grid container spacing={4}>
          <Grid item xs={4}>
            <DatePicker
              id='storageStartDate'
              value={record.storageStartDate}
              onChange={onChange}
              label='Starting on'
              aria-label='Starting on'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <TextField
              id='storagePackets'
              value={record.storagePackets}
              onChange={onChange}
              label='Number of packets'
              type='Number'
            />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <Dropdown
              id='storageLocation'
              label='Location'
              selected={record.storageLocation || 'Refrigerator 1'}
              values={generateLocationsValues}
              onChange={onStorageLocationChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='storageCondition'
              value={record.storageCondition}
              onChange={onChange}
              label='Condition'
              disabled={true}
            />
          </Grid>
          <Grid item xs={12}>
            <TextArea
              id='storageNotes'
              value={record.storageNotes || ''}
              onChange={onChange}
              label='Notes'
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              id='storageStaffResponsible'
              value={record.storageStaffResponsible}
              onChange={onChange}
              label='Staff responsible'
            />
          </Grid>
          <Divisor />
          <Grid item xs={12}>
            <Note>
              By adding information about the storage and saving the changes you
              will be automatically changing this accession’s state from Pending
              to Stored.
            </Note>
          </Grid>
          <Grid item className={classes.right}>
            <Chip
              id='saveAccession'
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

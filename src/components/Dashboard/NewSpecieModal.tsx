import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { Plant } from '../../api/types/plant';
import { Species } from '../../api/types/species';
import speciesForChartSelector from '../../state/selectors/speciesForChart';
import strings from '../../strings';
import useForm from '../../utils/useForm';
import CancelButton from '../common/CancelButton';
import DialogCloseButton from '../common/DialogCloseButton';
import TextField from '../common/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    submit: {
      marginLeft: theme.spacing(2),
      color: theme.palette.common.white,
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingLeft: theme.spacing(2),
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(1),
    },
    paper: {
      minWidth: '500px',
    },
    container: {
      border: `1px solid ${theme.palette.grey[400]}`,
      borderRadius: '4px',
      display: 'block',
      padding: theme.spacing(1),
    },
  })
);

export interface Props {
  open: boolean;
  onClose: (specie?: Species) => void;
  value?: Plant;
}

const initPlant = (plant?: Plant): Plant => {
  return plant ?? { feature_id: 1 };
};

export default function NewSpecieModal(props: Props): JSX.Element {
  const classes = useStyles();
  const { onClose, open } = props;
  const [record, setRecord, onChange] = useForm<Plant>(initPlant(props.value));
  const [value, setValue] = React.useState('female');
  const speciesForChart = useRecoilValue(speciesForChartSelector);
  const species = speciesForChart[record.feature_id];

  React.useEffect(() => {
    if (props.open) {
      setRecord(initPlant(props.value));
    }
  }, [props.open, props.value, setRecord]);

  const handleCancel = () => {
    setRecord(initPlant(props.value));
    onClose();
  };

  const handleOk = () => {
    onClose(record);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Dialog
      onClose={handleCancel}
      disableEscapeKeyDown
      open={open}
      maxWidth='md'
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>
        <Typography variant='h6'>
          {species?.speciesName.name !== 'Other'
            ? strings.EDIT_SPECIES
            : strings.ADD_SPECIES}
        </Typography>
        <DialogCloseButton onClick={handleCancel} />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              id='name'
              value={record.label}
              onChange={onChange}
              label={strings.SPECIES_NAME}
              aria-label='Species Name'
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Typography component='p' variant='subtitle2'>
              OR
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <FormControl component='fieldset' className={classes.container}>
              <RadioGroup
                aria-label='gender'
                name='gender1'
                value={value}
                onChange={handleChange}
              >
                <FormControlLabel
                  value='female'
                  control={<Radio />}
                  label='Flower'
                />
                <FormControlLabel
                  value='male'
                  control={<Radio />}
                  label='Dododanea'
                />
                <FormControlLabel
                  value='other'
                  control={<Radio />}
                  label='Acacia'
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Box width={'100%'} className={classes.actions}>
          <Box>
            <CancelButton onClick={handleCancel} />
            <Chip
              id='saveSpecie'
              className={classes.submit}
              label={
                species?.speciesName.name !== 'Other'
                  ? strings.SAVE
                  : strings.ADD
              }
              clickable
              color='primary'
              onClick={handleOk}
            />
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
